/**
 * Breach V2 Service
 */

import { OathNetClient } from '../client';
import {
  ApiResponse,
  StructuredFilterNode,
  V2AutocompleteDBNamesResponse,
  V2AutocompleteFieldsResponse,
  V2AutocompleteValueResponse,
  V2BreachAutocompleteDBNamesOptions,
  V2BreachAutocompleteFieldsOptions,
  V2BreachAutocompleteValuesOptions,
  V2BreachData,
  V2BreachSearchOptions,
  V2BreachSearchPostBody,
  V2BreachSearchPostOptions,
} from '../types';

const BREACH_SEARCH_PATH = '/service/v2/breach/search';
const BREACH_AUTOCOMPLETE_PATH = '/service/v2/breach/autocomplete';
const BREACH_AUTOCOMPLETE_DBNAMES_PATH =
  '/service/v2/breach/autocomplete/dbnames';
const BREACH_AUTOCOMPLETE_FIELDS_PATH =
  '/service/v2/breach/autocomplete/fields';

const SEARCH_ARRAY_PARAMS: Array<[keyof V2BreachSearchOptions, string]> = [
  ['emails', 'email[]'],
  ['email[]', 'email[]'],
  ['emailDomains', 'email_domain[]'],
  ['email_domain[]', 'email_domain[]'],
  ['domains', 'domain[]'],
  ['domain[]', 'domain[]'],
  ['usernames', 'username[]'],
  ['username[]', 'username[]'],
  ['passwords', 'password[]'],
  ['password[]', 'password[]'],
  ['passwordHashes', 'password_hash[]'],
  ['password_hash[]', 'password_hash[]'],
  ['ips', 'ip[]'],
  ['ip[]', 'ip[]'],
  ['phones', 'phone[]'],
  ['phone[]', 'phone[]'],
  ['firstNames', 'first_name[]'],
  ['first_name[]', 'first_name[]'],
  ['lastNames', 'last_name[]'],
  ['last_name[]', 'last_name[]'],
  ['fullNames', 'full_name[]'],
  ['full_name[]', 'full_name[]'],
  ['cities', 'city[]'],
  ['city[]', 'city[]'],
  ['countries', 'country[]'],
  ['country[]', 'country[]'],
  ['states', 'state[]'],
  ['state[]', 'state[]'],
  ['postalCodes', 'postal_code[]'],
  ['postal_code[]', 'postal_code[]'],
  ['dbnames', 'dbname[]'],
  ['dbname[]', 'dbname[]'],
  ['discordIds', 'discord_id[]'],
  ['discord_id[]', 'discord_id[]'],
  ['ibans', 'iban[]'],
  ['iban[]', 'iban[]'],
  ['ssns', 'ssn[]'],
  ['ssn[]', 'ssn[]'],
  ['names', 'name[]'],
  ['name[]', 'name[]'],
  ['genders', 'gender[]'],
  ['gender[]', 'gender[]'],
  ['addresses', 'address[]'],
  ['address[]', 'address[]'],
  ['discords', 'discord[]'],
  ['discord[]', 'discord[]'],
  ['socials', 'social[]'],
  ['social[]', 'social[]'],
  ['financials', 'financial[]'],
  ['financial[]', 'financial[]'],
  ['gamings', 'gaming[]'],
  ['gaming[]', 'gaming[]'],
  ['fields', 'fields[]'],
  ['fields[]', 'fields[]'],
];

const KNOWN_SEARCH_OPTION_KEYS = new Set<string>([
  'q',
  'cursor',
  'pageSize',
  'page_size',
  'sort',
  'from',
  'to',
  'dateField',
  'date_field',
  'wildcard',
  'logic',
  'filter',
  'filterId',
  'filter_id',
  'searchId',
  'search_id',
  'date_birth_from',
  'date_birth_to',
  ...SEARCH_ARRAY_PARAMS.map(([key]) => key as string),
]);

export class BreachV2Service {
  constructor(private client: OathNetClient) {}

  /**
   * Search V2 breach records.
   */
  async search(
    query?: string,
    options?: V2BreachSearchOptions
  ): Promise<ApiResponse<V2BreachData>>;
  async search(
    options?: V2BreachSearchOptions
  ): Promise<ApiResponse<V2BreachData>>;
  async search(
    queryOrOptions?: string | V2BreachSearchOptions,
    options: V2BreachSearchOptions = {}
  ): Promise<ApiResponse<V2BreachData>> {
    const searchOptions = this.normalizeSearchOptions(queryOrOptions, options);
    const params = this.buildSearchParams(searchOptions);

    return this.client.get<ApiResponse<V2BreachData>>(
      BREACH_SEARCH_PATH,
      params
    );
  }

  /**
   * OperationId-compatible alias for GET /service/v2/breach/search.
   */
  async searchBreachV2(
    query?: string,
    options?: V2BreachSearchOptions
  ): Promise<ApiResponse<V2BreachData>>;
  async searchBreachV2(
    options?: V2BreachSearchOptions
  ): Promise<ApiResponse<V2BreachData>>;
  async searchBreachV2(
    queryOrOptions?: string | V2BreachSearchOptions,
    options: V2BreachSearchOptions = {}
  ): Promise<ApiResponse<V2BreachData>> {
    const searchOptions = this.normalizeSearchOptions(queryOrOptions, options);
    return this.search(searchOptions);
  }

  /**
   * Search V2 breach records with a JSON filter body.
   */
  async searchPost(
    body: V2BreachSearchPostBody = {},
    options: V2BreachSearchPostOptions = {}
  ): Promise<ApiResponse<V2BreachData>> {
    const params = this.buildPostQueryParams(options);
    const path = this.buildPathWithQuery(BREACH_SEARCH_PATH, params);
    const data = this.normalizePostBody(body);

    return this.client.post<ApiResponse<V2BreachData>>(path, data);
  }

