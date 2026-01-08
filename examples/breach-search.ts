#!/usr/bin/env ts-node
/**
 * Breach search example with advanced filters and pagination.
 *
 * This example demonstrates:
 * - Breach search with filters
 * - Database filtering by name
 * - Cursor-based pagination
 *
 * Run: OATHNET_API_KEY="your-key" npx ts-node examples/breach-search.ts
 */

import { OathNetClient } from '../src';

async function main() {
  const apiKey = process.env.OATHNET_API_KEY;
  if (!apiKey) {
    console.error('Error: Set OATHNET_API_KEY environment variable');
    process.exit(1);
  }

  const client = new OathNetClient(apiKey);

  // Basic breach search
  console.log('=== Basic Breach Search ===');
  const result = await client.search.breach('winterfox');
  if (result.success && result.data) {
    console.log(`Total found: ${result.data.results_found}`);
    console.log(`Results: ${result.data.results.length}`);
  }

  // Search with database filter
  console.log('\n=== Search with Database Filter ===');
  const linkedinResult = await client.search.breach('ahmed', {
    dbnames: 'free.fr',
  });
  if (linkedinResult.success && linkedinResult.data) {
    console.log(`Filtered results: ${linkedinResult.data.results_found}`);
  }

  // Dynamic field display
  console.log('\n=== Dynamic Field Display ===');
  const dynamicResult = await client.search.breach('winterfox');

  if (dynamicResult.success && dynamicResult.data) {
    for (let i = 0; i < Math.min(3, dynamicResult.data.results.length); i++) {
      const record = dynamicResult.data.results[i] as Record<string, any>;
      console.log(`\n--- Record ${i + 1} ---`);
      for (const [key, value] of Object.entries(record)) {
        if (value && key !== '_id') {
          console.log(`  ${key}: ${value}`);
        }
      }
    }
  }

  // Cursor pagination example
  console.log('\n=== Cursor Pagination Example ===');
  let cursor: string | undefined;
  let totalFetched = 0;
  let pageCount = 0;
  const maxPages = 3;

  while (pageCount < maxPages) {
    const pageResult = await client.search.breach('gmail.com', { cursor });

    if (!pageResult.success || !pageResult.data) break;

    const count = pageResult.data.results.length;
    totalFetched += count;
    pageCount++;
    console.log(`Page ${pageCount}: ${count} results`);

    // Check for next cursor
    cursor = pageResult.data.cursor;
    if (!cursor || count === 0) break;
  }

  console.log(`Total fetched across ${pageCount} pages: ${totalFetched}`);
}

main().catch(console.error);
