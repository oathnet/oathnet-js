/**
 * Tests for StealerV2Service - V2 stealer search.
 */

import { OathNetClient } from '../../src';
import { getApiKey, TEST_DATA } from '../helpers';

describe('StealerV2Service', () => {
  let client: OathNetClient | null = null;

  beforeAll(() => {
    const apiKey = getApiKey();
    if (apiKey) {
      client = new OathNetClient(apiKey);
    }
  });

  describe('search', () => {
    it('should search V2 stealer database', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.stealer.search(TEST_DATA.stealerQuery, {
        pageSize: 5,
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should support domain filter', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.stealer.search('', {
        domains: ['google.com'],
        pageSize: 5,
      });
      expect(result.success).toBe(true);
    });

    it('should support has_log_id filter', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.stealer.search(TEST_DATA.stealerQuery, {
        hasLogId: true,
        pageSize: 5,
      });
      expect(result.success).toBe(true);
    });

    it.skip('should support cursor pagination', async () => {
      // Skipping: V2 stealer cursor pagination has known issues
    });

    it('should support wildcard search', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.stealer.search('gmail', {
        wildcard: true,
        pageSize: 5,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('subdomain', () => {
    it('should extract subdomains from stealer data', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.stealer.subdomain('google.com');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should support query filter', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.stealer.subdomain('google.com', 'mail');
      expect(result.success).toBe(true);
    });
  });
});
