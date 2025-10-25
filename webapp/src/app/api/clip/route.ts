// app/api/clips/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { media_assets, clips } from '@/db/schema/media';
import { desc, eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { mediaAssetId, addFullVideo } = await req.json();

    if (!mediaAssetId) {
      return NextResponse.json(
        { error: 'mediaAssetId is required' },
        { status: 400 }
      );
    }

    // Get the media asset
    const [asset] = await db
      .select()
      .from(media_assets)
      .where(eq(media_assets.id, mediaAssetId))
      .limit(1);

    if (!asset) {
      return NextResponse.json(
        { error: 'Media asset not found' },
        { status: 404 }
      );
    }

    // If addFullVideo is true, add the entire video as a single clip
    if (addFullVideo) {
      // Use actual asset duration from database
      const duration = asset.duration;
      const thumbnail = asset.thumbnail;

      console.log('Creating clip from asset:', {
        assetId: asset.id,
        fileName: asset.fileName,
        duration: duration || 'unknown',
        thumbnail: thumbnail || 'none'
      });

      // If no duration, warn but allow creation
      // The UI will show "—" for duration which is acceptable
      if (!duration || duration === 0) {
        console.warn('⚠️ Creating clip without duration for asset:', asset.id, '- Consider re-uploading video');
      }

      const [clip] = await db
        .insert(clips)
        .values({
          mediaAssetId,
          userId: asset.userId,
          title: asset.fileName,
          description: `Full video: ${asset.fileName}`,
          clipUrl: asset.fileUrl,
          thumbnail: thumbnail || null,
          startTime: 0,
          endTime: duration || 0,
          duration: duration || 0,
          score: 75, // Default score for manually added clips
          status: 'ready',
          metadata: JSON.stringify({
            isFullVideo: true,
            addedManually: true,
            hasMetadata: !!(duration && thumbnail),
          }),
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: 'Video added to clips',
        clips: [clip],
      });
    }

    if (!asset.duration) {
      return NextResponse.json(
        { error: 'Video duration not available' },
        { status: 400 }
      );
    }

    // Update asset status to processing
    await db
      .update(media_assets)
      .set({ status: 'processing', updatedAt: new Date() })
      .where(eq(media_assets.id, mediaAssetId));

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
      .update(media_assets)
      .set({ status: 'ready', updatedAt: new Date() })
      .where(eq(media_assets.id, mediaAssetId));

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
        .update(media_assets)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(eq(media_assets.id, mediaAssetId));
    } catch {
      // Ignore
    }

    return NextResponse.json(
      { error: 'Failed to generate clips' },
      { status: 500 }
    );
  }
}

// Get clips for a media asset (or all clips if requested)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaAssetId = searchParams.get('mediaAssetId');
    const allClips = searchParams.get('all');

    if (allClips === '1') {
      const recentClips = await db
        .select({
          id: clips.id,
          mediaAssetId: clips.mediaAssetId,
          title: clips.title,
          clipUrl: clips.clipUrl,
          duration: clips.duration,
          thumbnail: clips.thumbnail,
          status: clips.status,
          createdAt: clips.createdAt,
          score: clips.score,
          assetFileName: media_assets.fileName,
          assetFileUrl: media_assets.fileUrl,
          assetFileSize: media_assets.fileSize,
          assetStatus: media_assets.status,
          assetType: media_assets.type,
        })
        .from(clips)
        .leftJoin(media_assets, eq(clips.mediaAssetId, media_assets.id))
        .orderBy(desc(clips.createdAt));

      return NextResponse.json({
        success: true,
        clips: recentClips,
      });
    }

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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const id = typeof body?.id === 'string' ? body.id.trim() : '';
    const title = typeof body?.title === 'string' ? body.title.trim() : '';

    if (!id) {
      return NextResponse.json(
        { error: 'Clip ID is required.' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'A non-empty title is required.' },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(clips)
      .set({ title, updatedAt: new Date() })
      .where(eq(clips.id, id))
      .returning({
        id: clips.id,
        title: clips.title,
        mediaAssetId: clips.mediaAssetId,
        clipUrl: clips.clipUrl,
        duration: clips.duration,
        thumbnail: clips.thumbnail,
        status: clips.status,
        createdAt: clips.createdAt,
        score: clips.score,
        updatedAt: clips.updatedAt,
      });

    if (!updated) {
      return NextResponse.json(
        { error: 'Clip not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      clip: {
        id: updated.id,
        title: updated.title,
        mediaAssetId: updated.mediaAssetId,
        clipUrl: updated.clipUrl,
        duration: updated.duration,
        thumbnail: updated.thumbnail,
        status: updated.status,
        createdAt:
          updated.createdAt instanceof Date
            ? updated.createdAt.toISOString()
            : typeof updated.createdAt === 'string'
              ? updated.createdAt
              : new Date().toISOString(),
        score: updated.score,
        updatedAt:
          updated.updatedAt instanceof Date
            ? updated.updatedAt.toISOString()
            : undefined,
      },
    });
  } catch (error) {
    console.error('Failed to rename clip:', error);
    return NextResponse.json(
      { error: 'Failed to rename clip.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clipId = searchParams.get('id');

    if (!clipId) {
      return NextResponse.json(
        { error: 'Clip ID is required' },
        { status: 400 }
      );
    }

    // First check if the clip exists
    const existingClip = await db
      .select({ id: clips.id })
      .from(clips)
      .where(eq(clips.id, clipId))
      .limit(1);

    if (!existingClip.length) {
      return NextResponse.json(
        { error: 'Clip not found' },
        { status: 404 }
      );
    }

    // Delete the clip (cascade will handle related posts)
    await db
      .delete(clips)
      .where(eq(clips.id, clipId));

    return NextResponse.json({ 
      success: true,
      message: 'Clip deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting clip:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('foreign key')) {
        return NextResponse.json(
          { error: 'Cannot delete clip: it is being used in active campaigns' },
          { status: 409 }
        );
      }
      if (error.message.includes('constraint')) {
        return NextResponse.json(
          { error: 'Cannot delete clip due to database constraints' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete clip. Please try again.' },
      { status: 500 }
    );
  }
}
