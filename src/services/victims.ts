/**
 * Victims V2 Service
 */

import { OathNetClient } from '../client';
import {
  ApiResponse,
  V2SearchPostBody,
  V2VictimCookieDomainOptions,
  V2VictimCookieInventoryResponse,
  V2VictimCookiesOptions,
  V2VictimPropertiesOptions,
  V2VictimPropertiesSearchRequest,
  V2VictimPropertiesSearchResponse,
  V2VictimSummaryResponse,
  V2VictimsData,
  V2VictimsSearchOptions,
  V2VictimsSearchPostOptions,
  VictimManifestData,
} from '../types';
import * as fs from 'fs';
import * as path from 'path';

const VICTIMS_SEARCH_PATH = '/service/v2/victims/search';
const VICTIM_PROPERTIES_SEARCH_PATH =
  '/service/v2/victims/properties/search';

const VICTIMS_ARRAY_PARAMS: Array<[keyof V2VictimsSearchOptions, string]> = [
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
  ['usernames', 'username[]'],
  ['username[]', 'username[]'],
  ['countries', 'country[]'],
  ['country[]', 'country[]'],
  ['cities', 'city[]'],
  ['city[]', 'city[]'],
  ['operatingSystems', 'os[]'],
  ['oses', 'os[]'],
  ['os[]', 'os[]'],
  ['services', 'service[]'],
  ['service[]', 'service[]'],
  ['steamIds', 'steam_id[]'],
  ['steam_id[]', 'steam_id[]'],
  ['steamNames', 'steam_name[]'],
  ['steam_name[]', 'steam_name[]'],
  ['phones', 'phone[]'],
  ['phone[]', 'phone[]'],
  ['domains', 'domain[]'],
  ['domain[]', 'domain[]'],
  ['subdomains', 'subdomain[]'],
  ['subdomain[]', 'subdomain[]'],
  ['identityStates', 'identity_state[]'],
  ['identity_state[]', 'identity_state[]'],
  ['victimIps', 'victim_ip[]'],
  ['victim_ip[]', 'victim_ip[]'],
  ['antivirus', 'antivirus[]'],
  ['antivirus[]', 'antivirus[]'],
  ['infectionPaths', 'infection_path[]'],
  ['infection_path[]', 'infection_path[]'],
  ['fields', 'fields[]'],
  ['fields[]', 'fields[]'],
];

const KNOWN_VICTIMS_SEARCH_OPTION_KEYS = new Set<string>([
  'q',
  'cursor',
  'pageSize',
  'page_size',
  'sort',
  'wildcard',
  'logId',
  'log_id',
  'from',
  'to',
  'dateField',
  'date_field',
  'filter',
  'filterId',
  'filter_id',
  'totalDocsMin',
  'total_docs_min',
  'totalDocsMax',
  'total_docs_max',
  'serviceCountMin',
  'service_count_min',
  'serviceCountMax',
  'service_count_max',
  'searchId',
  'search_id',
  'view',
  ...VICTIMS_ARRAY_PARAMS.map(([key]) => key as string),
]);

export interface VictimsSearchOptions extends V2VictimsSearchOptions {}

export interface VictimSearchIdOptions {
  search_id?: string;
  searchId?: string;
}

export class VictimsService {
  constructor(private client: OathNetClient) {}

  /**
   * Search victim profiles
   */
  async search(
    query?: string,
    options?: VictimsSearchOptions
  ): Promise<ApiResponse<V2VictimsData>>;
  async search(
    options?: VictimsSearchOptions
  ): Promise<ApiResponse<V2VictimsData>>;
  async search(
    queryOrOptions?: string | VictimsSearchOptions,
    options: VictimsSearchOptions = {}
  ): Promise<ApiResponse<V2VictimsData>> {
    const searchOptions = this.normalizeSearchOptions(queryOrOptions, options);
    if (this.shouldUsePostSearch(searchOptions)) {
      return this.searchPost(
        this.buildPostBodyFromSearchOptions(searchOptions),
        searchOptions as V2VictimsSearchPostOptions
      );
    }

    return this.searchWithOptions(searchOptions);
  }

