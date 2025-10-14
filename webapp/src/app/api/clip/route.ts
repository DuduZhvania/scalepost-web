// app/api/clips/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mediaAssets, clips } from '@/db/schema/media';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { mediaAssetId } = await req.json();

    if (!mediaAssetId) {
      return NextResponse.json(
        { error: 'mediaAssetId is required' },
        { status: 400 }
      );
    }

    // Get the media asset
    const [asset] = await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, mediaAssetId))
      .limit(1);

    if (!asset) {
      return NextResponse.json(
        { error: 'Media asset not found' },
        { status: 404 }
      );
    }

    if (!asset.duration) {
      return NextResponse.json(
        { error: 'Video duration not available' },
        { status: 400 }
      );
    }

    // Update asset status to processing
    await db
      .update(mediaAssets)
      .set({ status: 'processing', updatedAt: new Date() })
      .where(eq(mediaAssets.id, mediaAssetId));

    // MOCK: Generate 5-10 random clips
    // In production, this would call OpusClip API or your own AI service
    const numClips = Math.floor(Math.random() * 6) + 5; // 5-10 clips
    const clipDuration = 30; // 30 seconds per clip
    const generatedClips = [];

    for (let i = 0; i < numClips; i++) {
      // Random start time ensuring we don't exceed video duration
      const maxStartTime = Math.max(0, asset.duration - clipDuration);
      const startTime = Math.floor(Math.random() * maxStartTime);
      const endTime = Math.min(startTime + clipDuration, asset.duration);
      
      // Mock virality score (0-100)
      const score = Math.floor(Math.random() * 40) + 60; // 60-100 range
      
      // Generate mock title and description
      const titles = [
        'This changed everything',
        'You need to hear this',
        'The secret they don\'t tell you',
        'This is insane',
        'Wait for it...',
        'This will blow your mind',
        'The truth about',
        'Watch until the end',
      ];
      
      const title = titles[Math.floor(Math.random() * titles.length)];
      
      const [clip] = await db
        .insert(clips)
        .values({
          mediaAssetId,
          userId: asset.userId,
          title: `${title} ${i + 1}`,
          description: `Clip ${i + 1} from ${asset.fileName}`,
          clipUrl: asset.fileUrl, // In production: URL to actual clipped video
          thumbnail: asset.thumbnail,
          startTime,
          endTime,
          duration: endTime - startTime,
          score,
          status: 'ready',
          metadata: JSON.stringify({
            captions: ['This is a mock caption'], // Would come from AI
            hashtags: ['#viral', '#trending', '#fyp'],
            suggestedPlatforms: ['tiktok', 'youtube', 'instagram'],
          }),
        })
        .returning();

      generatedClips.push(clip);
    }

    // Update asset status to ready
    await db
      .update(mediaAssets)
      .set({ status: 'ready', updatedAt: new Date() })
      .where(eq(mediaAssets.id, mediaAssetId));

    return NextResponse.json({
      success: true,
      message: `Generated ${numClips} clips`,
      clips: generatedClips,
    });

  } catch (error) {
    console.error('Error generating clips:', error);
    
    // Try to update status to failed
    try {
      const { mediaAssetId } = await req.json();
      await db
        .update(mediaAssets)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(eq(mediaAssets.id, mediaAssetId));
    } catch {
      // Ignore
    }

    return NextResponse.json(
      { error: 'Failed to generate clips' },
      { status: 500 }
    );
  }
}

// Get clips for a media asset
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaAssetId = searchParams.get('mediaAssetId');

    if (!mediaAssetId) {
      return NextResponse.json(
        { error: 'mediaAssetId is required' },
        { status: 400 }
      );
    }

    const generatedClips = await db
      .select()
      .from(clips)
      .where(eq(clips.mediaAssetId, mediaAssetId))
      .orderBy(clips.score); // Order by virality score

    return NextResponse.json({
      success: true,
      clips: generatedClips,
    });

  } catch (error) {
    console.error('Error fetching clips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clips' },
      { status: 500 }
    );
  }
}