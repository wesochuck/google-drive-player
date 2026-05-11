export interface MediaFile {
  id: string;
  name: string;
  streamUrl: string;
  isFolder: boolean;
}

const AUDIO_FILE_REGEX = /\.(mp3|wav|ogg|m4a|aac|flac)$/i;

export const fetchPlaylist = async (guid: string, encodedSubPath: string = ''): Promise<MediaFile[]> => {
  const url = `/api/blobs?guid=${encodeURIComponent(guid)}&subpath=${encodeURIComponent(encodedSubPath)}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch from Vercel Blob');
  }
  
  const data = await response.json();
  const mediaFiles: MediaFile[] = [];
  
  const actualPrefix = data.basePrefix + (encodedSubPath ? atob(encodedSubPath) : '');

  if (data.folders) {
    for (const folder of data.folders) {
      mediaFiles.push({
        id: folder,
        name: folder.replace(actualPrefix, '').replace('/', ''),
        streamUrl: '',
        isFolder: true,
      });
    }
  }

  if (data.blobs) {
    for (const blob of data.blobs) {
      const name = blob.pathname.replace(actualPrefix, '');
      const isAudio = AUDIO_FILE_REGEX.test(name);

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

  return mediaFiles.sort((a, b) => {
    if (a.isFolder === b.isFolder) {
      return a.name.localeCompare(b.name);
    }
    return a.isFolder ? -1 : 1;
  });
};
