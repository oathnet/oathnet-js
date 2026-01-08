/**
 * OathNet SDK for Node.js
 *
 * Official Node.js SDK for the OathNet API.
 *
 * @example
 * ```typescript
 * import { OathNetClient } from 'oathnet';
 *
 * const client = new OathNetClient('your-api-key');
 *
 * // Search breach database
 * const breachResults = await client.search.breach('winterfox');
 *
 * // Get IP info
 * const ipInfo = await client.osint.ipInfo('174.235.65.156');
 *
 * // Discord lookup
 * const discordUser = await client.osint.discordUserinfo('300760994454437890');
 * ```
 */

export { OathNetClient, OathNetClientOptions } from './client';

// Export all types
export * from './types';

// Export services for advanced use cases
export { SearchService } from './services/search';
export { OSINTService } from './services/osint';
export { StealerV2Service } from './services/stealer';
export { VictimsService } from './services/victims';
export { FileSearchService } from './services/fileSearch';
export { ExportsService } from './services/exports';
export { UtilityService } from './services/utility';
