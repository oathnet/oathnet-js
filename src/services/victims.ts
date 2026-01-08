/**
 * Victims V2 Service
 */

import { OathNetClient } from '../client';
import { ApiResponse, V2VictimsData, VictimManifestData } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export interface VictimsSearchOptions {
  cursor?: string;
  pageSize?: number;
  sort?: string;
  wildcard?: boolean;
  logId?: string;
  from?: string;
  to?: string;
  totalDocsMin?: number;
  totalDocsMax?: number;
  emails?: string[];
  ips?: string[];
  hwids?: string[];
  discordIds?: string[];
  usernames?: string[];
  fields?: string[];
  searchId?: string;
}

export class VictimsService {
  constructor(private client: OathNetClient) {}

  /**
   * Search victim profiles
   */
  async search(
    query?: string,
    options: VictimsSearchOptions = {}
  ): Promise<ApiResponse<V2VictimsData>> {
    const params: Record<string, any> = {};

    if (query) params.q = query;
    if (options.cursor) params.cursor = options.cursor;
    if (options.pageSize) params.page_size = options.pageSize;
    if (options.sort) params.sort = options.sort;
    if (options.wildcard !== undefined) params.wildcard = options.wildcard;
    if (options.logId) params.log_id = options.logId;
    if (options.from) params.from = options.from;
    if (options.to) params.to = options.to;
    if (options.totalDocsMin) params.total_docs_min = options.totalDocsMin;
    if (options.totalDocsMax) params.total_docs_max = options.totalDocsMax;
    if (options.searchId) params.search_id = options.searchId;

    // Array filters use [] suffix
    if (options.emails) {
      options.emails.forEach((e) => {
        params['email[]'] = params['email[]'] || [];
        params['email[]'].push(e);
      });
    }
    if (options.ips) {
      options.ips.forEach((ip) => {
        params['ip[]'] = params['ip[]'] || [];
        params['ip[]'].push(ip);
      });
    }
    if (options.hwids) {
      options.hwids.forEach((h) => {
        params['hwid[]'] = params['hwid[]'] || [];
        params['hwid[]'].push(h);
      });
    }
    if (options.discordIds) {
      options.discordIds.forEach((d) => {
        params['discord_id[]'] = params['discord_id[]'] || [];
        params['discord_id[]'].push(d);
      });
    }
    if (options.usernames) {
      options.usernames.forEach((u) => {
        params['username[]'] = params['username[]'] || [];
        params['username[]'].push(u);
      });
    }
    if (options.fields) {
      options.fields.forEach((f) => {
        params['fields[]'] = params['fields[]'] || [];
        params['fields[]'].push(f);
      });
    }

    return this.client.get<ApiResponse<V2VictimsData>>(
      '/service/v2/victims/search',
      params
    );
  }

  /**
   * Get victim file manifest (file tree)
   * Note: Returns unwrapped response
   */
  async getManifest(logId: string): Promise<VictimManifestData> {
    // This endpoint returns unwrapped response
    return this.client.get<VictimManifestData>(
      `/service/v2/victims/${logId}`
    );
  }

  /**
   * Get victim file content
   * Note: Requires session authentication, may not work with API key only
   */
  async getFile(logId: string, fileId: string): Promise<Buffer> {
    return this.client.getRaw(`/service/v2/victims/${logId}/files/${fileId}`);
  }

  /**
   * Download victim archive as ZIP
   */
  async downloadArchive(logId: string, outputPath?: string): Promise<Buffer | string> {
    const data = await this.client.getRaw(`/service/v2/victims/${logId}/archive`);

    if (outputPath) {
      fs.writeFileSync(outputPath, data);
      return path.resolve(outputPath);
    }

    return data;
  }
}
