/**
 * Bulk Search Service
 *
 * NOTE: Bulk search endpoints may require session-based authentication
 * rather than API key authentication. If you encounter authentication
 * errors, this functionality may only be available through the web interface.
 */

import { OathNetClient } from '../client';
import { ApiResponse, BulkJobData, BulkJobListData } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export interface BulkCreateOptions {
  format?: 'json' | 'csv';
  dbnames?: string[];
}

export class BulkService {
  constructor(private client: OathNetClient) {}

  /**
   * Create a bulk search job
   * NOTE: May require session authentication
   */
  async create(
    terms: string[],
    service: 'breach' | 'stealer',
    options: BulkCreateOptions = {}
  ): Promise<ApiResponse<BulkJobData>> {
    const body: Record<string, any> = {
      terms,
      service,
      format: options.format || 'json',
    };

    if (options.dbnames) body.dbnames = options.dbnames;

    const data = await this.client.post<any>('/service/bulk-search', body);
    if ('success' in data) {
      return data as ApiResponse<BulkJobData>;
    }
    return { success: true, data: data as BulkJobData };
  }

  /**
   * Get bulk job status
   */
  async getStatus(jobId: string): Promise<ApiResponse<BulkJobData>> {
    const data = await this.client.get<any>(
      `/service/bulk-search/${jobId}/status`
    );
    if ('success' in data) {
      return data as ApiResponse<BulkJobData>;
    }
    return { success: true, data: data as BulkJobData };
  }

  /**
   * List bulk jobs
   */
  async list(
    page: number = 1,
    pageSize: number = 10
  ): Promise<BulkJobListData> {
    return this.client.get<BulkJobListData>('/service/bulk-search/list', {
      page,
      page_size: pageSize,
    });
  }

  /**
   * Download bulk search results
   */
  async download(jobId: string, outputPath?: string): Promise<Buffer | string> {
    const data = await this.client.getRaw(
      `/service/bulk-search/download?job_id=${jobId}`
    );

    if (outputPath) {
      fs.writeFileSync(outputPath, data);
      return path.resolve(outputPath);
    }

    return data;
  }

  /**
   * Wait for bulk job to complete
   */
  async waitForCompletion(
    jobId: string,
    pollInterval: number = 5000,
    timeout: number = 600000
  ): Promise<ApiResponse<BulkJobData>> {
    const startTime = Date.now();

    while (true) {
      const response = await this.getStatus(jobId);
      const status = response.data?.status;

      if (
        status === 'COMPLETED' ||
        status === 'FAILED' ||
        status === 'completed' ||
        status === 'canceled'
      ) {
        return response;
      }

      const elapsed = Date.now() - startTime;
      if (elapsed >= timeout) {
        throw new Error(
          `Bulk job ${jobId} did not complete within ${timeout}ms`
        );
      }

      await this.sleep(pollInterval);
    }
  }

  /**
   * Create bulk search, wait, and download
   */
  async search(
    terms: string[],
    service: 'breach' | 'stealer',
    outputPath: string,
    options: BulkCreateOptions = {},
    timeout: number = 600000
  ): Promise<string> {
    const job = await this.create(terms, service, options);
    const jobId = job.data?.job_id || (job.data as any)?.id;
    if (!jobId) {
      throw new Error('Failed to create bulk job');
    }
    await this.waitForCompletion(jobId, 5000, timeout);
    return this.download(jobId, outputPath) as Promise<string>;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
