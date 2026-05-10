export interface DriveFile {
  id: string;
  name: string;
  streamUrl: string;
  isFolder: boolean;
}

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
}

interface GoogleDriveListResponse {
  files: GoogleDriveFile[];
}

export const fetchPlaylist = async (folderId: string, apiKey: string): Promise<DriveFile[]> => {
  const params = new URLSearchParams({
    q: `'${folderId}' in parents and (mimeType='audio/mpeg' or mimeType='application/vnd.google-apps.folder')`,
    key: apiKey,
    fields: 'files(id,name,mimeType)',
  });
  const url = `https://www.googleapis.com/drive/v3/files?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch from Google Drive');
  const data: GoogleDriveListResponse = await response.json();
  return data.files.map((file) => ({
    id: file.id,
    name: file.name,
    isFolder: file.mimeType === 'application/vnd.google-apps.folder',
    streamUrl: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${apiKey}`
  }));
};