  /**
   * OperationId-compatible alias for POST /service/v2/breach/search.
   */
  async searchBreachV2Post(
    body: V2BreachSearchPostBody = {},
    options: V2BreachSearchPostOptions = {}
  ): Promise<ApiResponse<V2BreachData>> {
    return this.searchPost(body, options);
  }

  /**
   * Autocomplete raw breach values for supported fields.
   */
  async autocompleteValues(
    options: V2BreachAutocompleteValuesOptions = {}
  ): Promise<V2AutocompleteValueResponse> {
    const params: Record<string, any> = {};
    if (options.field !== undefined) params.field = options.field;
    if (options.q !== undefined) params.q = options.q;
    if (options.limit !== undefined) params.limit = options.limit;

    const includeInfo = options.includeInfo ?? options.include_info;
    if (includeInfo !== undefined) params.include_info = includeInfo;

    return this.client.get<V2AutocompleteValueResponse>(
      BREACH_AUTOCOMPLETE_PATH,
      params
    );
  }

  /**
   * Descriptive alias for GET /service/v2/breach/autocomplete.
   */
  async autocomplete(
    options: V2BreachAutocompleteValuesOptions = {}
  ): Promise<V2AutocompleteValueResponse> {
    return this.autocompleteValues(options);
  }

  /**
   * OperationId-compatible alias for GET /service/v2/breach/autocomplete.
   */
  async autocompleteBreachValuesV2(
    options: V2BreachAutocompleteValuesOptions = {}
  ): Promise<V2AutocompleteValueResponse> {
    return this.autocompleteValues(options);
  }

  /**
   * Autocomplete breach database names.
   */
  async autocompleteDBNames(
    options: V2BreachAutocompleteDBNamesOptions = {}
  ): Promise<V2AutocompleteDBNamesResponse> {
    const params: Record<string, any> = {};
    if (options.q !== undefined) params.q = options.q;
    if (options.limit !== undefined) params.limit = options.limit;

    return this.client.get<V2AutocompleteDBNamesResponse>(
      BREACH_AUTOCOMPLETE_DBNAMES_PATH,
      params
    );
  }

  /**
   * OperationId-compatible alias for GET /service/v2/breach/autocomplete/dbnames.
   */
  async autocompleteBreachDBNamesV2(
    options: V2BreachAutocompleteDBNamesOptions = {}
  ): Promise<V2AutocompleteDBNamesResponse> {
    return this.autocompleteDBNames(options);
  }

  /**
   * Find breach database names that contain a field.
   */
  async autocompleteFields(
    field: string,
    options: V2BreachAutocompleteFieldsOptions = {}
  ): Promise<V2AutocompleteFieldsResponse> {
    const params: Record<string, any> = { field };
    if (options.limit !== undefined) params.limit = options.limit;

    return this.client.get<V2AutocompleteFieldsResponse>(
      BREACH_AUTOCOMPLETE_FIELDS_PATH,
      params
    );
  }

  /**
   * OperationId-compatible alias for GET /service/v2/breach/autocomplete/fields.
   */
  async autocompleteBreachFieldsV2(
    field: string,
    options: V2BreachAutocompleteFieldsOptions = {}
  ): Promise<V2AutocompleteFieldsResponse> {
    return this.autocompleteFields(field, options);
  }

  private normalizeSearchOptions(
    queryOrOptions?: string | V2BreachSearchOptions,
    options: V2BreachSearchOptions = {}
  ): V2BreachSearchOptions {
    if (typeof queryOrOptions === 'string') {
      return { ...options, q: queryOrOptions };
    }
    return queryOrOptions ?? {};
  }

  private buildSearchParams(options: V2BreachSearchOptions): Record<string, any> {
    const params: Record<string, any> = {};

    this.assign(params, 'q', options.q);
    this.assign(params, 'cursor', options.cursor);
    this.assign(params, 'page_size', options.pageSize ?? options.page_size);
    this.assign(params, 'sort', options.sort);
    this.assign(params, 'from', options.from);
    this.assign(params, 'to', options.to);
    this.assign(params, 'date_field', options.dateField ?? options.date_field);
    this.assign(params, 'wildcard', options.wildcard);
    this.assign(params, 'logic', options.logic);
    this.assign(params, 'filter', this.serializeFilter(options.filter));
    this.assign(params, 'filter_id', options.filterId ?? options.filter_id);
    this.assign(params, 'date_birth_from', options.date_birth_from);
    this.assign(params, 'date_birth_to', options.date_birth_to);
    this.assign(params, 'search_id', options.searchId ?? options.search_id);

    for (const [optionKey, paramKey] of SEARCH_ARRAY_PARAMS) {
      this.addArrayParam(params, paramKey, options[optionKey]);
    }

    for (const [key, value] of Object.entries(options)) {
      if (
        value !== undefined &&
        !KNOWN_SEARCH_OPTION_KEYS.has(key) &&
        key.endsWith('[]')
      ) {
        this.addArrayParam(params, key, value);
      }
    }

    return params;
  }

  private buildPostQueryParams(
    options: V2BreachSearchPostOptions
  ): Record<string, any> {
    const params = this.buildSearchParams(options as V2BreachSearchOptions);
    delete params.filter;
    delete params.filter_id;
    return params;
  }

  private normalizePostBody(
    body: V2BreachSearchPostBody
  ): V2BreachSearchPostBody {
    const normalized: V2BreachSearchPostBody = {};

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

  private serializeFilter(
    filter?: StructuredFilterNode | string
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
}
