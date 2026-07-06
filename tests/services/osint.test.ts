/**
 * Tests for OSINTService - OSINT lookups.
 */

import { OathNetClient } from '../../src';
import { OSINTService } from '../../src/services/osint';
import { getApiKey, TEST_DATA } from '../helpers';

describe('OSINTService', () => {
  let client: OathNetClient | null = null;

  beforeAll(() => {
    const apiKey = getApiKey();
    if (apiKey) {
      client = new OathNetClient(apiKey);
    }
  });

  describe('request construction', () => {
    const createService = () => {
      const get = jest.fn().mockResolvedValue({ success: true });
      const service = new OSINTService({
        get,
      } as unknown as OathNetClient);

      return { get, service };
    };

    it('uses canonical Minecraft history path and search_id', async () => {
      const { get, service } = createService();

      await service.minecraftHistory('Notch', { searchId: 'search-123' });

      expect(get).toHaveBeenCalledWith('/service/mc-history', {
        username: 'Notch',
        search_id: 'search-123',
      });
    });

    it('passes search_id for scalar OSINT lookup methods', async () => {
      const { get, service } = createService();
      const cases: Array<{
        call: () => Promise<unknown>;
        params: Record<string, any>;
        path: string;
      }> = [
        {
          call: () => service.ipInfo('8.8.8.8', { searchId: 'search-123' }),
          path: '/service/ip-info',
          params: { ip: '8.8.8.8', search_id: 'search-123' },
        },
        {
          call: () => service.steam('steam-1', { searchId: 'search-123' }),
          path: '/service/steam',
          params: { steam_id: 'steam-1', search_id: 'search-123' },
        },
        {
          call: () => service.xbox('gamertag', { searchId: 'search-123' }),
          path: '/service/xbox',
          params: { xbl_id: 'gamertag', search_id: 'search-123' },
        },
        {
          call: () =>
            service.discordUserinfo('discord-1', { searchId: 'search-123' }),
          path: '/service/discord-userinfo',
          params: { discord_id: 'discord-1', search_id: 'search-123' },
        },
        {
          call: () =>
            service.discordUsernameHistory('discord-1', {
              searchId: 'search-123',
            }),
          path: '/service/discord-username-history',
          params: { discord_id: 'discord-1', search_id: 'search-123' },
        },
        {
          call: () =>
            service.discordToRoblox('discord-1', { searchId: 'search-123' }),
          path: '/service/discord-to-roblox',
          params: { discord_id: 'discord-1', search_id: 'search-123' },
        },
        {
          call: () =>
            service.holehe('person@example.com', { searchId: 'search-123' }),
          path: '/service/holehe',
          params: { email: 'person@example.com', search_id: 'search-123' },
        },
        {
          call: () =>
            service.ghunt('person@example.com', { searchId: 'search-123' }),
          path: '/service/ghunt',
          params: { email: 'person@example.com', search_id: 'search-123' },
        },
      ];

      for (const testCase of cases) {
        get.mockClear();

        await testCase.call();

        expect(get).toHaveBeenCalledWith(testCase.path, testCase.params);
      }
    });

    it('passes search_id for Roblox lookup options', async () => {
      const { get, service } = createService();

      await service.robloxUserinfo({
        username: 'builderman',
        searchId: 'search-123',
      });

      expect(get).toHaveBeenCalledWith('/service/roblox-userinfo', {
        username: 'builderman',
        search_id: 'search-123',
      });
    });

    it('keeps extractSubdomain boolean support while adding search_id', async () => {
      const { get, service } = createService();

      await service.extractSubdomain('example.com', true, {
        searchId: 'search-123',
      });

      expect(get).toHaveBeenCalledWith('/service/extract-subdomain', {
        domain: 'example.com',
        is_alive: true,
        search_id: 'search-123',
      });
    });

    it('allows extractSubdomain search_id without an alive flag', async () => {
      const { get, service } = createService();

      await service.extractSubdomain('example.com', {
        searchId: 'search-123',
      });

      expect(get).toHaveBeenCalledWith('/service/extract-subdomain', {
        domain: 'example.com',
        search_id: 'search-123',
      });
    });
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
