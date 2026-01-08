# OathNet Node.js SDK

Official Node.js SDK and CLI for the OathNet API.

## Installation

```bash
npm install oathnet
```

Or install from source:

```bash
git clone https://github.com/oathnet/oathnet-js
cd oathnet-js
npm install
npm run build
```

## Quick Start

### SDK Usage

```typescript
import { OathNetClient } from 'oathnet';

const client = new OathNetClient('your-api-key');

// Search breach database
const breachResults = await client.search.breach('winterfox');
console.log(`Found ${breachResults.data.results_found} results`);

// Get IP info
const ipInfo = await client.osint.ipInfo('174.235.65.156');
console.log(`Location: ${ipInfo.data.city}, ${ipInfo.data.country}`);

// Discord lookup
const discordUser = await client.osint.discordUserinfo('300760994454437890');
console.log(`Username: ${discordUser.data.username}`);
```

### CLI Usage

```bash
# Set API key
export OATHNET_API_KEY=your-api-key

# Search breach database
oathnet search breach -q "winterfox"

# Get IP info
oathnet osint ip 174.235.65.156

# Discord lookup
oathnet osint discord user 300760994454437890

# Output as JSON
oathnet --format json search breach -q "winterfox"
```

## Features

### Search Services
- **Breach Search**: Search leaked credentials across 50B+ records
- **Stealer Search**: Search stealer log databases
- **Search Sessions**: Optimize quota with grouped lookups

### V2 Services
- **V2 Stealer**: Enhanced stealer search with filtering
- **V2 Victims**: Search victim profiles with device info
- **V2 File Search**: Regex search within victim files
- **V2 Exports**: Export results to CSV/JSONL

### OSINT Lookups
- Discord (user info, username history, linked Roblox)
- Steam profiles
- Xbox Live profiles
- Roblox user info
- IP geolocation
- Email existence (Holehe)
- Google accounts (GHunt)
- Subdomain extraction
- Minecraft username history

## SDK Reference

### Client

```typescript
import { OathNetClient } from 'oathnet';

const client = new OathNetClient(apiKey, {
  baseUrl: 'https://oathnet.org/api',  // Optional
  timeout: 30000,  // Optional (ms)
});
```

### Services

#### Search

```typescript
// Initialize search session
const session = await client.search.initSession('query');

// Search breach database
const results = await client.search.breach('query', {
  page: 1,
  limit: 25,
  dbname: 'linkedin',  // Optional database filter
});

// Search stealer database
const stealerResults = await client.search.stealer('query');
```

#### OSINT

```typescript
// IP lookup
const ipInfo = await client.osint.ipInfo('8.8.8.8');

// Steam profile
const steam = await client.osint.steam('steam_id');

// Xbox profile
const xbox = await client.osint.xbox('gamertag');

// Discord user
const discord = await client.osint.discordUserinfo('discord_id');

// Discord username history
const history = await client.osint.discordUsernameHistory('discord_id');

// Discord to Roblox
const roblox = await client.osint.discordToRoblox('discord_id');

// Roblox user
const robloxUser = await client.osint.robloxUserinfo({ username: 'username' });

// Holehe email check
const holehe = await client.osint.holehe('email@example.com');

// Subdomain extraction
const subdomains = await client.osint.extractSubdomain('example.com');
```

#### V2 Stealer

```typescript
// Enhanced search with filters
const results = await client.stealer.search({
  q: 'query',
  domain: 'facebook.com',
  hasLogId: true,
  wildcard: true,
  pageSize: 25,
  cursor: 'next_page_cursor',
});

// Extract subdomains from stealer data
const subs = await client.stealer.subdomain('example.com');
```

#### V2 Victims

```typescript
// Search victim profiles
const victims = await client.victims.search({
  q: 'query',
  email: 'user@gmail.com',
  pageSize: 25,
});

// Get file manifest
const manifest = await client.victims.getManifest('log_id');

// Download file
const content = await client.victims.getFile('log_id', 'file_id');

// Download archive
await client.victims.downloadArchive('log_id', 'output.zip');
```

#### File Search (Async)

```typescript
// Create search job
const job = await client.fileSearch.create('password', {
  searchMode: 'regex',  // 'literal', 'regex', 'wildcard'
  maxMatches: 100,
  includeMatches: true,
  contextLines: 2,
});

// Wait for results
const result = await client.fileSearch.waitForCompletion(job.data.job_id);

// Or use convenience method
const result = await client.fileSearch.search('api_key', {
  searchMode: 'literal',
  maxMatches: 50,
}, 60000);  // timeout
```

