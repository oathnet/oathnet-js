/**
 * Tests for BreachV2Service - V2 breach search request construction.
 */

import { OathNetClient } from '../../src';
import { BreachV2Service } from '../../src/services/breach';
import {
  StructuredFilterNode,
  V2AIFilterRequest,
  V2BreachSearchPostBody,
} from '../../src/types';

describe('BreachV2Service', () => {
  const createService = () => {
    const get = jest.fn();
    const post = jest.fn();
    const service = new BreachV2Service({
      get,
      post,
    } as unknown as OathNetClient);

    return { get, post, service };
  };

  it('is exposed from the main client', () => {
    const client = new OathNetClient('test-api-key');

    expect(client.breach).toBeDefined();
    expect(client.breach).toBe(client.breach);
  });

  it('creates AI filter contexts with the documented JSON body and raw response', async () => {
    const { post, service } = createService();
    const request: V2AIFilterRequest = {
      index: 'breach',
      query: 'US gmail users with LinkedIn records after 2020',
      filter_id: '0123456789abcdef01234567',
    };
    const filter: StructuredFilterNode = {
      and: [
        { field: 'country', operator: 'eq', value: 'US' },
        { field: 'email_domain', operator: 'eq', value: 'gmail.com' },
        { field: 'dbname', operator: 'contains', value: 'linkedin' },
        {
          field: 'indexed_at',
          operator: 'gte',
          value: '2020-01-01T00:00:00Z',
        },
      ],
    };
    post.mockResolvedValue({
      filter_id: 'fedcba987654321001234567',
      filter,
    });

    const result = await service.createAIFilterV2(request);

    expect(result.filter_id).toBe('fedcba987654321001234567');
    expect(result.filter).toBe(filter);
    expect(post).toHaveBeenCalledWith('/service/v2/ai/filter', request);
  });

  it('gets AI filter context with an encoded filter_id path and raw context response', async () => {
    const { get, service } = createService();
    const filter: StructuredFilterNode = {
      field: 'country',
      operator: 'eq',
      value: 'US',
    };
    get.mockResolvedValue({
      id: '0123456789abcdef01234567',
      index_type: 'breach',
      query: 'US gmail users',
      filter,
      sample_data: { country: 'US' },
      field_values: { country: ['US'] },
      total_hits: 42,
      history: [{ query: 'US users', filter }],
      source: 'ai',
      parent_id: null,
      created_at: '2026-04-13T08:59:19Z',
      expires_at: '2026-04-13T09:29:19Z',
    });

    const result = await service.getAIFilterContextV2('filter/with space');

    expect(result.id).toBe('0123456789abcdef01234567');
    expect(result.field_values?.country).toEqual(['US']);
    expect(result.history?.[0].filter).toBe(filter);
    expect(get).toHaveBeenCalledWith(
      '/service/v2/ai/filter/filter%2Fwith%20space'
    );
  });

  it('searches V2 breach records with documented GET params', async () => {
    const { get, service } = createService();
    const filter: StructuredFilterNode = {
      and: [
        { field: 'country', operator: 'eq', value: 'US' },
        { field: 'email_domain', operator: 'eq', value: 'example.com' },
      ],
    };
    get.mockResolvedValue({
      success: true,
      data: {
        items: [],
        meta: { count: 0, took_ms: 4 },
        next_cursor: undefined,
      },
    });

    const result = await service.searchBreachV2('alice+test@example.com', {
      cursor: 'cursor/with space',
      pageSize: 25,
      sort: '-indexed_at',
      from: '2026-01-01T00:00:00Z',
      to: '2026-01-31T23:59:59Z',
      dateField: 'indexed_at',
      wildcard: true,
      logic: 'and',
      filter,
      filterId: '0123456789abcdef01234567',
      emails: ['alice@example.com'],
      emailDomains: ['example.com'],
      domains: ['app.example.com'],
      usernames: ['alice'],
      passwords: ['secret'],
      passwordHashes: ['sha256:value'],
      ips: ['203.0.113.9'],
      phones: ['+15551234567'],
      firstNames: ['Alice'],
      lastNames: ['Doe'],
      fullNames: ['Alice Doe'],
      cities: ['New York'],
      countries: ['US'],
      states: ['NY'],
      postalCodes: ['10001'],
      dbnames: ['db/name & space'],
      discordIds: ['1234567890'],
      ibans: ['DE89370400440532013000'],
      ssns: ['123-45-6789'],
      date_birth_from: '1990-01-01',
      date_birth_to: '1990-12-31',
      names: ['Alice D'],
      genders: ['female'],
      addresses: ['123 Main St'],
      discords: ['alice#1234'],
      socials: ['@alice'],
      financials: ['visa'],
      gamings: ['xbox'],
      fields: ['email', 'dbname'],
      searchId: 'session-123',
      'instagram[]': ['alice_ig'],
    });

    expect(result.success).toBe(true);
    expect(get).toHaveBeenCalledWith('/service/v2/breach/search', {
      q: 'alice+test@example.com',
      cursor: 'cursor/with space',
      page_size: 25,
      sort: '-indexed_at',
      from: '2026-01-01T00:00:00Z',
      to: '2026-01-31T23:59:59Z',
      date_field: 'indexed_at',
      wildcard: true,
      logic: 'and',
      filter: JSON.stringify(filter),
      filter_id: '0123456789abcdef01234567',
      date_birth_from: '1990-01-01',
      date_birth_to: '1990-12-31',
      search_id: 'session-123',
      'email[]': ['alice@example.com'],
      'email_domain[]': ['example.com'],
      'domain[]': ['app.example.com'],
      'username[]': ['alice'],
      'password[]': ['secret'],
      'password_hash[]': ['sha256:value'],
      'ip[]': ['203.0.113.9'],
      'phone[]': ['+15551234567'],
      'first_name[]': ['Alice'],
      'last_name[]': ['Doe'],
      'full_name[]': ['Alice Doe'],
      'city[]': ['New York'],
      'country[]': ['US'],
      'state[]': ['NY'],
      'postal_code[]': ['10001'],
      'dbname[]': ['db/name & space'],
      'discord_id[]': ['1234567890'],
      'iban[]': ['DE89370400440532013000'],
      'ssn[]': ['123-45-6789'],
      'name[]': ['Alice D'],
      'gender[]': ['female'],
      'address[]': ['123 Main St'],
      'discord[]': ['alice#1234'],
      'social[]': ['@alice'],
      'financial[]': ['visa'],
      'gaming[]': ['xbox'],
      'fields[]': ['email', 'dbname'],
      'instagram[]': ['alice_ig'],
    });
  });

  it('posts V2 breach JSON filters with documented query params encoded in the path', async () => {
    const { post, service } = createService();
    const filter: StructuredFilterNode = {
      field: 'dbname',
      operator: 'eq',
      value: 'db/name & space',
    };
    const body: V2BreachSearchPostBody = {
      filter,
      filterId: 'fedcba987654321001234567',
      q: 'alice@example.com',
      'dbname[]': ['db/name & space'],
    };
    post.mockResolvedValue({
      success: true,
      data: {
        items: [{ email: 'alice@example.com', dbname: 'db/name & space' }],
        meta: { count: 1, took_ms: 6 },
      },
    });

    const result = await service.searchBreachV2Post(body, {
      cursor: 'cursor/with space',
      page_size: 50,
      sort: '-pwned_at',
      from: '2026-01-01T00:00:00Z',
      to: '2026-01-31T23:59:59Z',
      date_field: 'pwned_at',
      fields: ['email', 'password'],
      search_id: 'session-post',
    });

    expect(result.data?.items[0].email).toBe('alice@example.com');
    expect(post).toHaveBeenCalledWith(
      '/service/v2/breach/search?cursor=cursor%2Fwith+space&page_size=50&sort=-pwned_at&from=2026-01-01T00%3A00%3A00Z&to=2026-01-31T23%3A59%3A59Z&date_field=pwned_at&search_id=session-post&fields%5B%5D=email&fields%5B%5D=password',
      {
        filter,
        q: 'alice@example.com',
        'dbname[]': ['db/name & space'],
        filter_id: 'fedcba987654321001234567',
      }
    );
  });

  it('autocompletes breach values with field, query, limit, and include_info params', async () => {
    const { get, service } = createService();
    get.mockResolvedValue({
      items: [{ field: 'country', value: 'US', count: 100 }],
      took_ms: 2,
    });

    const result = await service.autocompleteBreachValuesV2({
      field: 'country',
      q: 'u',
      limit: 5,
      includeInfo: true,
    });

    expect(result.items[0].value).toBe('US');
    expect(get).toHaveBeenCalledWith('/service/v2/breach/autocomplete', {
      field: 'country',
      q: 'u',
      limit: 5,
      include_info: true,
    });
  });

  it('autocompletes breach database names with q and limit params', async () => {
    const { get, service } = createService();
    get.mockResolvedValue({
      items: [{ name: 'linkedin.com', count: 10, fields: ['email'] }],
      took_ms: 3,
    });

    const result = await service.autocompleteBreachDBNamesV2({
      q: 'linked',
      limit: 8,
    });

    expect(result.items[0].name).toBe('linkedin.com');
    expect(get).toHaveBeenCalledWith(
      '/service/v2/breach/autocomplete/dbnames',
      {
        q: 'linked',
        limit: 8,
      }
    );
  });

  it('finds breach database names by required field and optional limit', async () => {
    const { get, service } = createService();
    get.mockResolvedValue({
      field: 'email_domain',
      items: [{ dbname: 'twitter.com', count: 22 }],
      total: 1,
      took_ms: 5,
    });

    const result = await service.autocompleteBreachFieldsV2('email_domain', {
      limit: 4,
    });

    expect(result.total).toBe(1);
    expect(get).toHaveBeenCalledWith(
      '/service/v2/breach/autocomplete/fields',
      {
        field: 'email_domain',
        limit: 4,
      }
    );
  });
});
