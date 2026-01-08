/**
 * Test helpers for OathNet SDK tests.
 */

import { OathNetClient } from '../src';

/**
 * Get API key from environment.
 * Returns undefined if not set, allowing tests to skip.
 */
export function getApiKey(): string | undefined {
  return process.env.OATHNET_API_KEY;
}

/**
 * Create a test client.
 * Returns null if API key is not available.
 */
export function createTestClient(): OathNetClient | null {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }
  return new OathNetClient(apiKey);
}

/**
 * Skip test if API key is not available.
 */
export function skipIfNoApiKey(): void {
  if (!getApiKey()) {
    console.log('Skipping test: OATHNET_API_KEY not set');
  }
}

/**
 * Require API key or skip test.
 */
export function requireApiKey(): string {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OATHNET_API_KEY required for this test');
  }
  return apiKey;
}

/**
 * Sleep for specified milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Test data constants
 */
export const TEST_DATA = {
  // Known working Discord IDs
  discordId: '300760994454437890',
  discordIdWithHistory: '1375046349392974005',
  discordIdWithRoblox: '1205957884584656927',

  // Known working Steam ID
  steamId: '1100001586a2b38',

  // Known working Xbox gamertag
  xboxGamertag: 'ethan',

  // Known working Roblox username
  robloxUsername: 'chris',

  // Test email for holehe
  holeheEmail: 'ethan_lewis_196@hotmail.co.uk',

  // Test IP address
  testIp: '174.235.65.156',

  // Test domain for subdomain extraction
  testDomain: 'limabean.co.za',

  // Breach search queries
  breachQuery: 'winterfox',
  stealerQuery: 'gmail.com',
  victimsQuery: 'gmail',
};
