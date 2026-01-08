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

export class OSINTService {
  constructor(private client: OathNetClient) {}

  /**
   * Get IP address information
   */
  async ipInfo(ip: string): Promise<ApiResponse<IPInfoData>> {
    return this.client.get<ApiResponse<IPInfoData>>('/service/ip-info', {
      ip,
    });
  }

  /**
   * Get Steam profile
   */
  async steam(steamId: string): Promise<ApiResponse<SteamProfileData>> {
    return this.client.get<ApiResponse<SteamProfileData>>('/service/steam', {
      steam_id: steamId,
    });
  }

  /**
   * Get Xbox Live profile
   */
  async xbox(xblId: string): Promise<ApiResponse<XboxProfileData>> {
    return this.client.get<ApiResponse<XboxProfileData>>('/service/xbox', {
      xbl_id: xblId,
    });
  }

  /**
   * Get Discord user information
   */
  async discordUserinfo(
    discordId: string
  ): Promise<ApiResponse<DiscordUserData>> {
    return this.client.get<ApiResponse<DiscordUserData>>(
      '/service/discord-userinfo',
      { discord_id: discordId }
    );
  }

  /**
   * Get Discord username history
   */
  async discordUsernameHistory(
    discordId: string
  ): Promise<ApiResponse<DiscordUsernameHistoryData>> {
    return this.client.get<ApiResponse<DiscordUsernameHistoryData>>(
      '/service/discord-username-history',
      { discord_id: discordId }
    );
  }

  /**
   * Get Roblox account linked to Discord
   */
  async discordToRoblox(
    discordId: string
  ): Promise<ApiResponse<DiscordToRobloxData>> {
    return this.client.get<ApiResponse<DiscordToRobloxData>>(
      '/service/discord-to-roblox',
      { discord_id: discordId }
    );
  }

  /**
   * Get Roblox user information
   */
  async robloxUserinfo(options: {
    userId?: string;
    username?: string;
  }): Promise<ApiResponse<RobloxUserData>> {
    const params: Record<string, string> = {};
    if (options.userId) params.user_id = options.userId;
    if (options.username) params.username = options.username;

    return this.client.get<ApiResponse<RobloxUserData>>(
      '/service/roblox-userinfo',
      params
    );
  }

  /**
   * Check email account existence across services
   */
  async holehe(email: string): Promise<ApiResponse<HoleheData>> {
    return this.client.get<ApiResponse<HoleheData>>('/service/holehe', {
      email,
    });
  }

  /**
   * Get Google account information
   */
  async ghunt(email: string): Promise<ApiResponse<GHuntData>> {
    return this.client.get<ApiResponse<GHuntData>>('/service/ghunt', { email });
  }

  /**
   * Extract subdomains for a domain
   */
  async extractSubdomain(
    domain: string,
    isAlive?: boolean
  ): Promise<ApiResponse<ExtractSubdomainData>> {
    const params: Record<string, any> = { domain };
    if (isAlive !== undefined) params.is_alive = isAlive;

    return this.client.get<ApiResponse<ExtractSubdomainData>>(
      '/service/extract-subdomain',
      params
    );
  }

  /**
   * Get Minecraft username history
   */
  async minecraftHistory(
    username: string
  ): Promise<ApiResponse<MinecraftHistoryData>> {
    return this.client.get<ApiResponse<MinecraftHistoryData>>(
      '/service/minecraft-history',
      { username }
    );
  }
}
