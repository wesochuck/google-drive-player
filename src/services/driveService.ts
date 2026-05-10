export interface DriveFile {
  id: string;
  name: string;
  streamUrl: string;
}

interface GoogleDriveFile {
  id: string;
  name: string;
}

interface GoogleDriveListResponse {
  files: GoogleDriveFile[];
}

export const fetchPlaylist = async (folderId: string, apiKey: string): Promise<DriveFile[]> => {
  const params = new URLSearchParams({
    q: `'${folderId}' in parents and mimeType='audio/mpeg'`,
    key: apiKey,
    fields: 'files(id,name)',
  });
  const url = `https://www.googleapis.com/drive/v3/files?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch from Google Drive');
  const data: GoogleDriveListResponse = await response.json();
  return data.files.map((file) => ({
    id: file.id,
    name: file.name,
    streamUrl: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${apiKey}`
  }));
};
