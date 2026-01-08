/**
 * Search Service - Breach and Stealer search
 */

import { OathNetClient } from '../client';
import {
  ApiResponse,
  SearchSessionData,
  BreachSearchData,
  StealerSearchData,
} from '../types';

export interface BreachSearchOptions {
  cursor?: string;
  dbnames?: string;
  searchId?: string;
}

export interface StealerSearchOptions {
  cursor?: string;
  dbnames?: string;
  searchId?: string;
}

export class SearchService {
  constructor(private client: OathNetClient) {}

  /**
   * Initialize a search session
   */
  async initSession(query: string): Promise<ApiResponse<SearchSessionData>> {
    return this.client.post<ApiResponse<SearchSessionData>>(
      '/service/search/init',
      { query }
    );
  }

  /**
   * Search breach database
   */
  async breach(
    query: string,
    options: BreachSearchOptions = {}
  ): Promise<ApiResponse<BreachSearchData>> {
    const params: Record<string, any> = { q: query };
    if (options.cursor) params.cursor = options.cursor;
    if (options.dbnames) params.dbnames = options.dbnames;
    if (options.searchId) params.search_id = options.searchId;

    return this.client.get<ApiResponse<BreachSearchData>>(
      '/service/search-breach',
      params
    );
  }

  /**
   * Search stealer database (legacy)
   */
  async stealer(
    query: string,
    options: StealerSearchOptions = {}
  ): Promise<ApiResponse<StealerSearchData>> {
    const params: Record<string, any> = { q: query };
    if (options.cursor) params.cursor = options.cursor;
    if (options.dbnames) params.dbnames = options.dbnames;
    if (options.searchId) params.search_id = options.searchId;

    return this.client.get<ApiResponse<StealerSearchData>>(
      '/service/search-stealer',
      params
    );
  }
}