  /**
   * OperationId-compatible alias for GET /service/v2/victims/search.
   */
  async searchVictimsV2(
    query?: string,
    options?: VictimsSearchOptions
  ): Promise<ApiResponse<V2VictimsData>>;
  async searchVictimsV2(
    options?: VictimsSearchOptions
  ): Promise<ApiResponse<V2VictimsData>>;
  async searchVictimsV2(
    queryOrOptions?: string | VictimsSearchOptions,
    options: VictimsSearchOptions = {}
  ): Promise<ApiResponse<V2VictimsData>> {
    return this.searchWithOptions(queryOrOptions, options);
  }

  /**
   * Search victim profiles with a JSON filter body.
   */
  async searchPost(
    body: V2SearchPostBody = {},
    options: V2VictimsSearchPostOptions = {}
  ): Promise<ApiResponse<V2VictimsData>> {
    const params = this.buildSearchPostParams(options);
    const requestPath = this.buildPathWithQuery(VICTIMS_SEARCH_PATH, params);
    const data = await this.client.post<any>(
      requestPath,
      this.normalizeSearchPostBody(body)
    );
    return this.wrapVictimsResponse(data);
  }

  /**
   * OperationId-compatible alias for POST /service/v2/victims/search.
   */
  async searchVictimsV2Post(
    body: V2SearchPostBody = {},
    options: V2VictimsSearchPostOptions = {}
  ): Promise<ApiResponse<V2VictimsData>> {
    return this.searchPost(body, options);
  }

  /**
   * Search sanitized victim properties globally.
   */
  async searchProperties(
    request: V2VictimPropertiesSearchRequest = {}
  ): Promise<V2VictimPropertiesSearchResponse> {
    const params = this.normalizeVictimPropertiesRequest(request);
    return this.client.get<V2VictimPropertiesSearchResponse>(
      VICTIM_PROPERTIES_SEARCH_PATH,
      params
    );
  }

  /**
   * OperationId-compatible alias for GET /service/v2/victims/properties/search.
   */
  async searchVictimPropertiesV2(
    request: V2VictimPropertiesSearchRequest = {}
  ): Promise<V2VictimPropertiesSearchResponse> {
    return this.searchProperties(request);
  }

  /**
   * Search sanitized victim properties globally with a JSON body.
   */
  async searchPropertiesPost(
    request: V2VictimPropertiesSearchRequest = {}
  ): Promise<V2VictimPropertiesSearchResponse> {
    const data = this.normalizeVictimPropertiesRequest(request);
    return this.client.post<V2VictimPropertiesSearchResponse>(
      VICTIM_PROPERTIES_SEARCH_PATH,
      data
    );
  }

  /**
   * OperationId-compatible alias for POST /service/v2/victims/properties/search.
   */
  async searchVictimPropertiesV2Post(
    request: V2VictimPropertiesSearchRequest = {}
  ): Promise<V2VictimPropertiesSearchResponse> {
    return this.searchPropertiesPost(request);
  }

  /**
   * Get sanitized properties for one victim/log.
   */
  async getProperties(
    logId: string,
    options: V2VictimPropertiesOptions = {}
  ): Promise<V2VictimPropertiesSearchResponse> {
    const params = this.normalizeVictimPropertiesRequest(options);
    delete params.log_id;
    return this.client.get<V2VictimPropertiesSearchResponse>(
      `/service/v2/victims/${this.encode(logId)}/properties`,
      params
    );
  }

  /**
   * OperationId-compatible alias for GET /service/v2/victims/{log_id}/properties.
   */
  async getVictimPropertiesV2(
    logId: string,
    options: V2VictimPropertiesOptions = {}
  ): Promise<V2VictimPropertiesSearchResponse> {
    return this.getProperties(logId, options);
  }

