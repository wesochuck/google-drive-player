import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchPlaylist } from './blobService';

describe('fetchPlaylist', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should throw an error if the response is not ok', async () => {
    const mockFetch = vi.mocked(fetch).mockResolvedValue({
      ok: false,
    } as Response);

    await expect(fetchPlaylist('test-guid')).rejects.toThrow('Failed to fetch from Vercel Blob');
    expect(mockFetch).toHaveBeenCalledWith('/api/blobs?guid=test-guid&subpath=');
  });

  it('should return a sorted array of MediaFiles for a valid response', async () => {
    const mockData = {
      basePrefix: 'test-prefix/',
      folders: ['test-prefix/folder1/'],
      blobs: [
        { pathname: 'test-prefix/song.mp3', url: 'http://example.com/song.mp3' },
        { pathname: 'test-prefix/not-audio.txt', url: 'http://example.com/not-audio.txt' },
      ],
    };

    const mockFetch = vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await fetchPlaylist('test-guid');

    expect(mockFetch).toHaveBeenCalledWith('/api/blobs?guid=test-guid&subpath=');
    expect(result).toEqual([
      {
        id: 'test-prefix/folder1/',
        name: 'folder1',
        streamUrl: '',
        isFolder: true,
      },
      {
        id: 'test-prefix/song.mp3',
        name: 'song.mp3',
        streamUrl: 'http://example.com/song.mp3',
        isFolder: false,
      },
    ]);
  });

  it('should handle missing subpath correctly with encoded string', async () => {
      const mockData = {
        basePrefix: 'test-prefix/',
        folders: [],
        blobs: [
            { pathname: 'test-prefix/sub/track.mp3', url: 'url' }
        ]
      };

      const encodedSubPath = btoa('sub/');
      const mockFetch = vi.mocked(fetch).mockResolvedValue({
          ok: true,
          json: async () => mockData,
      } as Response);

      const result = await fetchPlaylist('guid', encodedSubPath);

      expect(mockFetch).toHaveBeenCalledWith(`/api/blobs?guid=guid&subpath=${encodeURIComponent(encodedSubPath)}`);
      expect(result).toEqual([
          {
              id: 'test-prefix/sub/track.mp3',
              name: 'track.mp3',
              streamUrl: 'url',
              isFolder: false
          }
      ]);
  });
});
