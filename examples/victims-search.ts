#!/usr/bin/env ts-node
/**
 * Victims search example with manifest and file access.
 *
 * This example demonstrates:
 * - Victim profile search
 * - Fetching victim manifest (file tree)
 * - Accessing individual files
 *
 * Run: OATHNET_API_KEY="your-key" npx ts-node examples/victims-search.ts
 */

import { OathNetClient } from '../src';

async function main() {
  const apiKey = process.env.OATHNET_API_KEY;
  if (!apiKey) {
    console.error('Error: Set OATHNET_API_KEY environment variable');
    process.exit(1);
  }

  const client = new OathNetClient(apiKey);

  // Search for victim profiles
  console.log('=== Victims Search ===');
  const result = await client.victims.search('gmail', { pageSize: 5 });
  console.log(`Success: ${result.success}`);

  if (!result.success || !result.data) {
    console.log('Search failed');
    return;
  }

  console.log(`Total found: ${result.data.meta?.total || 0}`);

  if (!result.data.items.length) {
    console.log('No results found');
    return;
  }

  // Display victim profiles
  console.log('\n=== Victim Profiles ===');
  for (let i = 0; i < Math.min(3, result.data.items.length); i++) {
    const victim = result.data.items[i];
    console.log(`\n--- Profile ${i + 1} ---`);
    if (victim.log_id) console.log(`  Log ID: ${victim.log_id}`);
    if (victim.device_users?.length) console.log(`  Computer: ${victim.device_users[0]}`);
    if (victim.device_ips?.length) console.log(`  IP: ${victim.device_ips[0]}`);
    if (victim.total_docs) console.log(`  Total Docs: ${victim.total_docs}`);
    if (victim.pwned_at) console.log(`  Date: ${victim.pwned_at}`);
  }

  // Get manifest for first victim with log_id
  let logId: string | null = null;
  for (const victim of result.data.items) {
    if (victim.log_id) {
      logId = victim.log_id;
      break;
    }
  }

  if (!logId) {
    console.log('\nNo log IDs available for manifest demo');
    return;
  }

  console.log(`\n=== Manifest for ${logId} ===`);
  try {
    const manifest = await client.victims.getManifest(logId);
    if (manifest?.victim_tree) {
      // Count files in tree
      const countFiles = (node: any): number => {
        let count = node.type === 'file' ? 1 : 0;
        if (node.children) {
          for (const child of node.children) {
            count += countFiles(child);
          }
        }
        return count;
      };

      const fileCount = countFiles(manifest.victim_tree);
      console.log(`Found ${fileCount} files in victim tree`);

      // List some files
      const listFiles = (node: any, files: string[], maxFiles: number): void => {
        if (files.length >= maxFiles) return;
        if (node.type === 'file') {
          files.push(node.name);
        }
        if (node.children) {
          for (const child of node.children) {
            listFiles(child, files, maxFiles);
          }
        }
      };

      const files: string[] = [];
      listFiles(manifest.victim_tree, files, 10);
      console.log('Sample files:');
      files.forEach(f => console.log(`  - ${f}`));
    }
  } catch (error: any) {
    console.log(`Could not fetch manifest: ${error.message}`);
  }
}

main().catch(console.error);
