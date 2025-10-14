// app/api/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { campaigns, posts, clips, accounts } from '@/db/schema/media';
import { eq, inArray } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      clipIds,
      accountIds,
      scheduleType,
      scheduledAt,
      frequency,
      settings,
    } = await req.json();

    // Validation
    if (!name || !clipIds || !accountIds || clipIds.length === 0 || accountIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create campaign
    const [campaign] = await db
      .insert(campaigns)
      .values({
        userId: 'anon',
        name,
        status: scheduleType === 'immediate' ? 'active' : 'draft',
        targetPlatforms: '[]', // Will be populated from accounts
        selectedAccounts: JSON.stringify(accountIds),
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        settings: JSON.stringify({
          frequency,
          ...settings,
        }),
      })
      .returning();

    // Get selected clips and accounts
    const selectedClips = await db
      .select()
      .from(clips)
      .where(inArray(clips.id, clipIds));

    const selectedAccounts = await db
      .select()
      .from(accounts)
      .where(inArray(accounts.id, accountIds));

    // Create posts for each clip-account combination
    const postsToCreate = [];
    
    for (const clip of selectedClips) {
      for (const account of selectedAccounts) {
        // Calculate schedule time based on frequency
        let scheduledFor = scheduledAt ? new Date(scheduledAt) : new Date();
        
        if (frequency === 'hourly') {
          // Distribute posts hourly
          const index = postsToCreate.length;
          scheduledFor = new Date(scheduledFor.getTime() + index * 60 * 60 * 1000);
        } else if (frequency === 'daily') {
          // Distribute posts daily
          const index = postsToCreate.length;
          scheduledFor = new Date(scheduledFor.getTime() + index * 24 * 60 * 60 * 1000);
        }

        const metadata = clip.metadata 
          ? (typeof clip.metadata === 'string' 
              ? JSON.parse(clip.metadata) 
              : clip.metadata) as Record<string, unknown>
          : {};
        const hashtags = Array.isArray(metadata.hashtags) 
          ? JSON.stringify(metadata.hashtags) 
          : '[]';
        
        postsToCreate.push({
          campaignId: campaign.id,
          clipId: clip.id,
          accountId: account.id,
          userId: 'anon',
          platform: account.platform,
          status: scheduleType === 'immediate' ? 'posting' : 'scheduled',
          scheduledFor,
          caption: clip.title,
          hashtags,
        });
      }
    }

    // Batch insert posts
    const createdPosts = await db
      .insert(posts)
      .values(postsToCreate)
      .returning();

    // If immediate posting, trigger posting process
    if (scheduleType === 'immediate') {
      // In production, this would trigger a background job
      // For now, we'll just mark it as active
      console.log(`Would start posting ${createdPosts.length} posts immediately`);
    }

    return NextResponse.json({
      success: true,
      campaign,
      postsCreated: createdPosts.length,
    });

  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

// Get all campaigns
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'anon';

    const allCampaigns = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, userId))
      .orderBy(campaigns.createdAt);

    // Get post counts for each campaign
    const campaignsWithStats = await Promise.all(
      allCampaigns.map(async (campaign) => {
        const campaignPosts = await db
          .select()
          .from(posts)
          .where(eq(posts.campaignId, campaign.id));

        const stats = {
          total: campaignPosts.length,
          scheduled: campaignPosts.filter(p => p.status === 'scheduled').length,
          posting: campaignPosts.filter(p => p.status === 'posting').length,
          posted: campaignPosts.filter(p => p.status === 'posted').length,
          failed: campaignPosts.filter(p => p.status === 'failed').length,
        };

        return {
          ...campaign,
          stats,
        };
      })
    );

    return NextResponse.json({
      success: true,
      campaigns: campaignsWithStats,
    });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// Delete campaign
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('id');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID required' },
        { status: 400 }
      );
    }

    // Delete campaign (cascade will delete related posts)
    await db
      .delete(campaigns)
      .where(eq(campaigns.id, campaignId));

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted',
    });

  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}