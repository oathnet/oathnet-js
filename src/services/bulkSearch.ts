/**
 * Bulk Search V2 Service
 */

import { OathNetClient } from '../client';
import {
  ApiResponse,
  BulkSearchCreateRequest,
  BulkSearchJobData,
  BulkSearchListOptions,
  BulkSearchListResponse,
} from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class BulkSearchService {
  constructor(private client: OathNetClient) {}

  /**
   * Create an asynchronous bulk-search job.
   */
  async create(
    request: BulkSearchCreateRequest
  ): Promise<ApiResponse<BulkSearchJobData>> {
    const data = await this.client.post<any>('/service/v2/bulk-search', request);
    if ('success' in data) {
      return data as ApiResponse<BulkSearchJobData>;
    }
    return { success: true, data: data as BulkSearchJobData };
  }

  /**
   * OperationId-compatible alias for POST /service/v2/bulk-search.
   */
  async createBulkSearchV2(
    request: BulkSearchCreateRequest
  ): Promise<ApiResponse<BulkSearchJobData>> {
    return this.create(request);
  }

  /**
   * List owned bulk-search jobs.
   */
  async list(
    options: BulkSearchListOptions = {}
  ): Promise<BulkSearchListResponse> {
    const params: Record<string, any> = {};
    if (options.page !== undefined) params.page = options.page;

    const pageSize = options.pageSize ?? options.page_size;
    if (pageSize !== undefined) params.page_size = pageSize;

    return this.client.get<BulkSearchListResponse>(
      '/service/v2/bulk-search/list',
      params
    );
  }

  /**
   * OperationId-compatible alias for GET /service/v2/bulk-search/list.
   */
  async listBulkSearchV2(
    options: BulkSearchListOptions = {}
  ): Promise<BulkSearchListResponse> {
    return this.list(options);
  }

  /**
   * Descriptive alias for GET /service/v2/bulk-search/list.
   */
  async listBulkSearchJobsV2(
    options: BulkSearchListOptions = {}
  ): Promise<BulkSearchListResponse> {
    return this.list(options);
  }

  /**
   * Get one bulk-search job snapshot.
   */
  async get(jobId: string): Promise<BulkSearchJobData> {
    return this.client.get<BulkSearchJobData>(
      `/service/v2/bulk-search/${this.encode(jobId)}`
    );
  }

  /**
   * OperationId-compatible alias for GET /service/v2/bulk-search/{job_id}.
   */
  async getBulkSearchV2(jobId: string): Promise<BulkSearchJobData> {
    return this.get(jobId);
  }

  /**
   * Descriptive alias for GET /service/v2/bulk-search/{job_id}.
   */
  async getBulkSearchJobV2(jobId: string): Promise<BulkSearchJobData> {
    return this.get(jobId);
  }

  /**
   * Download bulk-search results as raw bytes.
   *
   * This SDK's raw download path is Node-only: OathNetClient.getRaw returns a
   * Buffer and optional outputPath writes through fs. Browser callers should use
   * fetch/Blob handling against the same endpoint.
   */
  async download(
    jobId: string,
    outputPath?: string
  ): Promise<Buffer | string> {
    const data = await this.client.getRaw(
      `/service/v2/bulk-search/${this.encode(jobId)}/download`
    );

    if (outputPath) {
      fs.writeFileSync(outputPath, data);
      return path.resolve(outputPath);
    }

    return data;
  }

  /**
   * OperationId-compatible alias for GET /service/v2/bulk-search/{job_id}/download.
   */
  async downloadBulkSearchV2(
    jobId: string,
    outputPath?: string
  ): Promise<Buffer | string> {
    return this.download(jobId, outputPath);
  }

  /**
   * Descriptive alias for GET /service/v2/bulk-search/{job_id}/download.
   */
  async downloadBulkSearchResultsV2(
    jobId: string,
    outputPath?: string
  ): Promise<Buffer | string> {
    return this.download(jobId, outputPath);
  }

  private encode(value: string): string {
    return encodeURIComponent(value);
  }
}
