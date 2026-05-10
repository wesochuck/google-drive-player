import { describe, it, expect, vi } from 'vitest';
import { fetchPlaylist } from './driveService';

describe('driveService', () => {
  it('should fetch and map files correctly', async () => {
    const mockFiles = {
      files: [{ id: '1', name: 'song1.mp3' }]
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockFiles
    });

    const result = await fetchPlaylist('folder123', 'key456');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('song1.mp3');
    expect(result[0].streamUrl).toContain('1');
  });

  it('should throw an error if fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false
    });

    await expect(fetchPlaylist('folder123', 'key456')).rejects.toThrow('Failed to fetch from Google Drive');
  });
});
