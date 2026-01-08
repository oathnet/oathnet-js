#!/usr/bin/env ts-node
/**
 * Export example - async export to JSONL or CSV.
 *
 * This example demonstrates:
 * - Creating export jobs
 * - Export formats (JSONL, CSV)
 * - Export types (docs, victims)
 * - Waiting for completion and downloading
 *
 * Run: OATHNET_API_KEY="your-key" npx ts-node examples/exports.ts
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { OathNetClient } from '../src';

async function main() {
  const apiKey = process.env.OATHNET_API_KEY;
  if (!apiKey) {
    console.error('Error: Set OATHNET_API_KEY environment variable');
    process.exit(1);
  }

  const client = new OathNetClient(apiKey);

  // Method 1: Manual job management
  console.log('=== Create and Download Export ===');

  const job = await client.exports.create('docs', {
    format: 'jsonl',
    limit: 100,
    search: { query: 'gmail.com' },
  });

  if (!job.data?.job_id) {
    console.log('Failed to create export job');
    return;
  }

  console.log(`Created job: ${job.data.job_id}`);
  console.log(`Initial status: ${job.data.status}`);

  // Wait for completion
  console.log('Waiting for completion...');
  const result = await client.exports.waitForCompletion(
    job.data.job_id,
    2000,
    120000
  );
  console.log(`Final status: ${result.data?.status}`);

  if (result.data?.status === 'completed') {
    // Download as bytes
    const data = await client.exports.download(job.data.job_id);
    if (data instanceof Buffer) {
      console.log(`Downloaded ${data.length} bytes`);

      // Preview first few lines
      const preview = data.slice(0, 500).toString('utf-8');
      console.log(`Preview:\n${preview}...`);

      // Download to file
      const tempPath = path.join(os.tmpdir(), `oathnet-export-${Date.now()}.jsonl`);
      try {
        await client.exports.download(job.data.job_id, tempPath);
        const size = fs.statSync(tempPath).size;
        console.log(`\nSaved to: ${tempPath} (${size} bytes)`);
      } finally {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    }
  }

  // CSV Export
  console.log('\n=== CSV Export with Fields ===');

  const csvJob = await client.exports.create('docs', {
    format: 'csv',
    limit: 100,
    fields: ['email', 'password', 'domain', 'url'],
    search: { query: 'gmail.com' },
  });

  if (!csvJob.data?.job_id) {
    console.log('Failed to create CSV export job');
    return;
  }

  console.log(`Created CSV job: ${csvJob.data.job_id}`);

  const csvResult = await client.exports.waitForCompletion(
    csvJob.data.job_id,
    2000,
    120000
  );
  console.log(`Status: ${csvResult.data?.status}`);

  if (csvResult.data?.status === 'completed') {
    const csvData = await client.exports.download(csvJob.data.job_id);
    if (csvData instanceof Buffer) {
      const csvPreview = csvData.slice(0, 500).toString('utf-8');
      console.log(`CSV Preview:\n${csvPreview}`);
    }
  }

  // Victims Export
  console.log('\n=== Export Victims Data ===');

  const victimsJob = await client.exports.create('victims', {
    format: 'jsonl',
    limit: 100,
    search: { query: 'gmail' },
  });

  if (!victimsJob.data?.job_id) {
    console.log('Failed to create victims export job');
    return;
  }

  console.log(`Created victims export job: ${victimsJob.data.job_id}`);

  const victimsResult = await client.exports.waitForCompletion(
    victimsJob.data.job_id,
    2000,
    120000
  );
  console.log(`Status: ${victimsResult.data?.status}`);

  if (victimsResult.data?.status === 'completed') {
    const victimsData = await client.exports.download(victimsJob.data.job_id);
    if (victimsData instanceof Buffer) {
      console.log(`Downloaded ${victimsData.length} bytes of victim data`);
    }
  }

  // Domain filter export
  console.log('\n=== Export with Domain Filter ===');

  const domainJob = await client.exports.create('docs', {
    format: 'jsonl',
    limit: 100,
    search: { domains: ['github.com'] },
  });

  if (!domainJob.data?.job_id) {
    console.log('Failed to create domain-filtered export job');
    return;
  }

  console.log(`Created domain-filtered export: ${domainJob.data.job_id}`);

  const domainResult = await client.exports.waitForCompletion(
    domainJob.data.job_id,
    2000,
    120000
  );
  console.log(`Status: ${domainResult.data?.status}`);
}

main().catch(console.error);
