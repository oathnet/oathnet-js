/**
 * File Search V2 Service
 */

import { OathNetClient } from '../client';
import {
  ApiResponse,
  FileSearchJobData,
  V2FileMetadataSearchRequest,
  V2FileMetadataSearchResponse,
} from '../types';

const FILE_METADATA_SEARCH_PATH = '/service/v2/files/search';

export interface FileSearchCreateOptions {
  searchMode?: 'literal' | 'regex' | 'wildcard';
  logIds?: string[];
  includeMatches?: boolean;
  caseSensitive?: boolean;
  contextLines?: number;
  filePattern?: string;
  maxMatches?: number;
}

export class FileSearchService {
  constructor(private client: OathNetClient) {}

  /**
   * Search sanitized victim file metadata.
   */
  async searchMetadata(
    request: V2FileMetadataSearchRequest = {}
  ): Promise<V2FileMetadataSearchResponse> {
    const params = this.normalizeMetadataRequest(request);
    return this.client.get<V2FileMetadataSearchResponse>(
      FILE_METADATA_SEARCH_PATH,
      params
    );
  }

  /**
   * OperationId-compatible alias for GET /service/v2/files/search.
   */
  async searchFilesMetadataV2(
    request: V2FileMetadataSearchRequest = {}
  ): Promise<V2FileMetadataSearchResponse> {
    return this.searchMetadata(request);
  }

  /**
   * Search sanitized victim file metadata with a JSON body.
   */
  async searchMetadataPost(
    request: V2FileMetadataSearchRequest = {}
  ): Promise<V2FileMetadataSearchResponse> {
    const data = this.normalizeMetadataRequest(request);
    return this.client.post<V2FileMetadataSearchResponse>(
      FILE_METADATA_SEARCH_PATH,
      data
    );
  }

  /**
   * OperationId-compatible alias for POST /service/v2/files/search.
   */
  async searchFilesMetadataV2Post(
    request: V2FileMetadataSearchRequest = {}
  ): Promise<V2FileMetadataSearchResponse> {
    return this.searchMetadataPost(request);
  }

  /**
   * Create a file search job
   */
  async create(
    expression: string,
    options: FileSearchCreateOptions = {}
  ): Promise<ApiResponse<FileSearchJobData>> {
    const body: Record<string, any> = {
      expression,
      search_mode: options.searchMode || 'literal',
      include_matches: options.includeMatches ?? true,
      case_sensitive: options.caseSensitive ?? false,
      context_lines: options.contextLines ?? 2,
      max_matches: options.maxMatches ?? 100,
    };

    if (options.logIds) body.log_ids = options.logIds;
    if (options.filePattern) body.file_pattern = options.filePattern;

    const data = await this.client.post<any>('/service/v2/file-search', body);
    // Handle wrapped or unwrapped response
    if ('success' in data) {
      return data as ApiResponse<FileSearchJobData>;
    }
    return { success: true, data: data as FileSearchJobData };
  }

  /**
   * Get file search job status
   */
  async getStatus(jobId: string): Promise<ApiResponse<FileSearchJobData>> {
    const data = await this.client.get<any>(`/service/v2/file-search/${jobId}`);
    if ('success' in data) {
      return data as ApiResponse<FileSearchJobData>;
    }
    return { success: true, data: data as FileSearchJobData };
  }

  /**
   * Wait for file search job to complete
   */
  async waitForCompletion(
    jobId: string,
    pollInterval: number = 2000,
    timeout: number = 300000
  ): Promise<ApiResponse<FileSearchJobData>> {
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
          `File search job ${jobId} did not complete within ${timeout}ms`
        );
      }

      // Use server-suggested poll interval if available
      const suggestedPoll = response.data?.next_poll_after_ms || pollInterval;
      await this.sleep(Math.min(suggestedPoll, pollInterval));
    }
  }

  /**
   * Create a file search and wait for results
   */
  async search(
    expression: string,
    options: FileSearchCreateOptions = {},
    timeout: number = 300000
  ): Promise<ApiResponse<FileSearchJobData>> {
    const job = await this.create(expression, options);
    if (!job.data?.job_id) {
      throw new Error('Failed to create file search job');
    }
    return this.waitForCompletion(job.data.job_id, 2000, timeout);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private normalizeMetadataRequest(
    request: V2FileMetadataSearchRequest
  ): Record<string, any> {
    const params: Record<string, any> = {};
    this.assign(params, 'q', request.q);
    this.assign(params, 'log_id', request.logId ?? request.log_id);
    this.assign(params, 'name', request.name);
    this.assign(params, 'folder', request.folder);
    this.assign(params, 'kind', request.kind);
    this.assign(params, 'ext', request.ext);
    this.assign(params, 'size_min', request.sizeMin ?? request.size_min);
    this.assign(params, 'size_max', request.sizeMax ?? request.size_max);
    this.assign(params, 'page_size', request.pageSize ?? request.page_size);
    this.assign(params, 'cursor', request.cursor);
    this.assign(params, 'search_id', request.searchId ?? request.search_id);

    for (const [key, value] of Object.entries(request)) {
      if (
        value !== undefined &&
        !(key in params) &&
        !['logId', 'sizeMin', 'sizeMax', 'pageSize', 'searchId'].includes(key)
      ) {
        params[key] = value;
      }
    }

    return params;
  }

  private assign(
    params: Record<string, any>,
    key: string,
    value: unknown
  ): void {
    if (value !== undefined) {
      params[key] = value;
    }
  }
}
