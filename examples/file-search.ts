#!/usr/bin/env ts-node
/**
 * File search example - async search within victim files.
 *
 * This example demonstrates:
 * - Creating file search jobs
 * - Different search modes (literal, regex, wildcard)
 * - Polling for job completion
 * - Processing search results
 *
 * Run: OATHNET_API_KEY="your-key" npx ts-node examples/file-search.ts
 */

import { OathNetClient } from '../src';

async function main() {
  const apiKey = process.env.OATHNET_API_KEY;
  if (!apiKey) {
    console.error('Error: Set OATHNET_API_KEY environment variable');
    process.exit(1);
  }

  const client = new OathNetClient(apiKey);

  // First, get log IDs from victims search (required for file search)
  console.log('=== Getting Log IDs from Victims Search ===');
  const victims = await client.victims.search('gmail', { pageSize: 5 });

  if (!victims.success || !victims.data?.items.length) {
    console.log('No victims found, cannot perform file search');
    return;
  }

  const logIds = victims.data.items
    .filter((v) => v.log_id)
    .map((v) => v.log_id as string)
    .slice(0, 3);

  if (logIds.length === 0) {
    console.log('No log IDs available for file search');
    return;
  }

  console.log(`Found ${logIds.length} log IDs for file search`);

  // Method 1: All-in-one search (create + wait)
  console.log('\n=== Simple File Search ===');
  try {
    const result = await client.fileSearch.search('password', {
      searchMode: 'literal',
      logIds,
      maxMatches: 10,
    }, 60000);

    console.log(`Status: ${result.data?.status}`);
    if (result.data?.matches) {
      console.log(`Found ${result.data.matches.length} matches:`);
      result.data.matches.slice(0, 5).forEach((match) => {
        console.log(`  - Log: ${match.log_id}`);
        console.log(`    File: ${match.file_name}`);
        if (match.match_text) {
          const preview = match.match_text.slice(0, 100);
          console.log(`    Match: ${preview}...`);
        }
      });
    }
  } catch (error: any) {
    console.log(`File search error: ${error.message}`);
  }

  // Method 2: Manual job creation and polling
  console.log('\n=== Manual Job Management ===');
  try {
    const job = await client.fileSearch.create('api[_-]?key', {
      searchMode: 'regex',
      logIds,
      maxMatches: 5,
      includeMatches: true,
      contextLines: 2,
    });

    if (!job.data?.job_id) {
      console.log('Failed to create job');
      return;
    }

    console.log(`Created job: ${job.data.job_id}`);
    console.log(`Initial status: ${job.data.status}`);

    console.log('\nPolling for completion...');
    const completed = await client.fileSearch.waitForCompletion(
      job.data.job_id,
      2000,
      60000
    );
    console.log(`Final status: ${completed.data?.status}`);

    if (completed.data?.matches) {
      console.log(`\nFound ${completed.data.matches.length} regex matches`);
    }
  } catch (error: any) {
    console.log(`Manual search error: ${error.message}`);
  }

  // Search with wildcard mode
  console.log('\n=== Wildcard Search ===');
  try {
    const wildcardResult = await client.fileSearch.search('*@gmail.com', {
      searchMode: 'wildcard',
      logIds,
      maxMatches: 10,
    }, 60000);
    console.log(`Status: ${wildcardResult.data?.status}`);
    if (wildcardResult.data?.matches) {
      console.log(`Found ${wildcardResult.data.matches.length} matches`);
    }
  } catch (error: any) {
    console.log(`Wildcard search error: ${error.message}`);
  }
}

main().catch(console.error);
