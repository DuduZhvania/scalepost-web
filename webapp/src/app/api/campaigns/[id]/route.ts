// app/api/campaigns/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { campaigns } from '@/db/schema/media';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Validate ID
    if (!id) {
      return NextResponse.json(
        { error: 'Campaign ID required' },
        { status: 400 }
      );
    }

    // Update campaign
    const [updatedCampaign] = await db
      .update(campaigns)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id))
      .returning();

    if (!updatedCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
    });

  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

// Duplicate campaign
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'duplicate') {
      // Get original campaign
      const [originalCampaign] = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, id));

      if (!originalCampaign) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }

      // Create duplicate
      const [duplicatedCampaign] = await db
        .insert(campaigns)
        .values({
          userId: originalCampaign.userId,
          name: `${originalCampaign.name} (Copy)`,
          status: 'draft',
          targetPlatforms: originalCampaign.targetPlatforms,
          selectedAccounts: originalCampaign.selectedAccounts,
          scheduledAt: null,
          settings: originalCampaign.settings,
        })
        .returning();

      return NextResponse.json({
        success: true,
        campaign: duplicatedCampaign,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error duplicating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate campaign' },
      { status: 500 }
    );
  }
}

