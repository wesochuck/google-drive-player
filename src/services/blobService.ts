export interface MediaFile {
  id: string;
  name: string;
  streamUrl: string;
  isFolder: boolean;
}

export const fetchPlaylist = async (prefix: string = ''): Promise<MediaFile[]> => {
  const url = prefix ? `/api/blobs?prefix=${encodeURIComponent(prefix)}` : '/api/blobs';
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch from Vercel Blob');
  }
  
  const data = await response.json();
  const mediaFiles: MediaFile[] = [];

  // Add folders
  if (data.folders) {
    for (const folder of data.folders) {
      mediaFiles.push({
        id: folder,
        name: folder.replace(prefix, '').replace('/', ''),
        streamUrl: '',
        isFolder: true,
      });
    }
  }

  // Add files
  if (data.blobs) {
    for (const blob of data.blobs) {
      const name = blob.pathname.replace(prefix, '');
      const isAudio = /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(name);

      if (!blob.pathname.endsWith('/') && isAudio) {
        mediaFiles.push({
          id: blob.pathname,
          name: name,
          streamUrl: blob.url,
          isFolder: false,
        });
      }
    }
  }

  // Sort folders first, then alphabetically by name
  return mediaFiles.sort((a, b) => {
    if (a.isFolder === b.isFolder) {
      return a.name.localeCompare(b.name);
    }
    return a.isFolder ? -1 : 1;
  });
};
