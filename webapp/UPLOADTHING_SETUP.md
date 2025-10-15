# UploadThing Setup Guide

## Issue
Upload is failing with "Upload failed" error because UploadThing API credentials are not configured.

## Solution 1: Set Up UploadThing (Recommended for Production)

### Step 1: Create UploadThing Account
1. Go to https://uploadthing.com
2. Sign up for a free account
3. Create a new app

### Step 2: Get Your API Keys
1. In your UploadThing dashboard, go to API Keys
2. Copy your `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID`

### Step 3: Create Environment File
Create a file named `.env.local` in the `webapp` directory with:

```env
# UploadThing Configuration
UPLOADTHING_SECRET=sk_live_xxxxxxxxxxxxx
UPLOADTHING_APP_ID=xxxxxxxxxxxxx
```

### Step 4: Restart Your Server
```bash
npm run dev
```

Now uploads should work!

## Solution 2: Use Local File Storage (For Development)

If you want to avoid using UploadThing and just store files locally, I can modify the upload system to use Next.js API routes with local file storage instead.

This would:
- Store files in a `/public/uploads` directory
- Work completely offline
- Not require any third-party services
- Be simpler for local development

**Would you like me to implement the local file storage solution instead?**

## Current Setup

Your database is now configured correctly with SQLite and will save uploaded video metadata once UploadThing successfully uploads the files.

The upload flow is:
1. User selects video → UploadModal
2. File uploads to UploadThing servers → (FAILING HERE - needs API keys)
3. UploadThing calls onUploadComplete webhook → Saves to your SQLite database
4. UI refreshes and shows the uploaded video

## Quick Test

To verify your database is working, you can manually insert a test record:

```bash
sqlite3 sqlite.db "INSERT INTO media_assets (id, user_id, file_name, file_url, status, created_at, updated_at) VALUES ('test-456', 'anon', 'test.mp4', 'https://example.com/test.mp4', 'uploaded', strftime('%s','now')*1000, strftime('%s','now')*1000);"
```

Then refresh your library page - the test video should appear!

