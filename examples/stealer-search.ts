#!/usr/bin/env ts-node
/**
 * Stealer search example with V2 API.
 *
 * This example demonstrates:
 * - V2 stealer search with various filters
 * - Domain and subdomain filtering
 * - Log ID access for victim profile linking
 * - Subdomain extraction
 *
 * Run: OATHNET_API_KEY="your-key" npx ts-node examples/stealer-search.ts
 */

import { OathNetClient } from '../src';

async function main() {
  const apiKey = process.env.OATHNET_API_KEY;
  if (!apiKey) {
    console.error('Error: Set OATHNET_API_KEY environment variable');
    process.exit(1);
  }

  const client = new OathNetClient(apiKey);

  // Basic stealer search
  console.log('=== V2 Stealer Search ===');
  const result = await client.stealer.search('gmail.com', { pageSize: 10 });
  console.log(`Success: ${result.success}`);
  if (result.success && result.data) {
    console.log(`Total found: ${result.data.meta?.total || 0}`);
    console.log(`Results: ${result.data.items.length}`);

    // Show results with log IDs
    console.log('\n=== Results with Log IDs ===');
    const logIds: string[] = [];

    for (let i = 0; i < Math.min(5, result.data.items.length); i++) {
      const record = result.data.items[i];
      console.log(`\n--- Record ${i + 1} ---`);
      if (record.url) console.log(`  URL: ${record.url}`);
      if (record.username) console.log(`  Username: ${record.username}`);
      if (record.password) console.log(`  Password: ${'*'.repeat(8)}`);
      if (record.log_id) {
        console.log(`  Log ID: ${record.log_id}`);
        logIds.push(record.log_id);
      }
    }

    // Unique log IDs
    if (logIds.length > 0) {
      const uniqueLogIds = [...new Set(logIds)];
      console.log('\n=== Unique Log IDs (for victim profile access) ===');
      console.log(`Found ${uniqueLogIds.length} unique victim profiles:`);
      uniqueLogIds.slice(0, 10).forEach((lid) => console.log(`  - ${lid}`));
    }
  }

  // Domain-specific search
  console.log('\n=== Domain-Specific Search ===');
  const domainResult = await client.stealer.search('', {
    domains: ['google.com'],
    pageSize: 5,
    wildcard: true,
  });
  if (domainResult.success && domainResult.data) {
    console.log(`Google domain results: ${domainResult.data.meta?.total || 0}`);
  }

  // Search with has_log_id filter
  console.log('\n=== Search with Log ID Filter ===');
  const logIdResult = await client.stealer.search('gmail.com', {
    hasLogId: true,
    pageSize: 5,
  });
  if (logIdResult.success && logIdResult.data) {
    console.log(`Results with victim profiles: ${logIdResult.data.meta?.total || 0}`);
  }

  // Subdomain extraction
  console.log('\n=== Subdomain Extraction ===');
  const subdomainResult = await client.stealer.subdomain('google.com');
  console.log(`Success: ${subdomainResult.success}`);
  if (subdomainResult.success && subdomainResult.data?.subdomains) {
    console.log(`Found ${subdomainResult.data.subdomains.length} subdomains:`);
    subdomainResult.data.subdomains.slice(0, 10).forEach((sub: string) => {
      console.log(`  - ${sub}`);
    });
  }
}

main().catch(console.error);
