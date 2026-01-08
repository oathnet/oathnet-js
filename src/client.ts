/**
 * OathNet API Client
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  OathNetError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  QuotaExceededError,
  RateLimitError,
} from './types';
import { SearchService } from './services/search';
import { OSINTService } from './services/osint';
import { StealerV2Service } from './services/stealer';
import { VictimsService } from './services/victims';
import { FileSearchService } from './services/fileSearch';
import { ExportsService } from './services/exports';
import { UtilityService } from './services/utility';

export interface OathNetClientOptions {
  baseUrl?: string;
  timeout?: number;
}

export class OathNetClient {
  private httpClient: AxiosInstance;
  private _search?: SearchService;
  private _osint?: OSINTService;
  private _stealer?: StealerV2Service;
  private _victims?: VictimsService;
  private _fileSearch?: FileSearchService;
  private _exports?: ExportsService;
  private _utility?: UtilityService;

  constructor(
    public readonly apiKey: string,
    options: OathNetClientOptions = {}
  ) {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    const baseUrl = options.baseUrl || 'https://oathnet.org/api';
    const timeout = options.timeout || 30000;

    this.httpClient = axios.create({
      baseURL: baseUrl,
      timeout: timeout,
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Make a GET request to the API
   */
  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.httpClient.get<T>(path, { params });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a POST request to the API
   */
  async post<T>(path: string, data?: any): Promise<T> {
    try {
      const response = await this.httpClient.post<T>(path, data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Download raw bytes from the API
   */
  async getRaw(path: string): Promise<Buffer> {
    try {
      const response = await this.httpClient.get(path, {
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleResponse<T>(response: AxiosResponse<T>): T {
    return response.data;
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      const message = data?.message || data?.error || error.message;

      // Check for auth errors in response message
      if (
        message?.toLowerCase().includes('credentials') ||
        message?.toLowerCase().includes('api key') ||
        message?.toLowerCase().includes('invalid api key')
      ) {
        return new AuthenticationError(message, data);
      }

      switch (status) {
        case 401:
          return new AuthenticationError(message, data);
        case 400:
          return new ValidationError(message, data);
        case 404:
          return new NotFoundError(message, data);
        case 429:
          if (message?.toLowerCase().includes('quota')) {
            return new QuotaExceededError(message, data);
          }
          return new RateLimitError(message, data);
        default:
          return new OathNetError(message, status, data);
      }
    }
    return error;
  }

  // Service accessors
  get search(): SearchService {
    if (!this._search) {
      this._search = new SearchService(this);
    }
    return this._search;
  }

  get osint(): OSINTService {
    if (!this._osint) {
      this._osint = new OSINTService(this);
    }
    return this._osint;
  }

  get stealer(): StealerV2Service {
    if (!this._stealer) {
      this._stealer = new StealerV2Service(this);
    }
    return this._stealer;
  }

  get victims(): VictimsService {
    if (!this._victims) {
      this._victims = new VictimsService(this);
    }
    return this._victims;
  }

  get fileSearch(): FileSearchService {
    if (!this._fileSearch) {
      this._fileSearch = new FileSearchService(this);
    }
    return this._fileSearch;
  }

  get exports(): ExportsService {
    if (!this._exports) {
      this._exports = new ExportsService(this);
    }
    return this._exports;
  }

  get utility(): UtilityService {
    if (!this._utility) {
      this._utility = new UtilityService(this);
    }
    return this._utility;
  }
}
