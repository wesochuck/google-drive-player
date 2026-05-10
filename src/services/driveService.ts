export interface DriveFile {
  id: string;
  name: string;
  streamUrl: string;
}

export const fetchPlaylist = async (folderId: string, apiKey: string): Promise<DriveFile[]> => {
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType='audio/mpeg'&key=${apiKey}&fields=files(id,name)`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch from Google Drive');
  const data = await response.json();
  return data.files.map((file: any) => ({
    id: file.id,
    name: file.name,
    streamUrl: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${apiKey}`
  }));
};
