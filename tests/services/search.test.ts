/**
 * Tests for SearchService - breach and stealer search.
 */

import { OathNetClient } from '../../src';
import { SearchService } from '../../src/services/search';
import { getApiKey, TEST_DATA } from '../helpers';

describe('SearchService', () => {
  let client: OathNetClient | null = null;

  const createService = () => {
    const get = jest.fn();
    const post = jest.fn();
    const service = new SearchService({
      get,
      post,
    } as unknown as OathNetClient);

    return { get, post, service };
  };

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
    it('sends optional search_type and decodes session metadata', async () => {
      const { post, service } = createService();
      post.mockResolvedValue({
        success: true,
        message: 'Search session initialized successfully',
        data: {
          session: {
            id: 'sess_abc123',
            query: 'test@example.com',
            search_type: 'email',
            status: 'active',
            created_at: '2026-07-06T00:00:00Z',
            expires_at: '2026-07-06T01:00:00Z',
            duration_minutes: 60,
          },
          user: {
            plan: 'Pro',
            plan_type: 'pro',
            daily_lookups: {
              used: 1,
              remaining: 999,
              limit: 1000,
              is_unlimited: false,
            },
          },
          services: {
            breach: {
              name: 'Breach Search',
              service_id: 'breach',
              category: 'search',
              is_available: true,
              is_premium: false,
              session_quota: 100,
              today_usage: 1,
              recommended_quota: 50,
            },
          },
          summary: {
            total_services: 1,
            available_services: 1,
            session_expires_in_minutes: 60,
          },
        },
      });

      const result = await service.initSession('test@example.com', {
        searchType: 'email',
      });

      expect(post).toHaveBeenCalledWith('/service/search/init', {
        query: 'test@example.com',
        search_type: 'email',
      });
      expect(result.data?.session.status).toBe('active');
      expect(result.data?.session.duration_minutes).toBe(60);
      expect(result.data?.services?.breach.recommended_quota).toBe(50);
      expect(result.data?.summary?.available_services).toBe(1);
    });

    it('accepts snake_case and string search_type aliases', async () => {
      const { post, service } = createService();
      post.mockResolvedValue({
        success: true,
        data: { session: { id: 'sess_1', query: 'example.com' } },
      });

      await service.initSession('example.com', { search_type: 'domain' });
      await service.initSession('example.com', 'domain');

      expect(post).toHaveBeenNthCalledWith(1, '/service/search/init', {
        query: 'example.com',
        search_type: 'domain',
      });
      expect(post).toHaveBeenNthCalledWith(2, '/service/search/init', {
        query: 'example.com',
        search_type: 'domain',
      });
    });

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
