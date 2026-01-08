/**
 * Tests for OSINTService - OSINT lookups.
 */

import { OathNetClient } from '../../src';
import { getApiKey, TEST_DATA } from '../helpers';

describe('OSINTService', () => {
  let client: OathNetClient | null = null;

  beforeAll(() => {
    const apiKey = getApiKey();
    if (apiKey) {
      client = new OathNetClient(apiKey);
    }
  });

  describe('discordUserinfo', () => {
    it('should get Discord user info', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.osint.discordUserinfo(TEST_DATA.discordId);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.username).toBeDefined();
    });
  });

  describe('discordUsernameHistory', () => {
    it('should get Discord username history', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.osint.discordUsernameHistory(
        TEST_DATA.discordIdWithHistory
      );
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('discordToRoblox', () => {
    it('should get Discord to Roblox mapping', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.osint.discordToRoblox(
        TEST_DATA.discordIdWithRoblox
      );
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.roblox_id).toBeDefined();
    });
  });

  describe('steam', () => {
    it('should get Steam profile', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.osint.steam(TEST_DATA.steamId);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.username).toBeDefined();
    });
  });

  describe('xbox', () => {
    it('should get Xbox profile', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.osint.xbox(TEST_DATA.xboxGamertag);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.username).toBeDefined();
    });
  });

  describe('robloxUserinfo', () => {
    it('should get Roblox user by username', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.osint.robloxUserinfo({
        username: TEST_DATA.robloxUsername,
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.user_id).toBeDefined();
    });
  });

  describe('holehe', () => {
    it('should check email registration', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.osint.holehe(TEST_DATA.holeheEmail);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('ipInfo', () => {
    it('should get IP geolocation', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.osint.ipInfo(TEST_DATA.testIp);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.country).toBeDefined();
      expect(result.data?.city).toBeDefined();
    });
  });

  describe('extractSubdomain', () => {
    it('should extract subdomains', async () => {
      if (!client) {
        console.log('Skipping: OATHNET_API_KEY not set');
        return;
      }

      const result = await client.osint.extractSubdomain(TEST_DATA.testDomain);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });
});
