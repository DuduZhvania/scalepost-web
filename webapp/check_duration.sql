.headers on
.mode column
SELECT 
  id,
  fileName,
  duration,
  fileSize,
  createdAt
FROM media_assets 
ORDER BY createdAt DESC 
LIMIT 5;
