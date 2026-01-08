#!/usr/bin/env ts-node
/**
 * Pagination example - cursor-based pagination patterns.
 *
 * This example demonstrates:
 * - Cursor-based pagination (breach search)
 * - Cursor-based pagination (V2 APIs)
 * - Efficient iteration patterns
 * - Collecting all results
 *
 * Run: OATHNET_API_KEY="your-key" npx ts-node examples/pagination.ts
 */

import { OathNetClient } from '../src';

async function main() {
  const apiKey = process.env.OATHNET_API_KEY;
  if (!apiKey) {
    console.error('Error: Set OATHNET_API_KEY environment variable');
    process.exit(1);
  }

  const client = new OathNetClient(apiKey);

  // Cursor-based pagination (breach search)
  console.log('=== Cursor-Based Pagination (Breach) ===');
  let cursor: string | undefined;
  let totalFetched = 0;
  const maxPages = 3;
  let page = 0;

  while (page < maxPages) {
    const result = await client.search.breach('gmail.com', { cursor });

    if (!result.success || !result.data) break;

    const count = result.data.results.length;
    totalFetched += count;
    page++;

    console.log(
      `Page ${page}: ${count} results (Total: ${result.data.results_found})`
    );

    cursor = result.data.cursor;
    if (!cursor || count === 0) {
      console.log('Reached end of results');
      break;
    }
  }

  console.log(`Fetched ${totalFetched} records across ${page} pages\n`);

  // Cursor-based pagination (V2 Stealer)
  console.log('=== Cursor-Based Pagination (V2 Stealer) ===');
  cursor = undefined;
  const pageSize = 25;
  totalFetched = 0;
  let pages = 0;

  while (pages < maxPages) {
    const result = await client.stealer.search('gmail.com', {
      pageSize,
      cursor,
    });

    if (!result.success || !result.data) break;

    const count = result.data.items.length;
    totalFetched += count;
    pages++;

    console.log(
      `Page ${pages}: ${count} results (Total: ${result.data.meta?.total || 'N/A'})`
    );

    cursor = result.data.next_cursor;
    if (!cursor) {
      console.log('No more pages');
      break;
    }
  }

  console.log(`Fetched ${totalFetched} stealer records across ${pages} pages\n`);

  // Cursor-based pagination (V2 Victims)
  console.log('=== Cursor-Based Pagination (V2 Victims) ===');
  cursor = undefined;
  totalFetched = 0;
  pages = 0;

  while (pages < maxPages) {
    const result = await client.victims.search('gmail', {
      pageSize: 10,
      cursor,
    });

    if (!result.success || !result.data) break;

    const count = result.data.items.length;
    totalFetched += count;
    pages++;

    console.log(
      `Page ${pages}: ${count} victims (Total: ${result.data.meta?.total || 'N/A'})`
    );

    cursor = result.data.next_cursor;
    if (!cursor) {
      console.log('No more pages');
      break;
    }
  }

  console.log(`Fetched ${totalFetched} victim profiles across ${pages} pages\n`);

  // Collect all results helper pattern
  console.log('=== Collect All Results Pattern ===');

  async function collectStealerResults(
    client: OathNetClient,
    query: string,
    maxResults = 100
  ): Promise<any[]> {
    const results: any[] = [];
    let cursor: string | undefined;

    while (results.length < maxResults) {
      const remaining = maxResults - results.length;
      const pageSize = Math.min(25, remaining);

      const response = await client.stealer.search(query, {
        pageSize,
        cursor,
      });

      if (!response.success || !response.data) break;

      results.push(...response.data.items);
      cursor = response.data.next_cursor;

      if (!cursor || response.data.items.length === 0) {
        break;
      }
    }

    return results.slice(0, maxResults);
  }

  const allResults = await collectStealerResults(client, 'gmail.com', 50);
  console.log(`Collected ${allResults.length} total results`);

  // Show unique domains from collected results
  const domains = new Set<string>();
  for (const r of allResults) {
    if (r.domain && Array.isArray(r.domain)) {
      r.domain.forEach((d: string) => domains.add(d));
    }
  }
  console.log(`Unique domains: ${domains.size}`);

  // Generator-like async iteration pattern
  console.log('\n=== Async Generator Pattern ===');

  async function* iterStealerResults(
    client: OathNetClient,
    query: string,
    maxPages = 10
  ): AsyncGenerator<any> {
    let cursor: string | undefined;
    let pages = 0;

    while (pages < maxPages) {
      const response = await client.stealer.search(query, {
        pageSize: 25,
        cursor,
      });

      if (!response.success || !response.data) break;

      for (const result of response.data.items) {
        yield result;
      }

      cursor = response.data.next_cursor;
      pages++;

      if (!cursor) {
        break;
      }
    }
  }

  // Process results one at a time (memory efficient)
  let count = 0;
  for await (const result of iterStealerResults(client, 'gmail.com', 2)) {
    count++;
    if (count <= 3) {
      const url = result.url || 'N/A';
      console.log(`  Result ${count}: ${String(url).slice(0, 50)}...`);
    }
  }

  console.log(`Processed ${count} results using async generator`);
}

main().catch(console.error);
