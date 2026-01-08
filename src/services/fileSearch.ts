/**
 * File Search V2 Service
 */

import { OathNetClient } from '../client';
import { ApiResponse, FileSearchJobData } from '../types';

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
}
