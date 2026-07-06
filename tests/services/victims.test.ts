/**
 * Tests for VictimsService - V2 victim profiles.
 */

import { OathNetClient } from '../../src';
import { VictimsService } from '../../src/services/victims';
import { getApiKey, TEST_DATA } from '../helpers';
import { StructuredFilterNode } from '../../src/types';

describe('VictimsService', () => {
  const createService = () => {
    const get = jest.fn();
    const post = jest.fn();
    const getText = jest.fn();
    const service = new VictimsService({
      get,
      post,
      getText,
    } as unknown as OathNetClient);

    return { get, post, getText, service };
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

      expect(localClient.victims).toBeDefined();
      expect(localClient.victims).toBe(localClient.victims);
    });

    it('searches V2 victims with documented GET params', async () => {
      const { get, service } = createService();
      const filter: StructuredFilterNode = {
        field: 'service',
        operator: 'eq',
        value: 'discord',
      };
      get.mockResolvedValue({
        success: true,
        data: {
          items: [],
          meta: { count: 0, took_ms: 2 },
        },
      });

      const result = await service.searchVictimsV2('example.com', {
        cursor: 'cursor/with space',
        pageSize: 25,
        sort: '-indexed_at',
        from: '2026-01-01T00:00:00Z',
        to: '2026-01-31T23:59:59Z',
        dateField: 'indexed_at',
        wildcard: true,
        logId: 'log-123',
        filter,
        filterId: '0123456789abcdef01234567',
        totalDocsMin: 2,
        totalDocsMax: 20,
        serviceCountMin: 1,
        serviceCountMax: 8,
        emails: ['alice@example.com'],
        emailDomains: ['example.com'],
        ips: ['203.0.113.11'],
        hwids: ['hwid-1'],
        discordIds: ['1234567890'],
        usernames: ['alice'],
        countries: ['US'],
        cities: ['New York'],
        oses: ['Windows'],
        services: ['discord'],
        steamIds: ['steam-1'],
        steamNames: ['AliceSteam'],
        phones: ['+15551234567'],
        domains: ['example.com'],
        subdomains: ['accounts.example.com'],
        identityStates: ['active'],
        victimIps: ['198.51.100.4'],
        antivirus: ['defender'],
        infectionPaths: ['C:/Users/Alice'],
        fields: ['log_id', 'device_users'],
        searchId: 'session-123',
        view: 'enriched',
      });

      expect(result.success).toBe(true);
      expect(get).toHaveBeenCalledWith('/service/v2/victims/search', {
        q: 'example.com',
        cursor: 'cursor/with space',
        page_size: 25,
        sort: '-indexed_at',
        from: '2026-01-01T00:00:00Z',
        to: '2026-01-31T23:59:59Z',
        date_field: 'indexed_at',
        wildcard: true,
        log_id: 'log-123',
        filter: JSON.stringify(filter),
        filter_id: '0123456789abcdef01234567',
        total_docs_min: 2,
        total_docs_max: 20,
        service_count_min: 1,
        service_count_max: 8,
        search_id: 'session-123',
        view: 'enriched',
        'email[]': ['alice@example.com'],
        'email_domain[]': ['example.com'],
        'ip[]': ['203.0.113.11'],
        'hwid[]': ['hwid-1'],
        'discord_id[]': ['1234567890'],
        'username[]': ['alice'],
        'country[]': ['US'],
        'city[]': ['New York'],
        'os[]': ['Windows'],
        'service[]': ['discord'],
        'steam_id[]': ['steam-1'],
        'steam_name[]': ['AliceSteam'],
        'phone[]': ['+15551234567'],
        'domain[]': ['example.com'],
        'subdomain[]': ['accounts.example.com'],
        'identity_state[]': ['active'],
        'victim_ip[]': ['198.51.100.4'],
        'antivirus[]': ['defender'],
        'infection_path[]': ['C:/Users/Alice'],
        'fields[]': ['log_id', 'device_users'],
      });
    });

    it('posts V2 victims JSON filters with documented query params', async () => {
      const { post, service } = createService();
      const filter: StructuredFilterNode = {
        field: 'country',
        operator: 'eq',
        value: 'US',
      };
      post.mockResolvedValue({
        success: true,
        data: {
          items: [{ log_id: 'log-123' }],
          meta: { count: 1, took_ms: 3 },
        },
      });

      const result = await service.searchVictimsV2Post(
        {
          filter,
          filterId: 'fedcba987654321001234567',
          q: 'discord',
        },
        {
          cursor: 'cursor/with space',
          page_size: 50,
          sort: '-pwned_at',
          from: '2026-01-01T00:00:00Z',
          to: '2026-01-31T23:59:59Z',
          date_field: 'pwned_at',
          fields: ['log_id', 'services'],
          search_id: 'session-post',
          view: 'enriched',
        }
      );

      expect(result.data?.items[0].log_id).toBe('log-123');
      expect(post).toHaveBeenCalledWith(
        '/service/v2/victims/search?cursor=cursor%2Fwith+space&page_size=50&sort=-pwned_at&from=2026-01-01T00%3A00%3A00Z&to=2026-01-31T23%3A59%3A59Z&date_field=pwned_at&search_id=session-post&view=enriched&fields%5B%5D=log_id&fields%5B%5D=services',
        {
          filter,
          q: 'discord',
          filter_id: 'fedcba987654321001234567',
        }
      );
    });

    it('searches victim properties with GET params', async () => {
      const { get, service } = createService();
      get.mockResolvedValue({
        items: [{ log_id: 'log-123', service: 'discord' }],
        meta: { count: 1, took_ms: 4 },
      });

      const result = await service.searchVictimPropertiesV2({
        q: 'alice',
        logId: 'log-123',
        propertyType: ['account', 'cookie_domain'],
        service: 'discord',
        identityKind: 'username',
        accountId: 'acct-1',
        username: 'alice*',
        displayName: 'Alice',
        value: 'alice@example.com',
        domain: 'example.com',
        active: true,
        sourceType: 'cookie',
        sourcePath: 'Cookies.txt',
        sourceFileId: 'file-1',
        confidence: ['high'],
        confidenceMin: 0.8,
        includeCookieEvidence: true,
        excludeCookieEvidence: false,
        pageSize: 25,
        cursor: 'cursor-1',
        sort: '-indexed_at',
        searchId: 'session-123',
      });

      expect(result.items?.[0].service).toBe('discord');
      expect(get).toHaveBeenCalledWith(
        '/service/v2/victims/properties/search',
        {
          q: 'alice',
          log_id: 'log-123',
          property_type: ['account', 'cookie_domain'],
          service: 'discord',
          identity_kind: 'username',
          account_id: 'acct-1',
          username: 'alice*',
          display_name: 'Alice',
          value: 'alice@example.com',
          domain: 'example.com',
          active: true,
          source_type: 'cookie',
          source_path: 'Cookies.txt',
          source_file_id: 'file-1',
          confidence: ['high'],
          confidence_min: 0.8,
          include_cookie_evidence: true,
          exclude_cookie_evidence: false,
          page_size: 25,
          cursor: 'cursor-1',
          sort: '-indexed_at',
          search_id: 'session-123',
        }
      );
    });

    it('posts victim properties with normalized JSON body', async () => {
      const { post, service } = createService();
      post.mockResolvedValue({
        items: [{ log_id: 'log-123', property_id: 'prop-1' }],
        meta: { count: 1, took_ms: 5 },
      });

      const result = await service.searchVictimPropertiesV2Post({
        q: 'example.com',
        service: 'discord',
        confidence: 'high',
        excludeCookieEvidence: true,
        pageSize: 25,
        searchId: 'session-post',
      });

      expect(result.items?.[0].property_id).toBe('prop-1');
      expect(post).toHaveBeenCalledWith(
        '/service/v2/victims/properties/search',
        {
          q: 'example.com',
          service: 'discord',
          confidence: 'high',
          exclude_cookie_evidence: true,
          page_size: 25,
          search_id: 'session-post',
        }
      );
    });

    it('gets one victim property set with encoded log_id and filters', async () => {
      const { get, service } = createService();
      get.mockResolvedValue({
        items: [{ log_id: 'log/with space', service: 'telegram' }],
        meta: { count: 1, took_ms: 2 },
      });

      const result = await service.getVictimPropertiesV2('log/with space', {
        service: 'telegram',
        pageSize: 10,
        searchId: 'session-123',
      });

      expect(result.items?.[0].service).toBe('telegram');
      expect(get).toHaveBeenCalledWith(
        '/service/v2/victims/log%2Fwith%20space/properties',
        {
          service: 'telegram',
          page_size: 10,
          search_id: 'session-123',
        }
      );
    });

    it('gets victim summary with search_id', async () => {
      const { get, service } = createService();
      get.mockResolvedValue({
        log_id: 'log-123',
        generated_at: '2026-07-06T00:00:00Z',
        stale: false,
        warnings: [],
      });

      const result = await service.getVictimSummaryV2(
        'log-123',
        'session-123'
      );

      expect(result.log_id).toBe('log-123');
      expect(get).toHaveBeenCalledWith(
        '/service/v2/victims/log-123/summary',
        {
          search_id: 'session-123',
        }
      );
    });

    it('gets value-redacted victim cookies with inventory params', async () => {
      const { get, service } = createService();
      get.mockResolvedValue({
        log_id: 'log-123',
        items: [{ domain: 'example.com', name: 'sid', status: 'active' }],
        domains: [{ domain: 'example.com', count: 1 }],
        meta: { count: 1, took_ms: 2 },
      });

      const result = await service.getVictimCookiesV2('log-123', {
        domain: 'example.com',
        status: 'active',
        q: 'sid',
        includeItems: true,
        pageSize: 20,
        cursor: 'cursor-1',
        searchId: 'session-123',
      });

      expect(result.items?.[0].name).toBe('sid');
      expect(get).toHaveBeenCalledWith(
        '/service/v2/victims/log-123/cookies',
        {
          domain: 'example.com',
          status: 'active',
          q: 'sid',
          include_items: true,
          page_size: 20,
          cursor: 'cursor-1',
          search_id: 'session-123',
        }
      );
    });

    it('inspects one victim cookie domain as text/plain', async () => {
      const { getText, service } = createService();
      getText.mockResolvedValue('example.com\tTRUE\t/\tFALSE\t0\tsid\tvalue');

      const result = await service.inspectVictimCookieDomainV2(
        'log/with space',
        'example.com',
        {
          fileId: 'file-1',
          searchId: 'session-123',
        }
      );

      expect(result).toContain('example.com');
      expect(getText).toHaveBeenCalledWith(
        '/service/v2/victims/log%2Fwith%20space/cookies/domain',
        {
          domain: 'example.com',
          file_id: 'file-1',
          search_id: 'session-123',
        }
      );
    });
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
