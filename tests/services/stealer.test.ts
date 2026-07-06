/**
 * Tests for StealerV2Service - V2 stealer search.
 */

import { OathNetClient } from '../../src';
import { StealerV2Service } from '../../src/services/stealer';
import { getApiKey, TEST_DATA } from '../helpers';
import {
  StructuredFilterNode,
  V2InvestigationSearchRequest,
} from '../../src/types';

describe('StealerV2Service', () => {
  const createService = () => {
    const get = jest.fn();
    const post = jest.fn();
    const service = new StealerV2Service({
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

      expect(localClient.stealer).toBeDefined();
      expect(localClient.stealer).toBe(localClient.stealer);
    });

    it('runs canonical GET investigation search with documented query params', async () => {
      const { get, service } = createService();
      const filter: StructuredFilterNode = {
        field: 'domain',
        operator: 'eq',
        value: 'example.com',
      };
      get.mockResolvedValue({
        success: true,
        message: 'Investigation completed',
        data: {
          query: 'example.com',
          scope: 'all',
          sections: {
            credentials: {
              items: [],
              meta: { count: 0, took_ms: 2 },
            },
          },
          links: [],
          policy_redacted: false,
        },
      });

      const result = await service.investigateStealerV2('example.com', {
        scope: 'all',
        include: ['credentials', 'victims', 'evidence'],
        pageSize: 25,
        searchId: 'sess_0123456789abcdef',
        filter,
        filterId: '0123456789abcdef01234567',
        filterMode: 'fanout',
        compact: true,
        view: 'enriched',
        includeCookieEvidence: false,
        exclude_cookie_evidence: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.sections?.credentials?.meta?.count).toBe(0);
      expect(get).toHaveBeenCalledWith(
        '/service/v2/stealer/investigation/search',
        {
          q: 'example.com',
          scope: 'all',
          include: 'credentials,victims,evidence',
          page_size: 25,
          search_id: 'sess_0123456789abcdef',
          filter: JSON.stringify(filter),
          filter_id: '0123456789abcdef01234567',
          filter_mode: 'fanout',
          compact: true,
          view: 'enriched',
          include_cookie_evidence: false,
          exclude_cookie_evidence: true,
        }
      );
    });

    it('runs canonical POST investigation search with a normalized section payload', async () => {
      const { post, service } = createService();
      const filter: StructuredFilterNode = {
        and: [
          { field: 'domain', operator: 'eq', value: 'example.com' },
          { field: 'has_log_id', operator: 'eq', value: true },
        ],
      };
      const request: V2InvestigationSearchRequest = {
        q: 'example.com',
        scope: 'all',
        include: [
          'credentials',
          'victims',
          'evidence',
          'files',
          'related_credentials',
        ],
        compact: true,
        view: 'enriched',
        pageSize: 25,
        searchId: 'sess_0123456789abcdef',
        filterMode: 'intersect',
        filter,
        filterId: 'fedcba987654321001234567',
        dateField: 'indexed_at',
        logId: 'log-123',
        hasLogId: true,
        includeCookieEvidence: true,
        excludeCookieEvidence: false,
        fields: ['url_str', 'domain'],
        filters: {
          credentials: {
            domain: ['example.com'],
            has_log_id: true,
          },
          victims: {
            service: ['discord'],
            country: ['US'],
          },
          evidence: {
            service: 'discord',
            confidence: ['high'],
          },
          files: {
            kind: 'cookies',
          },
        },
        cursors: {
          credentials: null,
          victims: null,
          evidence: null,
          files: null,
          related_credentials: null,
        },
      };
      post.mockResolvedValue({
        success: true,
        message: 'Investigation completed',
        data: {
          query: 'example.com',
          scope: 'all',
          sections: {},
          intersection: { mode: 'intersect', applied: true },
        },
      });

      const result = await service.investigateStealerV2Post(request);

      expect(result.data?.intersection?.applied).toBe(true);
      expect(post).toHaveBeenCalledWith(
        '/service/v2/stealer/investigation/search',
        {
          q: 'example.com',
          scope: 'all',
          include: [
            'credentials',
            'victims',
            'evidence',
            'files',
            'related_credentials',
          ],
          compact: true,
          view: 'enriched',
          filter,
          fields: ['url_str', 'domain'],
          filters: {
            credentials: {
              domain: ['example.com'],
              has_log_id: true,
            },
            victims: {
              service: ['discord'],
              country: ['US'],
            },
            evidence: {
              service: 'discord',
              confidence: ['high'],
            },
            files: {
              kind: 'cookies',
            },
          },
          cursors: {
            credentials: null,
            victims: null,
            evidence: null,
            files: null,
            related_credentials: null,
          },
          date_field: 'indexed_at',
          exclude_cookie_evidence: false,
          filter_id: 'fedcba987654321001234567',
          filter_mode: 'intersect',
          has_log_id: true,
          include_cookie_evidence: true,
          log_id: 'log-123',
          page_size: 25,
          search_id: 'sess_0123456789abcdef',
        }
      );
    });

    it('keeps legacy investigation GET and POST aliases addressable by path', async () => {
      const { get, post, service } = createService();
      get.mockResolvedValue({
        success: true,
        data: { query: 'legacy.example', sections: {} },
      });
      post.mockResolvedValue({
        success: true,
        data: { query: 'legacy.example', sections: {} },
      });

      await service.investigateV2Alias({
        q: 'legacy.example',
        scope: 'victims',
        include: 'victims,files',
        page_size: 10,
        compact: false,
      });
      await service.investigateV2AliasPost({
        q: 'legacy.example',
        scope: 'victims',
        page_size: 10,
      });

      expect(get).toHaveBeenCalledWith('/service/v2/investigate/search', {
        q: 'legacy.example',
        scope: 'victims',
        include: 'victims,files',
        page_size: 10,
        compact: false,
      });
      expect(post).toHaveBeenCalledWith('/service/v2/investigate/search', {
        q: 'legacy.example',
        scope: 'victims',
        page_size: 10,
      });
    });

    it('gets raw Phonebook domain intelligence with documented query params', async () => {
      const { get, service } = createService();
      get.mockResolvedValue({
        domain: 'example.com',
        subdomains: ['accounts.example.com'],
        subdomain_results: [
          {
            domain: 'accounts.example.com',
            count: 12,
            latest_indexed_at: '2026-03-20T12:00:00Z',
            redacted: false,
          },
        ],
        emails: [
          {
            email: 'alice@example.com',
            count: 3,
            stealer_count: 1,
            breach_result_count: 2,
            breach_count: 1,
            redacted: false,
          },
        ],
        count: 1,
        email_count: 1,
        policy_redacted: false,
        upgrade_required: false,
        visible_subdomain_limit: null,
        visible_email_limit: null,
        redacted_subdomain_count: 0,
        redacted_email_count: 0,
      });

      const result = await service.getPhonebookV2('example.com', {
        alive: true,
        searchId: 'sess_0123456789abcdef',
      });

      expect(result.domain).toBe('example.com');
      expect(result.subdomain_results?.[0].domain).toBe(
        'accounts.example.com'
      );
      expect(get).toHaveBeenCalledWith('/service/v2/phonebook', {
        domain: 'example.com',
        alive: true,
        search_id: 'sess_0123456789abcdef',
      });
    });

    it('supports the Phonebook q and is_alive aliases without wrapping the response', async () => {
      const { get, service } = createService();
      get.mockResolvedValue({
        domain: 'alias.example',
        subdomains: [],
        count: 0,
        email_count: 0,
      });

      const result = await service.phonebook({
        q: 'alias.example',
        is_alive: false,
      });

      expect(result).not.toHaveProperty('success');
      expect(result.domain).toBe('alias.example');
      expect(get).toHaveBeenCalledWith('/service/v2/phonebook', {
        q: 'alias.example',
        is_alive: false,
      });
    });
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
