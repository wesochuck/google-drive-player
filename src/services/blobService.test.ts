import { expect, test, describe, vi, afterEach, beforeEach } from 'vitest';
import { fetchPlaylist } from './blobService';

describe('blobService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchPlaylist', () => {
    test('returns an empty array when response has no folders or blobs', async () => {
      // Mock global fetch
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          basePrefix: 'test-prefix/',
          // No folders or blobs array provided
        }),
      });
      globalThis.fetch = mockFetch;

      const validBase64 = btoa('test-subpath');
      const result = await fetchPlaylist('test-guid', validBase64);

      expect(mockFetch).toHaveBeenCalledWith(`/api/blobs?guid=test-guid&subpath=${encodeURIComponent(validBase64)}`);
      expect(result).toEqual([]);
    });
  });
});
