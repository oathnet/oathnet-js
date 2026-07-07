/**
 * Utility Service
 */

import { OathNetClient } from '../client';

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

}
