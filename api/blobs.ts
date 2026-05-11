import { list } from '@vercel/blob';
import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const accessKey = req.query.guid as string; // keeping the parameter name as guid for frontend compatibility
    const encodedSubPath = (req.query.subpath as string) || '';

    if (!accessKey) {
      return res.status(401).json({ error: 'Access key is required' });
    }

    // 1. Fetch all root folders
    const rootList = await list({
      mode: 'folded',
    });

    // 2. Find the folder whose MD5 hash matches the access key
    let basePrefix = '';
    
    if (rootList.folders) {
      for (const folder of rootList.folders) {
        // Remove trailing slash for the hash source
        const folderName = folder.replace(/\/$/, '');
        const hash = crypto.createHash('md5').update(folderName).digest('hex');
        
        if (hash === accessKey) {
          basePrefix = folder;
          break;
        }
      }
    }

    if (!basePrefix) {
      return res.status(401).json({ error: 'Invalid access key' });
    }

    // 3. Decode the subpath (Base64)
    let subPath = '';
    if (encodedSubPath) {
      subPath = Buffer.from(encodedSubPath, 'base64').toString('utf-8');
    }

    const actualPrefix = `${basePrefix}${subPath}`;

    // 4. Fetch the actual contents of the requested folder
    const { blobs, folders } = await list({
      prefix: actualPrefix,
      mode: 'folded',
    });

    res.status(200).json({ blobs, folders, basePrefix });
  } catch (error) {
    console.error('Error listing blobs:', error);
    res.status(500).json({ error: 'Failed to list blobs' });
  }
}
