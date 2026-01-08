/**
 * Tests for OathNetClient initialization and basic functionality.
 */

import { OathNetClient } from '../src';
import { getApiKey, createTestClient } from './helpers';

describe('OathNetClient', () => {
  describe('initialization', () => {
    it('should require API key', () => {
      expect(() => new OathNetClient('')).toThrow('API key is required');
    });

    it('should initialize with API key', () => {
      const client = new OathNetClient('test-api-key');
      expect(client.apiKey).toBe('test-api-key');
    });

    it('should accept custom options', () => {
      const client = new OathNetClient('test-api-key', {
        baseUrl: 'https://custom.api.com',
        timeout: 60000,
      });
      expect(client.apiKey).toBe('test-api-key');
    });
  });

  describe('services', () => {
    const client = new OathNetClient('test-api-key');

    it('should have search service', () => {
      expect(client.search).toBeDefined();
    });

    it('should have osint service', () => {
      expect(client.osint).toBeDefined();
    });

    it('should have stealer service', () => {
      expect(client.stealer).toBeDefined();
    });

    it('should have victims service', () => {
      expect(client.victims).toBeDefined();
    });

    it('should have fileSearch service', () => {
      expect(client.fileSearch).toBeDefined();
    });

    it('should have exports service', () => {
      expect(client.exports).toBeDefined();
    });

    it('should have bulk service', () => {
      expect(client.bulk).toBeDefined();
    });

    it('should have utility service', () => {
      expect(client.utility).toBeDefined();
    });

    it('should return same service instance on multiple accesses', () => {
      const search1 = client.search;
      const search2 = client.search;
      expect(search1).toBe(search2);
    });
  });

  describe('integration', () => {
    const apiKey = getApiKey();

    it('should make successful API call with valid key', async () => {
      if (!apiKey) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const client = new OathNetClient(apiKey);
      const result = await client.search.breach('winterfox');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle invalid API key', async () => {
      const client = new OathNetClient('invalid-api-key');

      await expect(client.search.breach('test')).rejects.toThrow();
    });
  });
});
