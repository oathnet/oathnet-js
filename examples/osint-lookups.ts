#!/usr/bin/env ts-node
/**
 * OSINT lookups example - all OSINT methods.
 *
 * This example demonstrates:
 * - Discord user info and username history
 * - Discord to Roblox mapping
 * - Steam and Xbox profile lookups
 * - Roblox user info
 * - Email analysis with Holehe
 * - IP geolocation
 * - Subdomain extraction
 *
 * Run: OATHNET_API_KEY="your-key" npx ts-node examples/osint-lookups.ts
 */

import { OathNetClient, NotFoundError, ValidationError } from '../src';

async function main() {
  const apiKey = process.env.OATHNET_API_KEY;
  if (!apiKey) {
    console.error('Error: Set OATHNET_API_KEY environment variable');
    process.exit(1);
  }

  const client = new OathNetClient(apiKey);

  // Discord User Info
  console.log('=== Discord User Info ===');
  try {
    const result = await client.osint.discordUserinfo('300760994454437890');
    if (result.success && result.data) {
      console.log(`Username: ${result.data.username}`);
      console.log(`Display Name: ${result.data.display_name}`);
      console.log(`Avatar: ${result.data.avatar}`);
    }
  } catch (error: any) {
    console.log(`Error: ${error.message}`);
  }

  // Discord Username History
  console.log('\n=== Discord Username History ===');
  try {
    const result = await client.osint.discordUsernameHistory(
      '1375046349392974005'
    );
    if (result.success && result.data?.history?.length) {
      console.log(`Found ${result.data.history.length} username changes:`);
      result.data.history.slice(0, 5).forEach((entry: any) => {
        console.log(`  - ${entry}`);
      });
    } else {
      console.log('No username history found');
    }
  } catch (error: any) {
    console.log(`Error: ${error.message}`);
  }

  // Discord to Roblox
  console.log('\n=== Discord to Roblox ===');
  try {
    const result = await client.osint.discordToRoblox('1205957884584656927');
    if (result.success && result.data) {
      console.log(`Roblox ID: ${result.data.roblox_id}`);
      console.log(`Roblox Name: ${result.data.name}`);
      console.log(`Display Name: ${result.data.displayName}`);
    }
  } catch (error: any) {
    console.log(`Error: ${error.message}`);
  }

  // Steam Profile
  console.log('\n=== Steam Profile ===');
  try {
    const result = await client.osint.steam('1100001586a2b38');
    if (result.success && result.data) {
      console.log(`Username: ${result.data.username}`);
      console.log(`Profile URL: ${result.data.profile_url}`);
      if (result.data.real_name) {
        console.log(`Real Name: ${result.data.real_name}`);
      }
    }
  } catch (error: any) {
    console.log(`Error: ${error.message}`);
  }

  // Xbox Profile
  console.log('\n=== Xbox Profile ===');
  try {
    const result = await client.osint.xbox('ethan');
    if (result.success && result.data) {
      console.log(`Gamertag: ${result.data.username}`);
      console.log(`Gamerscore: ${result.data.gamerscore}`);
    }
  } catch (error: any) {
    console.log(`Error: ${error.message}`);
  }

  // Roblox User Info
  console.log('\n=== Roblox User Info ===');
  try {
    const result = await client.osint.robloxUserinfo({ username: 'chris' });
    if (result.success && result.data) {
      console.log(`User ID: ${result.data.user_id}`);
      console.log(`Username: ${result.data.username}`);
      console.log(`Display Name: ${result.data.display_name}`);
    }
  } catch (error: any) {
    console.log(`Error: ${error.message}`);
  }

  // Holehe Email Check
  console.log('\n=== Holehe Email Check ===');
  try {
    const result = await client.osint.holehe('ethan_lewis_196@hotmail.co.uk');
    console.log(`Email: ethan_lewis_196@hotmail.co.uk`);
    if (result.success && result.data?.domains?.length) {
      console.log(`Found on ${result.data.domains.length} services:`);
      result.data.domains.slice(0, 10).forEach((domain: string) => {
        console.log(`  - ${domain}`);
      });
    } else {
      console.log('No registered services found');
    }
  } catch (error: any) {
    console.log(`Error: ${error.message}`);
  }

  // IP Info
  console.log('\n=== IP Info ===');
  try {
    const result = await client.osint.ipInfo('174.235.65.156');
    console.log(`IP: 174.235.65.156`);
    if (result.success && result.data) {
      console.log(`Country: ${result.data.country}`);
      console.log(`City: ${result.data.city}`);
      console.log(`Region: ${result.data.region}`);
      console.log(`ISP: ${result.data.isp}`);
      console.log(`ASN: ${result.data.asn}`);
    }
  } catch (error: any) {
    console.log(`Error: ${error.message}`);
  }

  // Subdomain Extraction
  console.log('\n=== Subdomain Extraction ===');
  try {
    const result = await client.osint.extractSubdomain('limabean.co.za');
    console.log(`Domain: limabean.co.za`);
    if (result.success && result.data) {
      console.log(`Subdomain count: ${result.data.count}`);
      if (result.data.subdomains?.length) {
        console.log('Subdomains found:');
        result.data.subdomains.slice(0, 10).forEach((sub: string) => {
          console.log(`  - ${sub}`);
        });
      }
    }
  } catch (error: any) {
    console.log(`Error: ${error.message}`);
  }
}

main().catch(console.error);
