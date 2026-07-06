/**
 * Tests for ExportsService - async exports.
 */

import { OathNetClient } from '../../src';
import { ExportsService } from '../../src/services/exports';
import { getApiKey } from '../helpers';

describe('ExportsService', () => {
  const createService = () => {
    const get = jest.fn();
    const post = jest.fn();
    const getRaw = jest.fn();
    const service = new ExportsService({
      get,
      post,
      getRaw,
    } as unknown as OathNetClient);

    return { get, post, getRaw, service };
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

      expect(localClient.exports).toBeDefined();
      expect(localClient.exports).toBe(localClient.exports);
    });

    it('lists export jobs with page and page_size params', async () => {
      const { get, service } = createService();
      get.mockResolvedValue({
        count: 1,
        next: null,
        previous: null,
        results: [{ job_id: 'export-1', status: 'completed' }],
      });

      const result = await service.listExportsV2({
        page: 2,
        pageSize: 25,
      });

      expect(result.results[0].job_id).toBe('export-1');
      expect(get).toHaveBeenCalledWith('/service/v2/exports/list', {
        page: 2,
        page_size: 25,
      });
    });

    it('supports numeric list shorthand without wrapping the raw response', async () => {
      const { get, service } = createService();
      get.mockResolvedValue({
        count: 0,
        next: null,
        previous: null,
        results: [],
      });

      const result = await service.listExportsV2(3, 10);

      expect(result).not.toHaveProperty('success');
      expect(result.count).toBe(0);
      expect(get).toHaveBeenCalledWith('/service/v2/exports/list', {
        page: 3,
        page_size: 10,
      });
    });

    it('creates breach exports with current format and query_config fields', async () => {
      const { post, service } = createService();
      post.mockResolvedValue({
        job_id: 'export-1',
        status: 'queued',
        request: {
          type: 'breach',
          service: 'breach',
          format: 'html',
        },
      });

      const result = await service.createExportV2('breach', {
        format: 'html',
        service: 'breach',
        limit: 10,
        fields: ['email'],
        search: { query: 'user@example.com' },
        queryConfig: { filter_id: 'flt-123' },
      });

      expect(result.success).toBe(true);
      expect(result.data?.request?.service).toBe('breach');
      expect(post).toHaveBeenCalledWith('/service/v2/exports', {
        type: 'breach',
        format: 'html',
        limit: 10,
        fields: ['email'],
        search: { query: 'user@example.com' },
        service: 'breach',
        query_config: { filter_id: 'flt-123' },
      });
    });

    it('gets status and downloads with encoded job_id path segments', async () => {
      const { get, getRaw, service } = createService();
      get.mockResolvedValue({ job_id: 'job/with space', status: 'completed' });
      getRaw.mockResolvedValue(Buffer.from('email,source\n'));

      const status = await service.getExportV2('job/with space');
      const download = await service.downloadExportV2('job/with space');

      expect(status.data?.status).toBe('completed');
      expect(Buffer.isBuffer(download)).toBe(true);
      expect(get).toHaveBeenCalledWith(
        '/service/v2/exports/job%2Fwith%20space'
      );
      expect(getRaw).toHaveBeenCalledWith(
        '/service/v2/exports/job%2Fwith%20space/download'
      );
    });
  });

  describe('create', () => {
    it('should create docs export job', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.exports.create('docs', {
        format: 'jsonl',
        limit: 100,
        search: { query: 'gmail.com' },
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.job_id).toBeDefined();
    });

    it('should create victims export job', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.exports.create('victims', {
        format: 'jsonl',
        limit: 100,
        search: { query: 'gmail' },
      });
      expect(result.success).toBe(true);
      expect(result.data?.job_id).toBeDefined();
    });

    it('should support CSV format', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.exports.create('docs', {
        format: 'csv',
        limit: 100,
        search: { query: 'gmail.com' },
      });
      expect(result.success).toBe(true);
    });

    it('should support field selection', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.exports.create('docs', {
        format: 'jsonl',
        limit: 100,
        fields: ['email', 'password', 'domain'],
        search: { query: 'gmail.com' },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getStatus', () => {
    it('should get export job status', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const job = await client.exports.create('docs', {
        format: 'jsonl',
        limit: 100,
        search: { query: 'gmail.com' },
      });

      if (!job.data?.job_id) {
        throw new Error('No job ID returned');
      }

      const status = await client.exports.getStatus(job.data.job_id);
      expect(status.success).toBe(true);
      expect(['pending', 'processing', 'queued', 'running', 'completed', 'canceled']).toContain(
        status.data?.status
      );
    });
  });

  describe('waitForCompletion', () => {
    it('should wait for export completion', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const job = await client.exports.create('docs', {
        format: 'jsonl',
        limit: 100,
        search: { query: 'gmail.com' },
      });

      if (!job.data?.job_id) {
        throw new Error('No job ID returned');
      }

      const result = await client.exports.waitForCompletion(
        job.data.job_id,
        1000,
        120000
      );

      expect(result.success).toBe(true);
      expect(['completed', 'canceled']).toContain(result.data?.status);
    });
  });

  describe('download', () => {
    it.skip('should download completed export', async () => {
      // Skipping: Export download API has known issues (500 error)
    });
  });
});
