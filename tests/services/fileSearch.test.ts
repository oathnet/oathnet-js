/**
 * Tests for FileSearchService - async file search.
 * Note: FileSearch requires log_ids from a stealer search to work.
 */

import { OathNetClient } from '../../src';
import { FileSearchService } from '../../src/services/fileSearch';
import { getApiKey } from '../helpers';

/**
 * Helper to get log_ids from stealer search (with hasLogId filter)
 */
async function getLogIds(client: OathNetClient, count: number = 3): Promise<string[]> {
  const result = await client.stealer.search('gmail.com', {
    pageSize: 10,
    hasLogId: true,
  });

  if (!result.data?.items) {
    return [];
  }

  const logIds = result.data.items
    .filter((r) => r.log_id)
    .map((r) => r.log_id as string);

  // Return unique log_ids
  return [...new Set(logIds)].slice(0, count);
}

describe('FileSearchService', () => {
  const createService = () => {
    const get = jest.fn();
    const post = jest.fn();
    const service = new FileSearchService({
      get,
      post,
    } as unknown as OathNetClient);

    return { get, post, service };
  };

  let client: OathNetClient | null = null;

  beforeAll(() => {
    const apiKey = getApiKey();
    if (apiKey) {
      client = new OathNetClient(apiKey);
    }
  });

  describe('request construction', () => {
    it('is exposed from the main client', () => {
      const localClient = new OathNetClient('test-api-key');

      expect(localClient.fileSearch).toBeDefined();
      expect(localClient.fileSearch).toBe(localClient.fileSearch);
    });

    it('searches file metadata with documented GET params', async () => {
      const { get, service } = createService();
      get.mockResolvedValue({
        items: [
          {
            log_id: 'log-123',
            file_id: 'file-1',
            name: 'Cookies.txt',
            kind: 'cookies',
          },
        ],
        meta: { count: 1, took_ms: 3 },
      });

      const result = await service.searchFilesMetadataV2({
        q: 'example.com',
        logId: 'log-123',
        name: 'Cookies.txt',
        folder: 'Browser',
        kind: 'cookies',
        ext: 'txt',
        sizeMin: 10,
        sizeMax: 2048,
        pageSize: 25,
        cursor: 'cursor-1',
        searchId: 'session-123',
      });

      expect(result.items?.[0].file_id).toBe('file-1');
      expect(get).toHaveBeenCalledWith('/service/v2/files/search', {
        q: 'example.com',
        log_id: 'log-123',
        name: 'Cookies.txt',
        folder: 'Browser',
        kind: 'cookies',
        ext: 'txt',
        size_min: 10,
        size_max: 2048,
        page_size: 25,
        cursor: 'cursor-1',
        search_id: 'session-123',
      });
    });

    it('posts file metadata searches with a normalized JSON body', async () => {
      const { post, service } = createService();
      post.mockResolvedValue({
        items: [{ log_id: 'log-123', file_id: 'file-2', kind: 'passwords' }],
        meta: { count: 1, took_ms: 4 },
      });

      const result = await service.searchFilesMetadataV2Post({
        q: 'password',
        kind: 'passwords',
        pageSize: 50,
        searchId: 'session-post',
      });

      expect(result.items?.[0].kind).toBe('passwords');
      expect(post).toHaveBeenCalledWith('/service/v2/files/search', {
        q: 'password',
        kind: 'passwords',
        page_size: 50,
        search_id: 'session-post',
      });
    });
  });

  describe('create', () => {
    it('should create file search job with log IDs', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const logIds = await getLogIds(client);
      if (!logIds.length) {
        console.log('Skipping: No log IDs available from stealer search');
        return;
      }

      const result = await client.fileSearch.create('password', {
        searchMode: 'literal',
        logIds,
        maxMatches: 5,
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.job_id).toBeDefined();
    });

    it('should create file search with regex mode', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const logIds = await getLogIds(client);
      if (!logIds.length) {
        console.log('Skipping: No log IDs available from stealer search');
        return;
      }

      const result = await client.fileSearch.create('pass(word|wd)', {
        searchMode: 'regex',
        logIds,
        maxMatches: 5,
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.job_id).toBeDefined();
    });

    it('should create file search with wildcard mode', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const logIds = await getLogIds(client);
      if (!logIds.length) {
        console.log('Skipping: No log IDs available from stealer search');
        return;
      }

      const result = await client.fileSearch.create('*@gmail.com', {
        searchMode: 'wildcard',
        logIds,
        maxMatches: 5,
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.job_id).toBeDefined();
    });

    it('should create file search with file pattern filter', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const logIds = await getLogIds(client);
      if (!logIds.length) {
        console.log('Skipping: No log IDs available from stealer search');
        return;
      }

      const result = await client.fileSearch.create('password', {
        searchMode: 'literal',
        logIds,
        filePattern: '*.txt',
        maxMatches: 5,
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should create file search with context lines', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const logIds = await getLogIds(client);
      if (!logIds.length) {
        console.log('Skipping: No log IDs available from stealer search');
        return;
      }

      const result = await client.fileSearch.create('password', {
        searchMode: 'literal',
        logIds,
        contextLines: 3,
        maxMatches: 5,
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should create case-sensitive file search', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const logIds = await getLogIds(client);
      if (!logIds.length) {
        console.log('Skipping: No log IDs available from stealer search');
        return;
      }

      const result = await client.fileSearch.create('Password', {
        searchMode: 'literal',
        logIds,
        caseSensitive: true,
        maxMatches: 5,
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('getStatus', () => {
    it('should get job status', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const logIds = await getLogIds(client);
      if (!logIds.length) {
        console.log('Skipping: No log IDs available from stealer search');
        return;
      }

      const job = await client.fileSearch.create('password', {
        logIds,
        maxMatches: 5,
      });

      if (!job.data?.job_id) {
        console.log('Skipping: No job ID returned');
        return;
      }

      const status = await client.fileSearch.getStatus(job.data.job_id);
      expect(status.success).toBe(true);
      expect(status.data).toBeDefined();
      expect(['pending', 'processing', 'queued', 'running', 'completed', 'canceled']).toContain(
        status.data?.status
      );
    });
  });

  describe('waitForCompletion', () => {
    it('should wait for job completion', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const logIds = await getLogIds(client);
      if (!logIds.length) {
        console.log('Skipping: No log IDs available from stealer search');
        return;
      }

      const job = await client.fileSearch.create('password', {
        searchMode: 'literal',
        logIds,
        maxMatches: 3,
      });

      if (!job.data?.job_id) {
        console.log('Skipping: No job ID returned');
        return;
      }

      const result = await client.fileSearch.waitForCompletion(
        job.data.job_id,
        1000,
        60000
      );
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(['completed', 'canceled']).toContain(result.data?.status);
    });
  });

  describe('search', () => {
    it('should create and wait for results', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const logIds = await getLogIds(client);
      if (!logIds.length) {
        console.log('Skipping: No log IDs available from stealer search');
        return;
      }

      const result = await client.fileSearch.search('password', {
        searchMode: 'literal',
        logIds,
        maxMatches: 3,
      }, 60000);

      expect(result.success).toBe(true);
      expect(['completed', 'canceled']).toContain(result.data?.status);
    });
  });

  describe('error handling', () => {
    it('should handle invalid job ID', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      await expect(
        client.fileSearch.getStatus('invalid_job_id_12345')
      ).rejects.toThrow();
    });

    it('should handle empty expression', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const logIds = await getLogIds(client);
      if (!logIds.length) {
        console.log('Skipping: No log IDs available from stealer search');
        return;
      }

      await expect(
        client.fileSearch.create('', {
          searchMode: 'literal',
          logIds,
        })
      ).rejects.toThrow();
    });
  });
});
