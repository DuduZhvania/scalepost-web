# Clickable Cards Fix - Proper Button Interaction

## Issue
The entire card was clickable and opened the video player, which prevented users from clicking other buttons like:
- Checkbox (select)
- Context menu (⋮)
- Action buttons (Generate, Delete, Rename, etc.)

## Root Cause
Cards had an `onClick` handler at the `<article>` level that captured all clicks, even though buttons had `event.stopPropagation()`. The card-level handler was interfering with normal button interactions.

## Solution

### Removed Card-Level Click Handler
**Before:**
```tsx
<article
  onClick={() => {
    setVideoPlayer({ ... }); // ← Opens video on any click
  }}
  className="... cursor-pointer"
>
```

**After:**
```tsx
<article
  className="..."  // ← No onClick, no cursor-pointer
>
```

### Made Only Play Button Clickable

Instead of making the whole card clickable, I made only the Play button overlay clickable:

```tsx
<button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    setVideoPlayer({
      isOpen: true,
      url: asset.url,
      title: friendlyName || "Video",
      duration: asset.durationS ?? undefined,
    });
  }}
  className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
  aria-label="Play video"
>
  <div className="flex h-16 w-16 ... opacity-0 group-hover:opacity-100">
    <Play className="h-8 w-8" />
  </div>
</button>
```

## Z-Index Layering

Cards now have proper layering:

```
z-0  : Card background
z-10 : Play button overlay (clickable area for video)
z-20 : Context menu dropdown
z-30 : Action buttons (checkbox, context trigger, etc.)
```

This ensures:
- ✅ Play button is clickable when hovered
- ✅ All action buttons are above play button
- ✅ Buttons work independently
- ✅ No click conflicts

## User Experience

### Before Fix
❌ Click anywhere on card → Opens video
❌ Can't click checkbox without opening video
❌ Can't click context menu without opening video
❌ Can't click action buttons without opening video
❌ Frustrating UX

### After Fix  
✅ Click card background → Nothing (select by checkbox)
✅ Click checkbox → Selects card only
✅ Click context menu → Opens menu only
✅ Click action buttons → Performs action only
✅ **Hover over card thumbnail → Play button appears**
✅ **Click Play button → Opens video player**
✅ Intuitive UX

## How to Watch Videos Now

### Option 1: Play Button (Recommended)
1. Hover over video/clip thumbnail
2. Play button appears with hover effect
3. Click the Play button
4. Video opens in player

### Option 2: Context Menu
1. Click the ⋮ menu button
2. Click "Watch Video" / "Open Clip"
3. Video opens in player

## Technical Implementation

### Video Cards (Assets)
**Location**: Line ~1721-1738

```tsx
<button
  onClick={(e) => {
    e.stopPropagation();
    setVideoPlayer({ ... });
  }}
  className="absolute inset-0 ... z-10"  // ← Lower than buttons (z-30)
>
  <Play /> {/* Visible on hover */}
</button>
```

### Clip Cards
**Location**: Line ~2352-2369

```tsx
<button
  onClick={(e) => {
    e.stopPropagation();
    setVideoPlayer({ ... });
  }}
  className="absolute inset-0 ... z-10"  // ← Lower than buttons (z-30)
>
  <Play /> {/* Visible on hover */}
</button>
```

## Benefits

✅ **Non-intrusive** - Play button only appears on hover
✅ **Clear intent** - Play icon clearly indicates action
✅ **All buttons work** - No click conflicts
✅ **Better UX** - Expected behavior
✅ **Accessible** - Keyboard and mouse friendly
✅ **Professional** - Standard video platform pattern

## Files Modified

- `/webapp/src/app/(dashboard)/library/page.tsx`
  - Removed onClick from `<article>` elements (video & clip cards)
  - Removed `cursor-pointer` class from cards
  - Made Play button overlay clickable instead
  - Added proper z-index layering

## Testing Checklist

- [x] Click checkbox → Selects only (doesn't open video)
- [x] Click context menu → Opens menu only
- [x] Click action buttons → Performs action only
- [x] Hover thumbnail → Play button appears
- [x] Click Play button → Opens video player
- [x] All buttons independently functional
- [x] No click conflicts
- [x] Works for both video and clip cards

## Accessibility

✅ **ARIA label** - "Play video" / "Play clip"
✅ **Keyboard accessible** - Can tab to Play button
✅ **Visual feedback** - Play button shows on hover
✅ **Semantic HTML** - Proper button elements
✅ **Clear intent** - Play icon indicates purpose

## Conclusion

The fix restores proper button functionality while still allowing users to watch videos by clicking the intuitive Play button that appears on hover. This matches the UX pattern of professional video platforms like YouTube, Vimeo, and Netflix.

All buttons now work correctly without conflicts! 🎯

