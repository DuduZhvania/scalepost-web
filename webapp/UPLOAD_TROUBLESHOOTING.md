# Upload Troubleshooting Guide

## Issue: "Upload failed - no result returned"

This error occurs when the UploadThing `startUpload` function doesn't return the expected file data. Here are the steps to fix it:

### 1. Check UploadThing Environment Variables

Make sure you have the UploadThing token set in your `.env.local` file:

**For UploadThing v7.x (current version):**
```bash
UPLOADTHING_TOKEN='your_token_here'
```

**For UploadThing v6.x (older version):**
```bash
UPLOADTHING_SECRET=your_secret_key_here
UPLOADTHING_APP_ID=your_app_id_here
```

You can get your token from your UploadThing dashboard at https://uploadthing.com/dashboard

**Note:** The token is a base64-encoded JSON that includes your API key, app ID, and regions.

### 2. Verify UploadThing Configuration

The UploadThing setup requires:

**File: `src/app/api/uploadthing/core.ts`**
- File router configured with video support
- Middleware for validation
- onUploadComplete callback

**File: `src/app/api/uploadthing/route.ts`**
- Route handler properly exported (GET and POST)

**File: `src/lib/uploadthing.ts`**
- React helpers generated from file router

### 3. Check Browser Console

When you attempt an upload, check the browser console for:

1. **Upload result log**: Should show the array of uploaded files
2. **Uploaded file object log**: Should show the structure with `url`, `name`, `size`, `key`
3. **Any CORS errors**: UploadThing should be accessible

### 4. Network Tab

Check the Network tab in browser DevTools:

1. Look for POST requests to `/api/uploadthing`
2. Verify the response status is 200
3. Check if the response contains file data

### 5. Common Issues

#### Issue: Empty Result Array
**Cause**: UploadThing API not responding or authentication failed
**Fix**: 
- Verify environment variables are set
- Restart your development server after adding env vars
- Check UploadThing dashboard for API status

#### Issue: Result is undefined
**Cause**: Network error or API endpoint not found
**Fix**:
- Verify `/api/uploadthing/route.ts` exists
- Check that the route exports GET and POST
- Ensure Next.js is running properly

#### Issue: File uploads but no URL returned
**Cause**: Response structure mismatch
**Fix**:
- Check console logs for the actual response structure
- The code now handles multiple possible structures: `url`, `fileUrl`
- Verify UploadThing version matches expected API

### 6. Testing Steps

1. **Test with a single small file first** (under 10MB)
2. **Check console logs** - they will show:
   - "Upload result: [...]" 
   - "Uploaded file object: {...}"
3. **Verify the structure** - should contain at minimum:
   ```javascript
   {
     url: "https://...",
     name: "filename.mp4",
     size: 1234567,
     key: "unique-key"
   }
   ```

### 7. Alternative: Check UploadThing Version

Make sure you're using a compatible version of UploadThing:

```bash
npm list uploadthing @uploadthing/react
```

Expected versions:
- `uploadthing`: ^6.0.0 or higher
- `@uploadthing/react`: ^6.0.0 or higher

If outdated, update:
```bash
npm install uploadthing@latest @uploadthing/react@latest
```

### 8. Manual Test

To test if UploadThing is working at all, you can try a minimal upload:

```typescript
// In browser console
const file = document.querySelector('input[type="file"]').files[0];
const formData = new FormData();
formData.append('file', file);

fetch('/api/uploadthing', {
  method: 'POST',
  body: formData
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### 9. Debug Mode

The code now includes extensive logging. When you upload:

1. Check for "Upload result: ..." - this shows what UploadThing returned
2. Check for "Uploaded file object: ..." - this shows the first file's structure
3. Any errors will show the actual response structure

### 10. Contact Info

If none of these steps work:

1. Share the console logs from the upload attempt
2. Share the Network tab for the `/api/uploadthing` request/response
3. Verify your UploadThing account is active and has quota remaining
4. Check UploadThing status page: https://status.uploadthing.com

## Quick Fixes

### Fix 1: Restart Dev Server
After adding environment variables:
```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Fix 2: Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

### Fix 3: Verify File Router
Ensure `core.ts` is properly exporting:
```typescript
export const ourFileRouter = {
  mediaUploader: f({ video: { maxFileSize: "2GB", maxFileCount: 20 } })
    // ...
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```

### Fix 4: Check Package.json
Ensure these are in your dependencies:
```json
{
  "uploadthing": "^6.0.0",
  "@uploadthing/react": "^6.0.0"
}
```

## Success Indicators

When working correctly, you should see:

1. ✅ Console: "Upload result: [{url: '...', name: '...', ...}]"
2. ✅ Console: "Uploaded file object: {url: '...', ...}"
3. ✅ Progress bar reaches 100%
4. ✅ Green checkmark appears
5. ✅ File appears in Library
6. ✅ Database row created

If you see all of these, the upload system is working correctly!

