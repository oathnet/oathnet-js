/**
 * Exports V2 Service
 */

import { OathNetClient } from '../client';
import {
  ApiResponse,
  ExportJobData,
  V2ExportJobListOptions,
  V2ExportJobListResponse,
} from '../types';
import * as fs from 'fs';
import * as path from 'path';

export interface ExportCreateOptions {
  format?: 'json' | 'jsonl' | 'csv' | 'txt' | 'html';
  limit?: number;
  fields?: string[];
  search?: Record<string, any>;
  service?: 'stealer' | 'victims' | 'breach';
  queryConfig?: Record<string, any>;
  query_config?: Record<string, any>;
}

export class ExportsService {
  constructor(private client: OathNetClient) {}

  /**
   * Create an export job
   */
  async create(
    exportType: 'docs' | 'victims' | 'breach',
    options: ExportCreateOptions = {}
  ): Promise<ApiResponse<ExportJobData>> {
    const body: Record<string, any> = {
      type: exportType,
      format: options.format || 'jsonl',
    };

    if (options.limit) body.limit = options.limit;
    if (options.fields) body.fields = options.fields;
    if (options.search) body.search = options.search;
    if (options.service) body.service = options.service;
    if (options.queryConfig || options.query_config) {
      body.query_config = options.queryConfig ?? options.query_config;
    }

    const data = await this.client.post<any>('/service/v2/exports', body);
    // Handle wrapped or unwrapped response
    if ('success' in data) {
      return data as ApiResponse<ExportJobData>;
    }
    return { success: true, data: data as ExportJobData };
  }

  /**
   * OperationId-compatible alias for POST /service/v2/exports.
   */
  async createExportV2(
    exportType: 'docs' | 'victims' | 'breach',
    options: ExportCreateOptions = {}
  ): Promise<ApiResponse<ExportJobData>> {
    return this.create(exportType, options);
  }

  /**
   * Get export job status
   */
  async getStatus(jobId: string): Promise<ApiResponse<ExportJobData>> {
    const data = await this.client.get<any>(
      `/service/v2/exports/${this.encode(jobId)}`
    );
    if ('success' in data) {
      return data as ApiResponse<ExportJobData>;
    }
    return { success: true, data: data as ExportJobData };
  }

  /**
   * OperationId-compatible alias for GET /service/v2/exports/{job_id}.
   */
  async getExportV2(jobId: string): Promise<ApiResponse<ExportJobData>> {
    return this.getStatus(jobId);
  }

  /**
   * List export jobs.
   */
  async list(
    options?: V2ExportJobListOptions
  ): Promise<V2ExportJobListResponse>;
  async list(
    page?: number,
    pageSize?: number
  ): Promise<V2ExportJobListResponse>;
  async list(
    optionsOrPage?: V2ExportJobListOptions | number,
    pageSize?: number
  ): Promise<V2ExportJobListResponse> {
    const params = this.buildListParams(optionsOrPage, pageSize);
    return this.client.get<V2ExportJobListResponse>(
      '/service/v2/exports/list',
      params
    );
  }

  /**
   * OperationId-compatible alias for GET /service/v2/exports/list.
   */
  async listExportsV2(
    options?: V2ExportJobListOptions
  ): Promise<V2ExportJobListResponse>;
  async listExportsV2(
    page?: number,
    pageSize?: number
  ): Promise<V2ExportJobListResponse>;
  async listExportsV2(
    optionsOrPage?: V2ExportJobListOptions | number,
    pageSize?: number
  ): Promise<V2ExportJobListResponse> {
    const params = this.buildListParams(optionsOrPage, pageSize);
    return this.client.get<V2ExportJobListResponse>(
      '/service/v2/exports/list',
      params
    );
  }

  /**
   * Download export file
   */
  async download(jobId: string, outputPath?: string): Promise<Buffer | string> {
    const data = await this.client.getRaw(
      `/service/v2/exports/${this.encode(jobId)}/download`
    );

    if (outputPath) {
      fs.writeFileSync(outputPath, data);
      return path.resolve(outputPath);
    }

    return data;
  }

  /**
   * OperationId-compatible alias for GET /service/v2/exports/{job_id}/download.
   */
  async downloadExportV2(
    jobId: string,
    outputPath?: string
  ): Promise<Buffer | string> {
    return this.download(jobId, outputPath);
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
      await this.sleep(suggestedPoll);
    }
  }

  /**
   * Create export, wait for completion, and download
   */
  async export(
    exportType: 'docs' | 'victims' | 'breach',
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

  private encode(value: string): string {
    return encodeURIComponent(value);
  }

  private buildListParams(
    optionsOrPage?: V2ExportJobListOptions | number,
    pageSize?: number
  ): Record<string, any> {
    if (typeof optionsOrPage === 'number') {
      return {
        page: optionsOrPage,
        ...(pageSize !== undefined ? { page_size: pageSize } : {}),
      };
    }

    const options = optionsOrPage ?? {};
    const params: Record<string, any> = {};
    if (options.page !== undefined) params.page = options.page;
    if (options.pageSize !== undefined || options.page_size !== undefined) {
      params.page_size = options.pageSize ?? options.page_size;
    }
    return params;
  }
}