  /**
   * Get a deterministic victim summary.
   */
  async getSummary(
    logId: string,
    searchId?: string
  ): Promise<V2VictimSummaryResponse> {
    const params: Record<string, any> = {};
    this.assign(params, 'search_id', searchId);
    return this.client.get<V2VictimSummaryResponse>(
      `/service/v2/victims/${this.encode(logId)}/summary`,
      params
    );
  }

  /**
   * OperationId-compatible alias for GET /service/v2/victims/{log_id}/summary.
   */
  async getVictimSummaryV2(
    logId: string,
    searchId?: string
  ): Promise<V2VictimSummaryResponse> {
    return this.getSummary(logId, searchId);
  }

  /**
   * Get value-redacted cookie metadata for one victim/log.
   */
  async getCookies(
    logId: string,
    options: V2VictimCookiesOptions = {}
  ): Promise<V2VictimCookieInventoryResponse> {
    const params = this.buildVictimCookiesParams(options);
    return this.client.get<V2VictimCookieInventoryResponse>(
      `/service/v2/victims/${this.encode(logId)}/cookies`,
      params
    );
  }

  /**
   * OperationId-compatible alias for GET /service/v2/victims/{log_id}/cookies.
   */
  async getVictimCookiesV2(
    logId: string,
    options: V2VictimCookiesOptions = {}
  ): Promise<V2VictimCookieInventoryResponse> {
    return this.getCookies(logId, options);
  }

  /**
   * Return raw cookie lines for one selected victim/domain.
   */
  async inspectCookieDomain(
    logId: string,
    domain: string,
    options: V2VictimCookieDomainOptions = {}
  ): Promise<string> {
    const params: Record<string, any> = { domain };
    this.assign(params, 'file_id', options.fileId ?? options.file_id);
    this.assign(params, 'search_id', options.searchId ?? options.search_id);
    return this.client.getText(
      `/service/v2/victims/${this.encode(logId)}/cookies/domain`,
      params
    );
  }

  /**
   * OperationId-compatible alias for GET /service/v2/victims/{log_id}/cookies/domain.
   */
  async inspectVictimCookieDomainV2(
    logId: string,
    domain: string,
    options: V2VictimCookieDomainOptions = {}
  ): Promise<string> {
    return this.inspectCookieDomain(logId, domain, options);
  }

  /**
   * Get victim file manifest (file tree)
   * Note: Returns unwrapped response
   */
  async getManifest(
    logId: string,
    options: VictimSearchIdOptions = {}
  ): Promise<VictimManifestData> {
    // This endpoint returns unwrapped response
    return this.client.get<VictimManifestData>(
      `/service/v2/victims/${this.encode(logId)}`,
      this.buildSearchIdParams(options)
    );
  }

  /**
   * OperationId-compatible alias for GET /service/v2/victims/{log_id}.
   */
  async getVictimManifestV2(
    logId: string,
    options: VictimSearchIdOptions = {}
  ): Promise<VictimManifestData> {
    return this.getManifest(logId, options);
  }

  /**
   * Get victim file content
   */
  async getFile(
    logId: string,
    fileId: string,
    options: VictimSearchIdOptions = {}
  ): Promise<Buffer> {
    return this.client.getRaw(
      this.buildPathWithQuery(
        `/service/v2/victims/${this.encode(logId)}/files/${this.encode(fileId)}`,
        this.buildSearchIdParams(options)
      )
    );
  }

  /**
   * OperationId-compatible alias for GET /service/v2/victims/{log_id}/files/{file_id}.
   */
  async getVictimFileV2(
    logId: string,
    fileId: string,
    options: VictimSearchIdOptions = {}
  ): Promise<Buffer> {
    return this.getFile(logId, fileId, options);
  }

  /**
   * Download victim archive as ZIP
   */
  async downloadArchive(
    logId: string,
    outputPath?: string,
    options: VictimSearchIdOptions = {}
  ): Promise<Buffer | string> {
    const data = await this.client.getRaw(
      this.buildPathWithQuery(
        `/service/v2/victims/${this.encode(logId)}/archive`,
        this.buildSearchIdParams(options)
      )
    );

    if (outputPath) {
      fs.writeFileSync(outputPath, data);
      return path.resolve(outputPath);
    }

    return data;
  }

