#!/usr/bin/env ts-node
/**
 * Basic usage example for OathNet SDK.
 *
 * This example demonstrates:
 * - Client initialization
 * - Simple breach search
 * - Basic error handling
 *
 * Run: OATHNET_API_KEY="your-key" npx ts-node examples/basic-usage.ts
 */

import { OathNetClient, AuthenticationError, OathNetError } from '../src';

async function main() {
  // Get API key from environment
  const apiKey = process.env.OATHNET_API_KEY;
  if (!apiKey) {
    console.error('Error: Set OATHNET_API_KEY environment variable');
    process.exit(1);
  }

  // Initialize client
  const client = new OathNetClient(apiKey);

  try {
    // Simple breach search
    console.log("Searching for 'example.com' in breach database...");
    const result = await client.search.breach('example.com');

    if (result.success && result.data) {
      console.log(`Found ${result.data.results_found} results`);
      console.log(`Retrieved ${result.data.results.length} records`);

      // Print first few results
      for (let i = 0; i < Math.min(5, result.data.results.length); i++) {
        const record = result.data.results[i];
        console.log(`\n--- Result ${i + 1} ---`);
        if (record.email) console.log(`Email: ${record.email}`);
        if (record.dbname) console.log(`Database: ${record.dbname}`);
        if (record.password) console.log(`Password: ${'*'.repeat(8)}`);
      }
    }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.error(`Authentication failed: ${error.message}`);
    } else if (error instanceof OathNetError) {
      console.error(`API error: ${error.message}`);
    } else {
      throw error;
    }
  }
}

main();
