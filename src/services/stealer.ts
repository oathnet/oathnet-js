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
  V2SearchPostBody,
  V2StealerSearchOptions,
  V2StealerSearchPostOptions,
  V2StealerData,
} from '../types';

const STEALER_SEARCH_PATH = '/service/v2/stealer/search';
const STEALER_SUBDOMAIN_PATH = '/service/v2/stealer/subdomain';
const STEALER_INVESTIGATION_PATH = '/service/v2/stealer/investigation/search';
const LEGACY_INVESTIGATION_PATH = '/service/v2/investigate/search';
const PHONEBOOK_PATH = '/service/v2/phonebook';

export interface StealerSubdomainOptions {
  q?: string;
  query?: string;
  alive?: boolean;
  isAlive?: boolean;
  is_alive?: boolean;
  searchId?: string;
  search_id?: string;
}

const STEALER_ARRAY_PARAMS: Array<[keyof V2StealerSearchOptions, string]> = [
  ['domains', 'domain[]'],
  ['domain[]', 'domain[]'],
  ['subdomains', 'subdomain[]'],
  ['subdomain[]', 'subdomain[]'],
  ['usernames', 'username[]'],
  ['username[]', 'username[]'],
  ['passwords', 'password[]'],
  ['password[]', 'password[]'],
  ['passwordHashes', 'password_hash[]'],
  ['password_hash[]', 'password_hash[]'],
  ['paths', 'path[]'],
  ['path[]', 'path[]'],
  ['emails', 'email[]'],
  ['email[]', 'email[]'],
  ['emailDomains', 'email_domain[]'],
  ['email_domain[]', 'email_domain[]'],
  ['ips', 'ip[]'],
  ['ip[]', 'ip[]'],
  ['hwids', 'hwid[]'],
  ['hwid[]', 'hwid[]'],
  ['discordIds', 'discord_id[]'],
  ['discord_id[]', 'discord_id[]'],
  ['sourceTypes', 'source_type[]'],
  ['source_type[]', 'source_type[]'],
  ['archiveHashes', 'archive_hash[]'],
  ['archive_hash[]', 'archive_hash[]'],
  ['canonicalCredentialIds', 'canonical_credential_id[]'],
  ['canonical_credential_id[]', 'canonical_credential_id[]'],
  ['fields', 'fields[]'],
  ['fields[]', 'fields[]'],
];

const KNOWN_STEALER_SEARCH_OPTION_KEYS = new Set<string>([
  'q',
  'cursor',
  'pageSize',
  'page_size',
  'sort',
  'wildcard',
  'logic',
  'logId',
  'log_id',
  'hasLogId',
  'has_log_id',
  'from',
  'to',
  'dateField',
  'date_field',
  'filter',
  'filterId',
  'filter_id',
  'searchId',
  'search_id',
  'view',
  ...STEALER_ARRAY_PARAMS.map(([key]) => key as string),
]);

export interface StealerSearchOptions extends V2StealerSearchOptions {}

export class StealerV2Service {
  constructor(private client: OathNetClient) {}

  /**
   * Search V2 stealer database
   */
  async search(
    query?: string,
    options?: StealerSearchOptions
  ): Promise<ApiResponse<V2StealerData>>;
  async search(
    options?: StealerSearchOptions
  ): Promise<ApiResponse<V2StealerData>>;
  async search(
    queryOrOptions?: string | StealerSearchOptions,
    options: StealerSearchOptions = {}
  ): Promise<ApiResponse<V2StealerData>> {
    return this.searchWithOptions(queryOrOptions, options);
  }

  /**
   * OperationId-compatible alias for GET /service/v2/stealer/search.
   */
  async searchStealerV2(
    query?: string,
    options?: StealerSearchOptions
  ): Promise<ApiResponse<V2StealerData>>;
  async searchStealerV2(
    options?: StealerSearchOptions
  ): Promise<ApiResponse<V2StealerData>>;
  async searchStealerV2(
    queryOrOptions?: string | StealerSearchOptions,
    options: StealerSearchOptions = {}
  ): Promise<ApiResponse<V2StealerData>> {
    return this.searchWithOptions(queryOrOptions, options);
  }

  /**
   * Search V2 stealer records with a JSON filter body.
   */
  async searchPost(
    body: V2SearchPostBody = {},
    options: V2StealerSearchPostOptions = {}
  ): Promise<ApiResponse<V2StealerData>> {
    const params = this.buildSearchPostParams(options);
    const path = this.buildPathWithQuery(STEALER_SEARCH_PATH, params);
    const data = this.normalizeSearchPostBody(body);

    return this.client.post<ApiResponse<V2StealerData>>(path, data);
  }

  /**
   * OperationId-compatible alias for POST /service/v2/stealer/search.
   */
  async searchStealerV2Post(
    body: V2SearchPostBody = {},
    options: V2StealerSearchPostOptions = {}
  ): Promise<ApiResponse<V2StealerData>> {
    return this.searchPost(body, options);
  }