  /**
   * OperationId-compatible alias for GET /service/v2/victims/{log_id}/archive.
   */
  async downloadVictimArchiveV2(
    logId: string,
    outputPath?: string,
    options: VictimSearchIdOptions = {}
  ): Promise<Buffer | string> {
    return this.downloadArchive(logId, outputPath, options);
  }

  private async searchWithOptions(
    queryOrOptions?: string | VictimsSearchOptions,
    options: VictimsSearchOptions = {}
  ): Promise<ApiResponse<V2VictimsData>> {
    const searchOptions = this.normalizeSearchOptions(queryOrOptions, options);
    const params = this.buildSearchParams(searchOptions);
    const data = await this.client.get<any>(VICTIMS_SEARCH_PATH, params);
    return this.wrapVictimsResponse(data);
  }

  private normalizeSearchOptions(
    queryOrOptions?: string | VictimsSearchOptions,
    options: VictimsSearchOptions = {}
  ): VictimsSearchOptions {
    if (typeof queryOrOptions === 'string') {
      return { ...options, q: queryOrOptions };
    }
    return queryOrOptions ?? {};
  }

  private buildSearchParams(options: VictimsSearchOptions): Record<string, any> {
    const params: Record<string, any> = {};

    this.assign(params, 'q', options.q);
    this.assign(params, 'cursor', options.cursor);
    this.assign(params, 'page_size', options.pageSize ?? options.page_size);
    this.assign(params, 'sort', options.sort);
    this.assign(params, 'from', options.from);
    this.assign(params, 'to', options.to);
    this.assign(params, 'date_field', options.dateField ?? options.date_field);
    this.assign(params, 'wildcard', options.wildcard);
    this.assign(params, 'log_id', options.logId ?? options.log_id);
    this.assign(params, 'filter', this.serializeFilter(options.filter));
    this.assign(params, 'filter_id', options.filterId ?? options.filter_id);
    this.assign(
      params,
      'total_docs_min',
      options.totalDocsMin ?? options.total_docs_min
    );
    this.assign(
      params,
      'total_docs_max',
      options.totalDocsMax ?? options.total_docs_max
    );
    this.assign(
      params,
      'service_count_min',
      options.serviceCountMin ?? options.service_count_min
    );
    this.assign(
      params,
      'service_count_max',
      options.serviceCountMax ?? options.service_count_max
    );
    this.assign(params, 'search_id', options.searchId ?? options.search_id);
    this.assign(params, 'view', options.view);

    for (const [optionKey, paramKey] of VICTIMS_ARRAY_PARAMS) {
      this.addArrayParam(params, paramKey, options[optionKey]);
    }

    for (const [key, value] of Object.entries(options)) {
      if (
        value !== undefined &&
        !KNOWN_VICTIMS_SEARCH_OPTION_KEYS.has(key) &&
        key.endsWith('[]')
      ) {
        this.addArrayParam(params, key, value);
      }
    }

    return params;
  }

  private buildSearchPostParams(
    options: V2VictimsSearchPostOptions
  ): Record<string, any> {
    const params = this.buildSearchParams(options as VictimsSearchOptions);
    delete params.q;
    delete params.filter;
    delete params.filter_id;
    return params;
  }

  private shouldUsePostSearch(options: VictimsSearchOptions): boolean {
    return (
      options.filter !== undefined ||
      options.filterId !== undefined ||
      options.filter_id !== undefined
    );
  }

