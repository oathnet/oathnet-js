/**
 * Exports V2 Service
 */

import { OathNetClient } from '../client';
import { ApiResponse, ExportJobData } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export interface ExportCreateOptions {
  format?: 'jsonl' | 'csv';
  limit?: number;
  fields?: string[];
  search?: Record<string, any>;
}

export class ExportsService {
  constructor(private client: OathNetClient) {}

  /**
   * Create an export job
   */
  async create(
    exportType: 'docs' | 'victims',
    options: ExportCreateOptions = {}
  ): Promise<ApiResponse<ExportJobData>> {
    const body: Record<string, any> = {
      type: exportType,
      format: options.format || 'jsonl',
    };

    if (options.limit) body.limit = options.limit;
    if (options.fields) body.fields = options.fields;
    if (options.search) body.search = options.search;

    const data = await this.client.post<any>('/service/v2/exports', body);
    // Handle wrapped or unwrapped response
    if ('success' in data) {
      return data as ApiResponse<ExportJobData>;
    }
    return { success: true, data: data as ExportJobData };
  }

  /**
   * Get export job status
   */
  async getStatus(jobId: string): Promise<ApiResponse<ExportJobData>> {
    const data = await this.client.get<any>(`/service/v2/exports/${jobId}`);
    if ('success' in data) {
      return data as ApiResponse<ExportJobData>;
    }
    return { success: true, data: data as ExportJobData };
  }

  /**
   * Download export file
   */
  async download(jobId: string, outputPath?: string): Promise<Buffer | string> {
    const data = await this.client.getRaw(
      `/service/v2/exports/${jobId}/download`
    );

    if (outputPath) {
      fs.writeFileSync(outputPath, data);
      return path.resolve(outputPath);
    }

    return data;
  }

  /**
   * Wait for export job to complete
   */
  async waitForCompletion(
    jobId: string,
    pollInterval: number = 2000,
    timeout: number = 600000
  ): Promise<ApiResponse<ExportJobData>> {
    const startTime = Date.now();

    while (true) {
      const response = await this.getStatus(jobId);
      const status = response.data?.status;

      if (status === 'completed' || status === 'canceled') {
        return response;
      }

      const elapsed = Date.now() - startTime;
      if (elapsed >= timeout) {
        throw new Error(
          `Export job ${jobId} did not complete within ${timeout}ms`
        );
      }

      const suggestedPoll = response.data?.next_poll_after_ms || pollInterval;
      await this.sleep(Math.min(suggestedPoll, pollInterval));
    }
  }

  /**
   * Create export, wait for completion, and download
   */
  async export(
    exportType: 'docs' | 'victims',
    outputPath: string,
    options: ExportCreateOptions = {},
    timeout: number = 600000
  ): Promise<string> {
    const job = await this.create(exportType, options);
    if (!job.data?.job_id) {
      throw new Error('Failed to create export job');
    }
    await this.waitForCompletion(job.data.job_id, 2000, timeout);
    return this.download(job.data.job_id, outputPath) as Promise<string>;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
