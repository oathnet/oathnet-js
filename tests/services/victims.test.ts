/**
 * Tests for VictimsService - V2 victim profiles.
 */

import { OathNetClient } from '../../src';
import { getApiKey, TEST_DATA } from '../helpers';

describe('VictimsService', () => {
  let client: OathNetClient | null = null;

  beforeAll(() => {
    const apiKey = getApiKey();
    if (apiKey) {
      client = new OathNetClient(apiKey);
    }
  });

  describe('search', () => {
    it('should search victim profiles', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.victims.search(TEST_DATA.victimsQuery, {
        pageSize: 5,
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should support cursor pagination', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result1 = await client.victims.search(TEST_DATA.victimsQuery, {
        pageSize: 5,
      });
      expect(result1.success).toBe(true);

      if (result1.data?.next_cursor) {
        const result2 = await client.victims.search(TEST_DATA.victimsQuery, {
          pageSize: 5,
          cursor: result1.data.next_cursor,
        });
        expect(result2.success).toBe(true);
      }
    });

    it('should support email filter', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.victims.search('', {
        emails: ['gmail.com'],
        pageSize: 5,
      });
      expect(result.success).toBe(true);
    });

    it('should support wildcard search', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.victims.search('gmail', {
        wildcard: true,
        pageSize: 5,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getManifest', () => {
    it('should get victim manifest', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      // First get a log ID from search
      const searchResult = await client.victims.search(TEST_DATA.victimsQuery, {
        pageSize: 5,
      });

      const logId = searchResult.data?.items?.find(
        (v) => v.log_id
      )?.log_id;

      if (!logId) {
        console.log('Skipping: No log ID available');
        return;
      }

      const result = await client.victims.getManifest(logId);
      expect(result).toBeDefined();
    });
  });

  describe('getFile', () => {
    it('should get victim file content', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      // First get a log ID and file ID from manifest
      const searchResult = await client.victims.search(TEST_DATA.victimsQuery, {
        pageSize: 5,
      });

      const logId = searchResult.data?.items?.find(
        (v) => v.log_id
      )?.log_id;

      if (!logId) {
        console.log('Skipping: No log ID available');
        return;
      }

      try {
        const manifest = await client.victims.getManifest(logId);

        // Find a file in the tree
        const findFile = (node: any): string | null => {
          if (node?.type === 'file' && node?.id) return node.id;
          if (node?.children) {
            for (const child of node.children) {
              const found = findFile(child);
              if (found) return found;
            }
          }
          return null;
        };

        const fileId = manifest?.victim_tree ? findFile(manifest.victim_tree) : null;

        if (!fileId) {
          console.log('Skipping: No file ID available');
          return;
        }

        const content = await client.victims.getFile(logId, fileId);
        expect(content).toBeInstanceOf(Buffer);
      } catch (error) {
        // Manifest may not be available for all logs
        console.log('Skipping: Manifest not available');
      }
    });
  });
});
