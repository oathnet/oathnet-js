/**
 * OSINT Service - Various OSINT lookups
 */

import { OathNetClient } from '../client';
import {
  ApiResponse,
  IPInfoData,
  SteamProfileData,
  XboxProfileData,
  DiscordUserData,
  DiscordUsernameHistoryData,
  DiscordToRobloxData,
  RobloxUserData,
  HoleheData,
  GHuntData,
  ExtractSubdomainData,
  MinecraftHistoryData,
} from '../types';

export interface OSINTRequestOptions {
  searchId?: string;
}

export interface RobloxUserinfoOptions extends OSINTRequestOptions {
  userId?: string;
  username?: string;
}

export class OSINTService {
  constructor(private client: OathNetClient) {}

  private addSearchId(
    params: Record<string, any>,
    options: OSINTRequestOptions = {}
  ): Record<string, any> {
    if (options.searchId !== undefined) params.search_id = options.searchId;
    return params;
  }

  /**
   * Get IP address information
   */
  async ipInfo(
    ip: string,
    options: OSINTRequestOptions = {}
  ): Promise<ApiResponse<IPInfoData>> {
    return this.client.get<ApiResponse<IPInfoData>>(
      '/service/ip-info',
      this.addSearchId({ ip }, options)
    );
  }

  /**
   * Get Steam profile
   */
  async steam(
    steamId: string,
    options: OSINTRequestOptions = {}
  ): Promise<ApiResponse<SteamProfileData>> {
    return this.client.get<ApiResponse<SteamProfileData>>(
      '/service/steam',
      this.addSearchId({ steam_id: steamId }, options)
    );
  }

  /**
   * Get Xbox Live profile
   */
  async xbox(
    xblId: string,
    options: OSINTRequestOptions = {}
  ): Promise<ApiResponse<XboxProfileData>> {
    return this.client.get<ApiResponse<XboxProfileData>>(
      '/service/xbox',
      this.addSearchId({ xbl_id: xblId }, options)
    );
  }

  /**
   * Get Discord user information
   */
  async discordUserinfo(
    discordId: string,
    options: OSINTRequestOptions = {}
  ): Promise<ApiResponse<DiscordUserData>> {
    return this.client.get<ApiResponse<DiscordUserData>>(
      '/service/discord-userinfo',
      this.addSearchId({ discord_id: discordId }, options)
    );
  }

  /**
   * Get Discord username history
   */
  async discordUsernameHistory(
    discordId: string,
    options: OSINTRequestOptions = {}
  ): Promise<ApiResponse<DiscordUsernameHistoryData>> {
    return this.client.get<ApiResponse<DiscordUsernameHistoryData>>(
      '/service/discord-username-history',
      this.addSearchId({ discord_id: discordId }, options)
    );
  }

  /**
   * Get Roblox account linked to Discord
   */
  async discordToRoblox(
    discordId: string,
    options: OSINTRequestOptions = {}
  ): Promise<ApiResponse<DiscordToRobloxData>> {
    return this.client.get<ApiResponse<DiscordToRobloxData>>(
      '/service/discord-to-roblox',
      this.addSearchId({ discord_id: discordId }, options)
    );
  }

  /**
   * Get Roblox user information
   */
  async robloxUserinfo(
    options: RobloxUserinfoOptions
  ): Promise<ApiResponse<RobloxUserData>> {
    const params: Record<string, any> = {};
    if (options.userId) params.user_id = options.userId;
    if (options.username) params.username = options.username;

    return this.client.get<ApiResponse<RobloxUserData>>(
      '/service/roblox-userinfo',
      this.addSearchId(params, options)
    );
  }

  /**
   * Check email account existence across services
   */
  async holehe(
    email: string,
    options: OSINTRequestOptions = {}
  ): Promise<ApiResponse<HoleheData>> {
    return this.client.get<ApiResponse<HoleheData>>(
      '/service/holehe',
      this.addSearchId({ email }, options)
    );
  }

  /**
   * Get Google account information
   */
  async ghunt(
    email: string,
    options: OSINTRequestOptions = {}
  ): Promise<ApiResponse<GHuntData>> {
    return this.client.get<ApiResponse<GHuntData>>(
      '/service/ghunt',
      this.addSearchId({ email }, options)
    );
  }

  /**
   * Extract subdomains for a domain
   */
  async extractSubdomain(
    domain: string,
    options?: OSINTRequestOptions
  ): Promise<ApiResponse<ExtractSubdomainData>>;
  async extractSubdomain(
    domain: string,
    isAlive?: boolean,
    options?: OSINTRequestOptions
  ): Promise<ApiResponse<ExtractSubdomainData>>;
  async extractSubdomain(
    domain: string,
    isAliveOrOptions?: boolean | OSINTRequestOptions,
    options: OSINTRequestOptions = {}
  ): Promise<ApiResponse<ExtractSubdomainData>> {
    const params: Record<string, any> = { domain };
    const requestOptions =
      typeof isAliveOrOptions === 'object' ? isAliveOrOptions : options;
    if (typeof isAliveOrOptions === 'boolean') {
      params.is_alive = isAliveOrOptions;
    }

    return this.client.get<ApiResponse<ExtractSubdomainData>>(
      '/service/extract-subdomain',
      this.addSearchId(params, requestOptions)
    );
  }

  /**
   * Get Minecraft username history
   */
  async minecraftHistory(
    username: string,
    options: OSINTRequestOptions = {}
  ): Promise<ApiResponse<MinecraftHistoryData>> {
    return this.client.get<ApiResponse<MinecraftHistoryData>>(
      '/service/mc-history',
      this.addSearchId({ username }, options)
    );
  }
}
