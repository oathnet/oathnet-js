/**
 * Tests for BulkSearchService - V2 bulk search request construction.
 */

import { OathNetClient } from '../../src';
import { BulkSearchService } from '../../src/services/bulkSearch';
import { BulkSearchCreateRequest } from '../../src/types';

describe('BulkSearchService', () => {
  const createService = () => {
    const get = jest.fn();
    const getRaw = jest.fn();
    const post = jest.fn();
    const service = new BulkSearchService({
      get,
      getRaw,
      post,
    } as unknown as OathNetClient);

    return { get, getRaw, post, service };
  };

  it('is exposed from the main client', () => {
    const client = new OathNetClient('test-api-key');

    expect(client.bulkSearch).toBeDefined();
    expect(client.bulkSearch).toBe(client.bulkSearch);
  });

  it('creates bulk search jobs with the documented request body', async () => {
    const { post, service } = createService();
    const request: BulkSearchCreateRequest = {
      terms: ['alice@example.com', 'bob@example.com'],
      service: 'stealer',
      format: 'json',
      query_config: {
        filter: {
          field: 'email_domains',
          operator: 'eq',
          value: 'example.com',
        },
        filter_id: '0123456789abcdef01234567',
        from: '2026-03-01',
        to: '2026-03-31',
        date_field: 'indexed_at',
        wildcard: true,
      },
      limit: 250,
      fields: ['email', 'password', 'domain'],
    };
    post.mockResolvedValue({
      success: true,
      message: 'Bulk search job created successfully.',
      data: {
        id: 'job-123',
        job_id: 'job-123',
        status: 'queued',
        created_at: '2026-04-13T08:59:19.872622873Z',
      },
    });

    const result = await service.createBulkSearchV2(request);

    expect(result.success).toBe(true);
    expect(result.data?.job_id).toBe('job-123');
    expect(post).toHaveBeenCalledWith('/service/v2/bulk-search', request);
  });

  it('lists bulk search jobs with OpenAPI pagination params', async () => {
    const { get, service } = createService();
    get.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 'job-123',
          job_id: 'job-123',
          status: 'completed',
          created_at: '2026-04-13T08:59:19.872622873Z',
          updated_at: '2026-04-13T09:00:00.000000000Z',
          search_service: 'stealer',
          output_format: 'jsonl',
          results_expired: false,
          query: 'example.com',
          results_count: 42,
          lookups_deducted: 1,
        },
      ],
    });

    const result = await service.listBulkSearchJobsV2({
      page: 2,
      pageSize: 25,
    });

    expect(result.count).toBe(1);
    expect(result.results[0].job_id).toBe('job-123');
    expect(get).toHaveBeenCalledWith('/service/v2/bulk-search/list', {
      page: 2,
      page_size: 25,
    });
  });

  it('gets a raw bulk search job snapshot with an encoded job_id path param', async () => {
    const { get, service } = createService();
    get.mockResolvedValue({
      id: 'job/with space',
      job_id: 'job/with space',
      status: 'running',
      created_at: '2026-04-13T08:59:19.872622873Z',
      progress: {
        records_done: 10,
        records_total: 100,
        bytes_done: 2048,
        percent: 10,
        updated_at: '2026-04-13T09:00:00.000000000Z',
      },
      request: {
        type: 'docs',
        service: 'stealer',
        format: 'jsonl',
        request_count: 2,
      },
      metadata: {
        source: 'microservice',
      },
    });

    const result = await service.getBulkSearchJobV2('job/with space');

    expect(result.status).toBe('running');
    expect(result.request?.request_count).toBe(2);
    expect(get).toHaveBeenCalledWith(
      '/service/v2/bulk-search/job%2Fwith%20space'
    );
  });

  it('downloads bulk search results through the Node Buffer raw download path', async () => {
    const { getRaw, service } = createService();
    const csv = Buffer.from('email,password\nalice@example.com,secret\n');
    getRaw.mockResolvedValue(csv);

    const result = await service.downloadBulkSearchResultsV2('job-123');

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result).toBe(csv);
    expect(getRaw).toHaveBeenCalledWith(
      '/service/v2/bulk-search/job-123/download'
    );
  });
});