  private async searchWithOptions(
    queryOrOptions?: string | StealerSearchOptions,
    options: StealerSearchOptions = {}
  ): Promise<ApiResponse<V2StealerData>> {
    const searchOptions = this.normalizeSearchOptions(queryOrOptions, options);
    const params = this.buildSearchParams(searchOptions);
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
    queryOrOptions?: string | StealerSubdomainOptions,
    options: StealerSubdomainOptions = {}
  ): Promise<ApiResponse<SubdomainData>> {
    const params: Record<string, any> = { domain };
    const requestOptions =
      typeof queryOrOptions === 'string'
        ? { ...options, q: queryOrOptions }
        : queryOrOptions ?? options;
    const query = requestOptions.q ?? requestOptions.query;
    const isAlive =
      requestOptions.alive ?? requestOptions.isAlive ?? requestOptions.is_alive;
    const searchId = requestOptions.searchId ?? requestOptions.search_id;

    if (query) params.q = query;
    if (isAlive !== undefined) params.alive = isAlive;
    if (requestOptions.is_alive !== undefined) params.is_alive = requestOptions.is_alive;
    if (searchId !== undefined) params.search_id = searchId;

    return this.client.get<ApiResponse<SubdomainData>>(
      STEALER_SUBDOMAIN_PATH,
      params
    );
  }

  /**
   * OperationId-compatible alias for GET /service/v2/stealer/subdomain.
   */
  async extractSubdomainV2(
    domain: string,
    options: StealerSubdomainOptions = {}
  ): Promise<ApiResponse<SubdomainData>> {
    return this.subdomain(domain, options);
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

  private normalizeSearchOptions(
    queryOrOptions?: string | StealerSearchOptions,
    options: StealerSearchOptions = {}
  ): StealerSearchOptions {
    if (typeof queryOrOptions === 'string') {
      return { ...options, q: queryOrOptions };
    }
    return queryOrOptions ?? {};
  }

  private buildSearchParams(options: StealerSearchOptions): Record<string, any> {
    const params: Record<string, any> = {};

    this.assign(params, 'q', options.q);
    this.assign(params, 'cursor', options.cursor);
    this.assign(params, 'page_size', options.pageSize ?? options.page_size);
    this.assign(params, 'sort', options.sort);
    this.assign(params, 'from', options.from);
    this.assign(params, 'to', options.to);
    this.assign(params, 'date_field', options.dateField ?? options.date_field);
    this.assign(params, 'log_id', options.logId ?? options.log_id);
    this.assign(params, 'has_log_id', options.hasLogId ?? options.has_log_id);
    this.assign(params, 'wildcard', options.wildcard);
    this.assign(params, 'logic', options.logic);
    this.assign(params, 'filter', this.serializeFilter(options.filter));
    this.assign(params, 'filter_id', options.filterId ?? options.filter_id);
    this.assign(params, 'search_id', options.searchId ?? options.search_id);
    this.assign(params, 'view', options.view);

    for (const [optionKey, paramKey] of STEALER_ARRAY_PARAMS) {
      this.addArrayParam(params, paramKey, options[optionKey]);
    }

    for (const [key, value] of Object.entries(options)) {
      if (
        value !== undefined &&
        !KNOWN_STEALER_SEARCH_OPTION_KEYS.has(key) &&
        key.endsWith('[]')
      ) {
        this.addArrayParam(params, key, value);
      }
    }

    return params;
  }

  private buildSearchPostParams(
    options: V2StealerSearchPostOptions
  ): Record<string, any> {
    const params: Record<string, any> = {};
    this.assign(params, 'cursor', options.cursor);
    this.assign(params, 'page_size', options.pageSize ?? options.page_size);
    this.assign(params, 'sort', options.sort);
    this.assign(params, 'from', options.from);
    this.assign(params, 'to', options.to);
    this.assign(params, 'date_field', options.dateField ?? options.date_field);
    this.assign(params, 'search_id', options.searchId ?? options.search_id);
    this.assign(params, 'view', options.view);
    this.addArrayParam(params, 'fields[]', options.fields ?? options['fields[]']);

    for (const [key, value] of Object.entries(options)) {
      if (
        value !== undefined &&
        ![
          'cursor',
          'pageSize',
          'page_size',
          'sort',
          'from',
          'to',
          'dateField',
          'date_field',
          'fields',
          'fields[]',
          'searchId',
          'search_id',
          'view',
        ].includes(key) &&
        key.endsWith('[]')
      ) {
        this.addArrayParam(params, key, value);
      }
    }

    return params;
  }

  private normalizeSearchPostBody(body: V2SearchPostBody): V2SearchPostBody {
    const normalized: V2SearchPostBody = {};

    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined && key !== 'filterId') {
        normalized[key] = value;
      }
    }

    if (body.filterId !== undefined && normalized.filter_id === undefined) {
      normalized.filter_id = body.filterId;
    }

    return normalized;
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

  private addArrayParam(
    params: Record<string, any>,
    key: string,
    value: unknown
  ): void {
    if (value === undefined) {
      return;
    }

    const values = Array.isArray(value) ? value : [value];
    if (!params[key]) {
      params[key] = [];
    }
    params[key].push(...values);
  }

  private buildPathWithQuery(path: string, params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) {
        continue;
      }
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else {
        searchParams.set(key, String(value));
      }
    }

    const query = searchParams.toString();
    return query ? `${path}?${query}` : path;
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
