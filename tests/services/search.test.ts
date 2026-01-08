/**
 * Tests for SearchService - breach and stealer search.
 */

import { OathNetClient } from '../../src';
import { getApiKey, TEST_DATA } from '../helpers';

describe('SearchService', () => {
  let client: OathNetClient | null = null;

  beforeAll(() => {
    const apiKey = getApiKey();
    if (apiKey) {
      client = new OathNetClient(apiKey);
    }
  });

  describe('breach', () => {
    it('should search breach database', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.search.breach(TEST_DATA.breachQuery);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.results_found).toBeGreaterThanOrEqual(0);
    });

    it('should support cursor pagination', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.search.breach(TEST_DATA.breachQuery);
      expect(result.success).toBe(true);

      if (result.data?.cursor) {
        const result2 = await client.search.breach(TEST_DATA.breachQuery, {
          cursor: result.data.cursor,
        });
        expect(result2.success).toBe(true);
      }
    });

    it('should support database filter', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.search.breach('ahmed', {
        dbnames: 'free.fr',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('stealer', () => {
    it('should search stealer database', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.search.stealer('diddy');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.results_found).toBeGreaterThanOrEqual(0);
    });

    it('should return LOG field in results', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.search.stealer('diddy');
      if (result.data?.results && result.data.results.length > 0) {
        const first = result.data.results[0];
        expect(first).toHaveProperty('LOG');
      }
    });
  });

  describe('initSession', () => {
    it('should initialize search session', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.search.initSession('test@example.com');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.session).toBeDefined();
      expect(result.data?.session?.id).toBeDefined();
    });
  });
});
