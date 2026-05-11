import { list } from '@vercel/blob';

export default async function handler(req: any, res: any) {
  try {
    // If a folder prefix is provided in the query params
    const prefix = req.query.prefix || '';
    const { blobs, folders } = await list({
      prefix,
      mode: 'folded',
    });

    res.status(200).json({ blobs, folders });
  } catch (error) {
    console.error('Error listing blobs:', error);
    res.status(500).json({ error: 'Failed to list blobs' });
  }
}
