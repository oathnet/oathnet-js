#!/usr/bin/env ts-node
/**
 * Error handling example - exception patterns and best practices.
 *
 * This example demonstrates:
 * - Different error types
 * - Proper error handling patterns
 * - Retry logic for transient errors
 *
 * Run: OATHNET_API_KEY="your-key" npx ts-node examples/error-handling.ts
 */

import {
  OathNetClient,
  OathNetError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  QuotaExceededError,
} from '../src';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const apiKey = process.env.OATHNET_API_KEY;
  if (!apiKey) {
    console.error('Error: Set OATHNET_API_KEY environment variable');
    process.exit(1);
  }

  // Example 1: Basic error handling
  console.log('=== Basic Error Handling ===');
  const client = new OathNetClient(apiKey);

  try {
    const result = await client.search.breach('example.com');
    if (result.success && result.data) {
      console.log(`Search successful: ${result.data.results_found} results`);
    }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.log(`Authentication failed - check your API key: ${error.message}`);
    } else if (error instanceof ValidationError) {
      console.log(`Invalid input: ${error.message}`);
    } else if (error instanceof NotFoundError) {
      console.log(`Resource not found: ${error.message}`);
    } else if (error instanceof RateLimitError) {
      console.log(`Rate limited - slow down requests: ${error.message}`);
    } else if (error instanceof QuotaExceededError) {
      console.log(`Quota exceeded: ${error.message}`);
    } else if (error instanceof OathNetError) {
      console.log(`API error: ${error.message}`);
    } else {
      throw error;
    }
  }

  // Example 2: Invalid API key handling
  console.log('\n=== Invalid API Key ===');
  try {
    const badClient = new OathNetClient('invalid_api_key');
    await badClient.search.breach('test');
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.log(`Expected auth error: ${error.message}`);
    } else if (error instanceof ValidationError) {
      console.log(`Expected validation error: ${error.message}`);
    }
  }

  // Example 3: Validation errors
  console.log('\n=== Validation Errors ===');
  try {
    // Invalid Discord ID (too short)
    await client.osint.discordUserinfo('123');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log(`Validation error: ${error.message}`);
    } else if (error instanceof NotFoundError) {
      console.log(`Not found: ${error.message}`);
    }
  }

  // Example 4: No results handling
  console.log('\n=== No Results Handling ===');
  try {
    const result = await client.search.breach('xyznonexistent123456789abcdef');
    if (result.success && result.data && result.data.results_found === 0) {
      console.log('No results found (API returned success with empty results)');
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      const msg = error.message.toLowerCase();
      if (msg.includes('no results')) {
        console.log('No results found (API returned validation error)');
      } else {
        throw error;
      }
    }
  }

  // Example 5: Retry logic for transient errors
  console.log('\n=== Retry Logic ===');

  async function searchWithRetry(
    client: OathNetClient,
    query: string,
    maxRetries = 3,
    backoff = 1000
  ) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await client.search.breach(query);
      } catch (error) {
        if (error instanceof RateLimitError) {
          if (attempt < maxRetries - 1) {
            const waitTime = backoff * Math.pow(2, attempt);
            console.log(`Rate limited, waiting ${waitTime}ms...`);
            await sleep(waitTime);
          } else {
            throw error;
          }
        } else if (error instanceof OathNetError) {
          if (attempt < maxRetries - 1) {
            const waitTime = backoff * Math.pow(2, attempt);
            console.log(`Server error, retrying in ${waitTime}ms...`);
            await sleep(waitTime);
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    }
    return null;
  }

  const retryResult = await searchWithRetry(client, 'gmail.com');
  if (retryResult?.success && retryResult.data) {
    console.log(`Search succeeded: ${retryResult.data.results_found} results`);
  }

  // Example 6: Error code handling
  console.log('\n=== Error Type Detection ===');
  try {
    await client.osint.discordUserinfo('invalid');
  } catch (error) {
    console.log(`Error type: ${error?.constructor?.name}`);
    if (error instanceof Error) {
      console.log(`Error message: ${error.message}`);
    }
  }

  console.log('\nError handling examples complete!');
}

main().catch(console.error);