  private buildPostBodyFromSearchOptions(
    options: VictimsSearchOptions
  ): V2SearchPostBody {
    const body: V2SearchPostBody = {};
    if (options.q !== undefined) {
      body.q = options.q;
    }
    if (options.filter !== undefined) {
      body.filter = options.filter as any;
    }
    const filterId = options.filterId ?? options.filter_id;
    if (filterId !== undefined) {
      body.filter_id = filterId;
    }
    return body;
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

  private normalizeVictimPropertiesRequest(
    request: V2VictimPropertiesSearchRequest | V2VictimPropertiesOptions
  ): Record<string, any> {
    const params: Record<string, any> = {};
    this.assign(params, 'q', request.q);
    this.assign(params, 'log_id', request.logId ?? request.log_id);
    this.assign(
      params,
      'property_type',
      request.propertyType ?? request.property_type
    );
    this.assign(params, 'service', request.service);
    this.assign(
      params,
      'identity_kind',
      request.identityKind ?? request.identity_kind
    );
    this.assign(params, 'account_id', request.accountId ?? request.account_id);
    this.assign(params, 'username', request.username);
    this.assign(
      params,
      'display_name',
      request.displayName ?? request.display_name
    );
    this.assign(params, 'value', request.value);
    this.assign(params, 'domain', request.domain);
    this.assign(params, 'active', request.active);
    this.assign(
      params,
      'source_type',
      request.sourceType ?? request.source_type
    );
    this.assign(
      params,
      'source_path',
      request.sourcePath ?? request.source_path
    );
    this.assign(
      params,
      'source_file_id',
      request.sourceFileId ?? request.source_file_id
    );
    this.assign(params, 'confidence', request.confidence);
    this.assign(
      params,
      'confidence_min',
      request.confidenceMin ?? request.confidence_min
    );
    this.assign(
      params,
      'include_cookie_evidence',
      request.includeCookieEvidence ?? request.include_cookie_evidence
    );
    this.assign(
      params,
      'exclude_cookie_evidence',
      request.excludeCookieEvidence ?? request.exclude_cookie_evidence
    );
    this.assign(params, 'page_size', request.pageSize ?? request.page_size);
    this.assign(params, 'cursor', request.cursor);
    this.assign(params, 'sort', request.sort);
    this.assign(params, 'search_id', request.searchId ?? request.search_id);

    for (const [key, value] of Object.entries(request)) {
      if (
        value !== undefined &&
        !(key in params) &&
        ![
          'logId',
          'propertyType',
          'identityKind',
          'accountId',
          'displayName',
          'sourceType',
          'sourcePath',
          'sourceFileId',
          'confidenceMin',
          'includeCookieEvidence',
          'excludeCookieEvidence',
          'pageSize',
          'searchId',
        ].includes(key)
      ) {
        params[key] = value;
      }
    }

    return params;
  }

  private buildVictimCookiesParams(
    options: V2VictimCookiesOptions
  ): Record<string, any> {
    const params: Record<string, any> = {};
    this.assign(params, 'domain', options.domain);
    this.assign(params, 'status', options.status);
    this.assign(params, 'q', options.q);
    this.assign(
      params,
      'include_items',
      options.includeItems ?? options.include_items
    );
    this.assign(params, 'page_size', options.pageSize ?? options.page_size);
    this.assign(params, 'cursor', options.cursor);
    this.assign(params, 'search_id', options.searchId ?? options.search_id);
    return params;
  }

  private buildSearchIdParams(options: VictimSearchIdOptions): Record<string, any> {
    const params: Record<string, any> = {};
    this.assign(params, 'search_id', options.searchId ?? options.search_id);
    return params;
  }

  private wrapVictimsResponse(data: any): ApiResponse<V2VictimsData> {
    if (data && typeof data === 'object' && 'success' in data) {
      return data as ApiResponse<V2VictimsData>;
    }
    return { success: true, data: data as V2VictimsData };
  }

  private serializeFilter(
    filter?: V2VictimsSearchOptions['filter']
  ): string | undefined {
    if (filter === undefined) {
      return undefined;
    }
    return typeof filter === 'string' ? filter : JSON.stringify(filter);
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

  private encode(value: string): string {
    return encodeURIComponent(value);
  }
}
