/**
 * Stealer V2 Service
 */

import { OathNetClient } from '../client';
import {
  ApiResponse,
  StructuredFilterNode,
  SubdomainData,
  V2InvestigationSearchOptions,
  V2InvestigationSearchRequest,
  V2InvestigationSearchResponse,
  V2PhonebookOptions,
  V2PhonebookRequest,
  V2PhonebookResponse,
  V2StealerData,
} from '../types';

const STEALER_SEARCH_PATH = '/service/v2/stealer/search';
const STEALER_SUBDOMAIN_PATH = '/service/v2/stealer/subdomain';
const STEALER_INVESTIGATION_PATH = '/service/v2/stealer/investigation/search';
const LEGACY_INVESTIGATION_PATH = '/service/v2/investigate/search';
const PHONEBOOK_PATH = '/service/v2/phonebook';

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
      STEALER_SEARCH_PATH,
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
      STEALER_SUBDOMAIN_PATH,
      params
    );
  }

  /**
   * Run the canonical GET stealer investigation search.
   */
  async investigate(
    query?: string,
    options?: V2InvestigationSearchOptions
  ): Promise<V2InvestigationSearchResponse>;
  async investigate(
    options?: V2InvestigationSearchOptions
  ): Promise<V2InvestigationSearchResponse>;
  async investigate(
    queryOrOptions?: string | V2InvestigationSearchOptions,
    options: V2InvestigationSearchOptions = {}
  ): Promise<V2InvestigationSearchResponse> {
    return this.investigateWithPath(
      STEALER_INVESTIGATION_PATH,
      queryOrOptions,
      options
    );
  }

  /**
   * OperationId-compatible alias for GET /service/v2/stealer/investigation/search.
   */
  async investigateStealerV2(
    query?: string,
    options?: V2InvestigationSearchOptions
  ): Promise<V2InvestigationSearchResponse>;
  async investigateStealerV2(
    options?: V2InvestigationSearchOptions
  ): Promise<V2InvestigationSearchResponse>;
  async investigateStealerV2(
    queryOrOptions?: string | V2InvestigationSearchOptions,
    options: V2InvestigationSearchOptions = {}
  ): Promise<V2InvestigationSearchResponse> {
    return this.investigateWithPath(
      STEALER_INVESTIGATION_PATH,
      queryOrOptions,
      options
    );
  }

  /**
   * Run the canonical POST stealer investigation search.
   */
  async investigatePost(
    request: V2InvestigationSearchRequest = {}
  ): Promise<V2InvestigationSearchResponse> {
    return this.investigatePostWithPath(STEALER_INVESTIGATION_PATH, request);
  }

  /**
   * OperationId-compatible alias for POST /service/v2/stealer/investigation/search.
   */
  async investigateStealerV2Post(
    request: V2InvestigationSearchRequest = {}
  ): Promise<V2InvestigationSearchResponse> {
    return this.investigatePost(request);
  }

  /**
   * Deprecated operationId-compatible alias for GET /service/v2/investigate/search.
   */
  async investigateV2Alias(
    query?: string,
    options?: V2InvestigationSearchOptions
  ): Promise<V2InvestigationSearchResponse>;
  async investigateV2Alias(
    options?: V2InvestigationSearchOptions
  ): Promise<V2InvestigationSearchResponse>;
  async investigateV2Alias(
    queryOrOptions?: string | V2InvestigationSearchOptions,
    options: V2InvestigationSearchOptions = {}
  ): Promise<V2InvestigationSearchResponse> {
    return this.investigateWithPath(
      LEGACY_INVESTIGATION_PATH,
      queryOrOptions,
      options
    );
  }

  /**
   * Deprecated operationId-compatible alias for POST /service/v2/investigate/search.
   */
  async investigateV2AliasPost(
    request: V2InvestigationSearchRequest = {}
  ): Promise<V2InvestigationSearchResponse> {
    return this.investigatePostWithPath(LEGACY_INVESTIGATION_PATH, request);
  }

  /**
   * Get raw Phonebook domain intelligence.
   */
  async phonebook(
    domain: string,
    options?: V2PhonebookOptions
  ): Promise<V2PhonebookResponse>;
  async phonebook(request: V2PhonebookRequest): Promise<V2PhonebookResponse>;
  async phonebook(
    domainOrRequest: string | V2PhonebookRequest,
    options: V2PhonebookOptions = {}
  ): Promise<V2PhonebookResponse> {
    const params = this.buildPhonebookParams(domainOrRequest, options);
    return this.client.get<V2PhonebookResponse>(PHONEBOOK_PATH, params);
  }

  /**
   * OperationId-compatible alias for GET /service/v2/phonebook.
   */
  async getPhonebookV2(
    domain: string,
    options?: V2PhonebookOptions
  ): Promise<V2PhonebookResponse>;
  async getPhonebookV2(
    request: V2PhonebookRequest
  ): Promise<V2PhonebookResponse>;
  async getPhonebookV2(
    domainOrRequest: string | V2PhonebookRequest,
    options: V2PhonebookOptions = {}
  ): Promise<V2PhonebookResponse> {
    if (typeof domainOrRequest === 'string') {
      return this.phonebook(domainOrRequest, options);
    }
    return this.phonebook(domainOrRequest);
  }

  private async investigateWithPath(
    path: string,
    queryOrOptions?: string | V2InvestigationSearchOptions,
    options: V2InvestigationSearchOptions = {}
  ): Promise<V2InvestigationSearchResponse> {
    const searchOptions = this.normalizeInvestigationOptions(
      queryOrOptions,
      options
    );
    const params = this.buildInvestigationParams(searchOptions);
    return this.client.get<V2InvestigationSearchResponse>(path, params);
  }

  private async investigatePostWithPath(
    path: string,
    request: V2InvestigationSearchRequest
  ): Promise<V2InvestigationSearchResponse> {
    const data = this.normalizeInvestigationBody(request);
    return this.client.post<V2InvestigationSearchResponse>(path, data);
  }

  private normalizeInvestigationOptions(
    queryOrOptions?: string | V2InvestigationSearchOptions,
    options: V2InvestigationSearchOptions = {}
  ): V2InvestigationSearchOptions {
    if (typeof queryOrOptions === 'string') {
      return { ...options, q: queryOrOptions };
    }
    return queryOrOptions ?? {};
  }

  private buildInvestigationParams(
    options: V2InvestigationSearchOptions
  ): Record<string, any> {
    const params: Record<string, any> = {};

    this.assign(params, 'q', options.q);
    this.assign(params, 'scope', options.scope);
    this.assignInclude(params, options.include);
    this.assign(params, 'page_size', options.pageSize ?? options.page_size);
    this.assign(params, 'search_id', options.searchId ?? options.search_id);
    this.assign(params, 'filter', this.serializeFilter(options.filter));
    this.assign(params, 'filter_id', options.filterId ?? options.filter_id);
    this.assign(
      params,
      'filter_mode',
      options.filterMode ?? options.filter_mode
    );
    this.assign(params, 'compact', options.compact);
    this.assign(params, 'view', options.view);
    this.assign(
      params,
      'include_cookie_evidence',
      options.includeCookieEvidence ?? options.include_cookie_evidence
    );
    this.assign(
      params,
      'exclude_cookie_evidence',
      options.excludeCookieEvidence ?? options.exclude_cookie_evidence
    );

    return params;
  }

  private normalizeInvestigationBody(
    request: V2InvestigationSearchRequest
  ): V2InvestigationSearchRequest {
    const normalized: V2InvestigationSearchRequest = {};
    const aliasKeys = new Set([
      'dateField',
      'excludeCookieEvidence',
      'filterId',
      'filterMode',
      'hasLogId',
      'includeCookieEvidence',
      'logId',
      'pageSize',
      'searchId',
    ]);

    for (const [key, value] of Object.entries(request)) {
      if (value !== undefined && !aliasKeys.has(key)) {
        normalized[key] = value;
      }
    }

    this.assignAlias(normalized, 'date_field', request.dateField);
    this.assignAlias(
      normalized,
      'exclude_cookie_evidence',
      request.excludeCookieEvidence
    );
    this.assignAlias(normalized, 'filter_id', request.filterId);
    this.assignAlias(normalized, 'filter_mode', request.filterMode);
    this.assignAlias(normalized, 'has_log_id', request.hasLogId);
    this.assignAlias(
      normalized,
      'include_cookie_evidence',
      request.includeCookieEvidence
    );
    this.assignAlias(normalized, 'log_id', request.logId);
    this.assignAlias(normalized, 'page_size', request.pageSize);
    this.assignAlias(normalized, 'search_id', request.searchId);

    return normalized;
  }

  private buildPhonebookParams(
    domainOrRequest: string | V2PhonebookRequest,
    options: V2PhonebookOptions
  ): Record<string, any> {
    const request =
      typeof domainOrRequest === 'string'
        ? { ...options, domain: domainOrRequest }
        : domainOrRequest;

    if (request.domain === undefined && request.q === undefined) {
      throw new Error('domain is required');
    }

    const params: Record<string, any> = {};
    this.assign(params, 'domain', request.domain);
    this.assign(params, 'q', request.q);
    this.assign(params, 'alive', request.alive);
    this.assign(params, 'is_alive', request.isAlive ?? request.is_alive);
    this.assign(params, 'search_id', request.searchId ?? request.search_id);
    return params;
  }

  private serializeFilter(
    filter?: StructuredFilterNode | string
  ): string | undefined {
    if (filter === undefined) {
      return undefined;
    }
    return typeof filter === 'string' ? filter : JSON.stringify(filter);
  }

  private assignInclude(
    params: Record<string, any>,
    include?: V2InvestigationSearchOptions['include']
  ): void {
    if (include === undefined) {
      return;
    }
    params.include = Array.isArray(include) ? include.join(',') : include;
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

  private assignAlias(
    target: V2InvestigationSearchRequest,
    key: keyof V2InvestigationSearchRequest,
    value: unknown
  ): void {
    if (value !== undefined && target[key] === undefined) {
      target[key] = value;
    }
  }
}
