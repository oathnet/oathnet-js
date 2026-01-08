/**
 * Stealer V2 Service
 */

import { OathNetClient } from '../client';
import { ApiResponse, V2StealerData, SubdomainData } from '../types';

export interface StealerSearchOptions {
  cursor?: string;
  pageSize?: number;
  sort?: string;
  wildcard?: boolean;
  logId?: string;
  hasLogId?: boolean;
  from?: string;
  to?: string;
  domains?: string[];
  subdomains?: string[];
  usernames?: string[];
  passwords?: string[];
  paths?: string[];
  fields?: string[];
  searchId?: string;
}

export class StealerV2Service {
  constructor(private client: OathNetClient) {}

  /**
   * Search V2 stealer database
   */
  async search(
    query?: string,
    options: StealerSearchOptions = {}
  ): Promise<ApiResponse<V2StealerData>> {
    const params: Record<string, any> = {};

    if (query) params.q = query;
    if (options.cursor) params.cursor = options.cursor;
    if (options.pageSize) params.page_size = options.pageSize;
    if (options.sort) params.sort = options.sort;
    if (options.wildcard !== undefined) params.wildcard = options.wildcard;
    if (options.logId) params.log_id = options.logId;
    if (options.hasLogId !== undefined) params.has_log_id = options.hasLogId;
    if (options.from) params.from = options.from;
    if (options.to) params.to = options.to;
    if (options.searchId) params.search_id = options.searchId;

    // Array filters use [] suffix
    if (options.domains) {
      options.domains.forEach((d) => {
        params['domain[]'] = params['domain[]'] || [];
        params['domain[]'].push(d);
      });
    }
    if (options.subdomains) {
      options.subdomains.forEach((s) => {
        params['subdomain[]'] = params['subdomain[]'] || [];
        params['subdomain[]'].push(s);
      });
    }
    if (options.usernames) {
      options.usernames.forEach((u) => {
        params['username[]'] = params['username[]'] || [];
        params['username[]'].push(u);
      });
    }
    if (options.passwords) {
      options.passwords.forEach((p) => {
        params['password[]'] = params['password[]'] || [];
        params['password[]'].push(p);
      });
    }
    if (options.paths) {
      options.paths.forEach((p) => {
        params['path[]'] = params['path[]'] || [];
        params['path[]'].push(p);
      });
    }
    if (options.fields) {
      options.fields.forEach((f) => {
        params['fields[]'] = params['fields[]'] || [];
        params['fields[]'].push(f);
      });
    }

    return this.client.get<ApiResponse<V2StealerData>>(
      '/service/v2/stealer/search',
      params
    );
  }

  /**
   * Extract subdomains from stealer data
   */
  async subdomain(
    domain: string,
    query?: string
  ): Promise<ApiResponse<SubdomainData>> {
    const params: Record<string, any> = { domain };
    if (query) params.q = query;

    return this.client.get<ApiResponse<SubdomainData>>(
      '/service/v2/stealer/subdomain',
      params
    );
  }
}
