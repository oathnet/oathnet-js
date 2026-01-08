/**
 * Tests for ExportsService - async exports.
 */

import { OathNetClient } from '../../src';
import { getApiKey } from '../helpers';

describe('ExportsService', () => {
  let client: OathNetClient | null = null;

  beforeAll(() => {
    const apiKey = getApiKey();
    if (apiKey) {
      client = new OathNetClient(apiKey);
    }
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