#### Exports (Async)

```typescript
// Create export
const job = await client.exports.create({
  exportType: 'docs',  // 'docs' or 'victims'
  format: 'csv',       // 'csv' or 'jsonl'
  limit: 1000,
  fields: ['email', 'password', 'domain'],
  search: { query: 'example.com' },
});

// Wait and download
const result = await client.exports.waitForCompletion(job.data.job_id);
const data = await client.exports.download(job.data.job_id);

// Or download to file
await client.exports.downloadToFile(job.data.job_id, 'export.csv');
```

### Error Handling

```typescript
import {
  OathNetClient,
  OathNetError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  QuotaExceededError,
} from 'oathnet';

try {
  const results = await client.search.breach('query');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof QuotaExceededError) {
    console.log('Quota exceeded');
  } else if (error instanceof RateLimitError) {
    console.log('Rate limited - slow down');
  } else if (error instanceof ValidationError) {
    console.log(`Invalid parameters: ${error.message}`);
  } else if (error instanceof NotFoundError) {
    console.log('Resource not found');
  } else if (error instanceof OathNetError) {
    console.log(`API error: ${error.message}`);
  }
}
```

## CLI Reference

```bash
# Global options
oathnet --api-key KEY --format json|table|raw COMMAND

# Search commands
oathnet search breach -q "query" [--page N] [--limit N] [--dbnames name]
oathnet search stealer -q "query"
oathnet search init -q "query"

# Stealer V2
oathnet stealer search -q "query" [--domain] [--wildcard] [--has-log-id]
oathnet stealer subdomain -d "domain.com"

# Victims V2
oathnet victims search -q "query" [--email] [--ip]
oathnet victims manifest LOG_ID
oathnet victims file LOG_ID FILE_ID
oathnet victims archive LOG_ID

# File Search
oathnet file-search create -e "expression" [--mode literal|regex|wildcard]
oathnet file-search status JOB_ID
oathnet file-search search -e "expression" [--timeout 60000]

# Exports
oathnet export create --type docs --format csv [--limit 1000]
oathnet export status JOB_ID
oathnet export download JOB_ID -o output.csv

# OSINT
oathnet osint ip IP_ADDRESS
oathnet osint steam STEAM_ID
oathnet osint xbox GAMERTAG
oathnet osint discord user DISCORD_ID
oathnet osint discord history DISCORD_ID
oathnet osint discord roblox DISCORD_ID
oathnet osint roblox [--user-id ID | --username NAME]
oathnet osint holehe EMAIL
oathnet osint ghunt EMAIL
oathnet osint subdomain DOMAIN
oathnet osint minecraft USERNAME

# Utility
oathnet util dbnames -q "linked"
```

## Configuration

API key can be set via:

1. CLI flag: `--api-key KEY`
2. Environment variable: `OATHNET_API_KEY`

## Examples

The `examples/` directory contains comprehensive examples:

| Example | Description |
|---------|-------------|
| `basic-usage.ts` | Client initialization and simple search |
| `breach-search.ts` | Breach search with filters and pagination |
| `stealer-search.ts` | V2 stealer search with log ID access |
| `victims-search.ts` | Victim profiles, manifests, and file access |
| `file-search.ts` | Async file search within victim logs |
| `osint-lookups.ts` | All OSINT methods demonstrated |
| `exports.ts` | Async export to CSV/JSONL |
| `error-handling.ts` | Exception patterns and retry logic |
| `pagination.ts` | Cursor-based pagination patterns |

Run an example:

```bash
export OATHNET_API_KEY="your-api-key"
npx ts-node examples/basic-usage.ts

# Or use npm scripts
npm run example:basic
npm run example:breach
npm run example:stealer
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests (requires API key)
export OATHNET_API_KEY="your-api-key"
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run CLI in development
npm run cli -- search breach -q "test"
```

### Test Structure

```
tests/
  setup.ts              # Test setup and configuration
  helpers.ts            # Test utilities and constants
  client.test.ts        # Client initialization tests
  services/
    search.test.ts      # Search service tests
    osint.test.ts       # OSINT service tests
    stealer.test.ts     # V2 stealer tests
    victims.test.ts     # V2 victims tests
    fileSearch.test.ts  # File search tests
    exports.test.ts     # Export tests
    utility.test.ts     # Utility tests
```

## License

MIT License - See LICENSE file for details.

## Support

- Documentation: https://docs.oathnet.org
- Discord: https://discord.gg/DCjnk9TAMK
- Email: info@oathnet.org
