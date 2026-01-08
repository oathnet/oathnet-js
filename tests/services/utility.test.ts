/**
 * Tests for UtilityService - utility endpoints.
 */

import { OathNetClient } from '../../src';
import { getApiKey } from '../helpers';

describe('UtilityService', () => {
  let client: OathNetClient | null = null;

  beforeAll(() => {
    const apiKey = getApiKey();
    if (apiKey) {
      client = new OathNetClient(apiKey);
    }
  });

  describe('dbnameAutocomplete', () => {
    it('should autocomplete database names', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.utility.dbnameAutocomplete('linkedin');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return results for common prefix', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.utility.dbnameAutocomplete('face');
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
