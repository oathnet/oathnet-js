/**
 * Utility Service
 */

import { OathNetClient } from '../client';
import { V2HealthData, V2AnalyticsData } from '../types';

export class UtilityService {
  constructor(private client: OathNetClient) {}

  /**
   * Autocomplete database names
   * Returns plain array of matching database names
   */
  async dbnameAutocomplete(query: string): Promise<string[]> {
    return this.client.get<string[]>('/service/dbname-autocomplete', {
      q: query,
    });
  }

  /**
   * V2 Health check
   * Returns unwrapped health status object
   */
  async health(): Promise<V2HealthData> {
    return this.client.get<V2HealthData>('/service/v2/health');
  }

  /**
   * V2 Analytics statistics
   * Returns unwrapped analytics data
   */
  async analytics(format: 'json' | 'html' = 'json'): Promise<V2AnalyticsData> {
    return this.client.get<V2AnalyticsData>('/service/v2/analytics/stats', {
      format,
    });
  }
}
