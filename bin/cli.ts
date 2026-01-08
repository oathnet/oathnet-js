#!/usr/bin/env node
/**
 * OathNet CLI - Command-line interface for OathNet API
 */

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { OathNetClient } from '../src';

const program = new Command();

// Global options
let apiKey: string | undefined;
let outputFormat: 'table' | 'json' = 'table';

function getClient(): OathNetClient {
  const key = apiKey || process.env.OATHNET_API_KEY;
  if (!key) {
    console.error(chalk.red('Error: API key is required'));
    console.error('Use --api-key or set OATHNET_API_KEY environment variable');
    process.exit(1);
  }
  return new OathNetClient(key);
}

function output(data: any, formatter?: (data: any) => void): void {
  if (outputFormat === 'json') {
    console.log(JSON.stringify(data, null, 2));
  } else if (formatter) {
    formatter(data);
  } else {
    console.log(data);
  }
}

function handleError(error: any): void {
  console.error(chalk.red(`Error: ${error.message || error}`));
  process.exit(1);
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return chalk.dim('N/A');
  if (Array.isArray(value)) {
    if (!value.length) return chalk.dim('N/A');
    const display = value.slice(0, 5).map(String).join(', ');
    return value.length > 5 ? `${display} (+${value.length - 5} more)` : display;
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

// Main program
program
  .name('oathnet')
  .description('OathNet CLI - Search breach databases, stealer logs, and OSINT lookups')
  .version('1.0.0')
  .option('-k, --api-key <key>', 'OathNet API key')
  .option('-f, --format <format>', 'Output format (table|json)', 'table')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    apiKey = opts.apiKey;
    outputFormat = opts.format as 'table' | 'json';
  });

// ============================================
// SEARCH COMMANDS
// ============================================

const search = program.command('search').description('Search breach and stealer databases');

search
  .command('breach')
  .description('Search breach database')
  .requiredOption('-q, --query <query>', 'Search query')
  .option('--cursor <cursor>', 'Pagination cursor')
  .option('--dbnames <dbnames>', 'Filter by database names')
  .option('-o, --output <file>', 'Save results to file')
  .action(async (opts) => {
    try {
      const client = getClient();
      const result = await client.search.breach(opts.query, {
        cursor: opts.cursor,
        dbnames: opts.dbnames,
      });

      if (opts.output) {
        const fs = await import('fs');
        fs.writeFileSync(opts.output, JSON.stringify(result, null, 2));
        console.log(chalk.green(`Saved to ${opts.output}`));
      }

      output(result, (r) => {
        if (r.data?.results) {
          console.log(chalk.bold(`\nFound ${r.data.results_found} results (showing ${r.data.results_shown})\n`));

          // Priority fields to show first
          const priorityFields = ['id', 'dbname', 'email', 'username', 'password', 'password_hash',
                                  'phone_number', 'ip', 'domain', 'country', 'city', 'full_name',
                                  'first_name', 'last_name', 'date'];

          r.data.results.forEach((res: any, i: number) => {
            console.log(chalk.cyan(`━━━ Result ${i + 1} ━━━`));

            // Convert to plain object and filter
            const data: Record<string, any> = { ...res };
            const shown = new Set<string>();

            // Show priority fields first
            for (const field of priorityFields) {
              if (field in data && data[field] !== null && data[field] !== '' &&
                  !(Array.isArray(data[field]) && !data[field].length)) {
                console.log(`  ${chalk.bold(field + ':')} ${formatValue(data[field])}`);
                shown.add(field);
              }
            }

            // Show remaining fields alphabetically
            const remaining = Object.keys(data)
              .filter(k => !shown.has(k) && !k.startsWith('_'))
              .sort();
            for (const key of remaining) {
              const val = data[key];
              if (val !== null && val !== undefined && val !== '' &&
                  !(Array.isArray(val) && !val.length)) {
                console.log(`  ${key}: ${formatValue(val)}`);
              }
            }
            console.log();
          });

          if (r.data.cursor) {
            console.log(chalk.yellow(`\nNext cursor: ${r.data.cursor}`));
            console.log(chalk.dim('Use --cursor to fetch next page'));
          }
        } else {
          console.log(chalk.yellow('No results found'));
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

search
  .command('stealer')
  .description('Search stealer database (legacy)')
  .requiredOption('-q, --query <query>', 'Search query')
  .option('--cursor <cursor>', 'Pagination cursor')
  .option('-o, --output <file>', 'Save results to file')
  .action(async (opts) => {
    try {
      const client = getClient();
      const result = await client.search.stealer(opts.query, { cursor: opts.cursor });

      if (opts.output) {
        const fs = await import('fs');
        fs.writeFileSync(opts.output, JSON.stringify(result, null, 2));
        console.log(chalk.green(`Saved to ${opts.output}`));
      }

      output(result, (r) => {
        if (r.data?.results) {
          console.log(chalk.bold(`\nFound ${r.data.results_found} results (showing ${r.data.results_shown})\n`));
          r.data.results.forEach((res: any, i: number) => {
            console.log(chalk.cyan(`Result ${i + 1}:`));
            console.log(`  LOG: ${res.LOG || 'N/A'}`);
            if (res.domain) console.log(`  Domain: ${res.domain.join(', ')}`);
            if (res.email) console.log(`  Email: ${res.email.join(', ')}`);
            console.log();
          });
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

search
  .command('init')
  .description('Initialize a search session')
  .requiredOption('-q, --query <query>', 'Search query')
  .action(async (opts) => {
    try {
      const client = getClient();
      const result = await client.search.initSession(opts.query);

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.bold.green('\nSession initialized\n'));
          console.log(`Session ID: ${chalk.cyan(r.data.session.id)}`);
          console.log(`Query: ${r.data.session.query}`);
          console.log(`Search Type: ${r.data.session.search_type}`);
          console.log(`Expires: ${r.data.session.expires_at}`);
          if (r.data.user) {
            console.log(`Plan: ${r.data.user.plan}`);
          }
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

// ============================================
// STEALER V2 COMMANDS
// ============================================

const stealer = program.command('stealer').description('V2 Stealer search commands');

stealer
  .command('search')
  .description('Search V2 stealer database')
  .option('-q, --query <query>', 'Search query')
  .option('--domain <domain>', 'Filter by domain')
  .option('--wildcard', 'Enable wildcard search')
  .option('--has-log-id', 'Only results with log ID')
  .option('--page-size <size>', 'Results per page', '25')
  .option('--file-search <pattern>', 'Auto file-search pattern in results')
  .option('--file-search-mode <mode>', 'Search mode (literal|regex|wildcard)', 'literal')
  .option('-o, --output <file>', 'Save results to file')
  .action(async (opts) => {
    try {
      const client = getClient();
      const result = await client.stealer.search(opts.query, {
        domains: opts.domain ? [opts.domain] : undefined,
        wildcard: opts.wildcard,
        hasLogId: opts.hasLogId,
        pageSize: parseInt(opts.pageSize),
      });

      if (opts.output) {
        const fs = await import('fs');
        fs.writeFileSync(opts.output, JSON.stringify(result, null, 2));
        console.log(chalk.green(`Saved to ${opts.output}`));
      }

      output(result, (r) => {
        if (r.data?.items) {
          const total = r.data.meta?.total || r.data.items.length;
          console.log(chalk.bold(`\nFound ${total} results (showing ${r.data.items.length})\n`));

          const logIds: string[] = [];
          const priorityFields = ['id', 'log_id', 'url', 'username', 'password', 'email', 'domain',
                                  'subdomain', 'path', 'log', 'pwned_at', 'indexed_at'];

          r.data.items.forEach((res: any, i: number) => {
            console.log(chalk.cyan(`━━━ Result ${i + 1} ━━━`));

            const data: Record<string, any> = { ...res };
            const shown = new Set<string>();

            // Collect log_id
            if (data.log_id) logIds.push(data.log_id);

            // Show priority fields first
            for (const field of priorityFields) {
              if (field in data && data[field] !== null && data[field] !== '' &&
                  !(Array.isArray(data[field]) && !data[field].length)) {
                if (field === 'log_id') {
                  console.log(`  ${chalk.yellow.bold('log_id:')} ${chalk.green(data[field])}`);
                } else if (field === 'id') {
                  console.log(`  ${chalk.bold('id:')} ${chalk.green(data[field])}`);
                } else {
                  console.log(`  ${chalk.bold(field + ':')} ${formatValue(data[field])}`);
                }
                shown.add(field);
              }
            }

            // Show remaining fields
            const remaining = Object.keys(data).filter(k => !shown.has(k) && !k.startsWith('_')).sort();
            for (const key of remaining) {
              const val = data[key];
              if (val !== null && val !== undefined && val !== '' &&
                  !(Array.isArray(val) && !val.length)) {
                console.log(`  ${key}: ${formatValue(val)}`);
              }
            }
            console.log();
          });

          // Show all collected log_ids
          if (logIds.length) {
            console.log(chalk.yellow.bold('\n═══ LOG IDs (use with file-search/victims) ═══'));
            logIds.forEach(lid => console.log(`  ${chalk.green(lid)}`));
            console.log();
          }

          if (r.data.next_cursor) {
            console.log(chalk.yellow(`Next cursor: ${r.data.next_cursor}`));
          }

          // Auto file-search if requested
          if (opts.fileSearch && logIds.length) {
            console.log(chalk.magenta.bold(`\n═══ Auto File Search: '${opts.fileSearch}' ═══`));
            client.fileSearch.search(opts.fileSearch, {
              searchMode: opts.fileSearchMode,
              logIds: logIds.slice(0, 10),
              maxMatches: 50,
            }).then(fsResult => {
              if (fsResult.data?.matches?.length) {
                console.log(chalk.green(`Found ${fsResult.data.matches.length} matches!\n`));
                fsResult.data.matches.slice(0, 20).forEach((m: any) => {
                  console.log(`  ${chalk.cyan(m.file_name)} (log: ${m.log_id})`);
                  if (m.match_text) {
                    console.log(`    → ${m.match_text.slice(0, 100)}`);
                  }
                });
              } else {
                console.log(chalk.yellow('No file matches found'));
              }
            }).catch(e => console.log(chalk.red(`File search error: ${e.message}`)));
          }
        } else {
          console.log(chalk.yellow('No results found'));
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

stealer
  .command('subdomain')
  .description('Extract subdomains from stealer data')
  .requiredOption('-d, --domain <domain>', 'Domain to search')
  .action(async (opts) => {
    try {
      const client = getClient();
      const result = await client.stealer.subdomain(opts.domain);

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.bold(`\nFound ${r.data.count} subdomains for ${r.data.domain}\n`));
          r.data.subdomains.forEach((s: string) => console.log(`  ${s}`));
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

// ============================================
// VICTIMS V2 COMMANDS
// ============================================

const victims = program.command('victims').description('V2 Victims commands');

victims
  .command('search')
  .description('Search victim profiles')
  .option('-q, --query <query>', 'Search query')
  .option('--email <email>', 'Filter by email')
  .option('--ip <ip>', 'Filter by IP')
  .option('--discord-id <id>', 'Filter by Discord ID')
  .option('--wildcard', 'Enable wildcard matching')
  .option('--page-size <size>', 'Results per page', '25')
  .option('--file-search <pattern>', 'Auto file-search pattern in results')
  .option('--file-search-mode <mode>', 'Search mode (literal|regex|wildcard)', 'literal')
  .option('-o, --output <file>', 'Save results to file')
  .action(async (opts) => {
    try {
      const client = getClient();
      const result = await client.victims.search(opts.query, {
        emails: opts.email ? [opts.email] : undefined,
        ips: opts.ip ? [opts.ip] : undefined,
        discordIds: opts.discordId ? [opts.discordId] : undefined,
        wildcard: opts.wildcard,
        pageSize: parseInt(opts.pageSize),
      });

      if (opts.output) {
        const fs = await import('fs');
        fs.writeFileSync(opts.output, JSON.stringify(result, null, 2));
        console.log(chalk.green(`Saved to ${opts.output}`));
      }

      output(result, (r) => {
        if (r.data?.items?.length) {
          const total = r.data.meta?.total || r.data.items.length;
          console.log(chalk.bold(`\nFound ${total} victims (showing ${r.data.items.length})\n`));

          const logIds: string[] = [];
          const priorityFields = ['log_id', 'device_users', 'device_emails', 'device_ips',
                                  'discord_ids', 'hwids', 'total_docs', 'pwned_at', 'indexed_at'];

          r.data.items.forEach((v: any, i: number) => {
            console.log(chalk.cyan(`━━━ Victim ${i + 1} ━━━`));

            const data: Record<string, any> = { ...v };
            const shown = new Set<string>();

            // Collect log_id
            if (data.log_id) logIds.push(data.log_id);

            // Show priority fields first
            for (const field of priorityFields) {
              if (field in data && data[field] !== null && data[field] !== '' &&
                  !(Array.isArray(data[field]) && !data[field].length)) {
                if (field === 'log_id') {
                  console.log(`  ${chalk.yellow.bold('log_id:')} ${chalk.green(data[field])}`);
                } else {
                  console.log(`  ${chalk.bold(field + ':')} ${formatValue(data[field])}`);
                }
                shown.add(field);
              }
            }

            // Show remaining fields
            const remaining = Object.keys(data).filter(k => !shown.has(k) && !k.startsWith('_')).sort();
            for (const key of remaining) {
              const val = data[key];
              if (val !== null && val !== undefined && val !== '' &&
                  !(Array.isArray(val) && !val.length)) {
                console.log(`  ${key}: ${formatValue(val)}`);
              }
            }
            console.log();
          });

          // Show all collected log_ids
          if (logIds.length) {
            console.log(chalk.yellow.bold('\n═══ LOG IDs (use with file-search/manifest/archive) ═══'));
            logIds.forEach(lid => console.log(`  ${chalk.green(lid)}`));
            console.log();
            console.log(chalk.dim('Usage: oathnet victims manifest <log_id>'));
            console.log(chalk.dim('       oathnet file-search search -e "password" --log-id <log_id>'));
          }

          if (r.data.next_cursor) {
            console.log(chalk.yellow(`\nNext cursor: ${r.data.next_cursor}`));
          }

          // Auto file-search if requested
          if (opts.fileSearch && logIds.length) {
            console.log(chalk.magenta.bold(`\n═══ Auto File Search: '${opts.fileSearch}' ═══`));
            client.fileSearch.search(opts.fileSearch, {
              searchMode: opts.fileSearchMode,
              logIds: logIds.slice(0, 10),
              maxMatches: 50,
            }).then(fsResult => {
              if (fsResult.data?.matches?.length) {
                console.log(chalk.green(`Found ${fsResult.data.matches.length} matches!\n`));
                fsResult.data.matches.slice(0, 20).forEach((m: any) => {
                  console.log(`  ${chalk.cyan(m.file_name)} (log: ${m.log_id})`);
                  if (m.match_text) {
                    console.log(`    → ${m.match_text.slice(0, 100)}`);
                  }
                });
              } else {
                console.log(chalk.yellow('No file matches found'));
              }
            }).catch(e => console.log(chalk.red(`File search error: ${e.message}`)));
          }
        } else {
          console.log(chalk.yellow('No victims found'));
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

victims
  .command('manifest')
  .description('Get victim file manifest')
  .argument('<log_id>', 'Victim log ID')
  .action(async (logId) => {
    try {
      const client = getClient();
      const result = await client.victims.getManifest(logId);

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.bold(`\nManifest for ${r.data.log_id}\n`));
          console.log(`Total files: ${r.data.total_files}`);
          console.log(`Total size: ${r.data.total_size} bytes\n`);
          r.data.files.slice(0, 20).forEach((f: any) => {
            console.log(`  ${f.relative_path} (${f.size} bytes)`);
          });
          if (r.data.files.length > 20) {
            console.log(chalk.dim(`  ... and ${r.data.files.length - 20} more files`));
          }
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

victims
  .command('archive')
  .description('Download victim archive')
  .argument('<log_id>', 'Victim log ID')
  .requiredOption('-o, --output <file>', 'Output file path')
  .action(async (logId, opts) => {
    try {
      const client = getClient();
      console.log(`Downloading archive for ${logId}...`);
      const path = await client.victims.downloadArchive(logId, opts.output);
      console.log(chalk.green(`Downloaded to ${path}`));
    } catch (error) {
      handleError(error);
    }
  });

// ============================================
// FILE-SEARCH V2 COMMANDS
// ============================================

const fileSearch = program.command('file-search').description('V2 File search commands');

fileSearch
  .command('create')
  .description('Create a file search job')
  .requiredOption('-e, --expression <expr>', 'Search expression')
  .option('--mode <mode>', 'Search mode (literal|regex|wildcard)', 'literal')
  .option('--max-matches <n>', 'Maximum matches', '100')
  .action(async (opts) => {
    try {
      const client = getClient();
      const result = await client.fileSearch.create(opts.expression, {
        searchMode: opts.mode,
        maxMatches: parseInt(opts.maxMatches),
      });

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.bold.green('\nFile search job created\n'));
          console.log(`Job ID: ${chalk.cyan(r.data.job_id)}`);
          console.log(`Status: ${r.data.status}`);
          console.log(`\nUse: oathnet file-search status ${r.data.job_id}`);
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

fileSearch
  .command('status')
  .description('Get file search job status')
  .argument('<job_id>', 'Job ID')
  .action(async (jobId) => {
    try {
      const client = getClient();
      const result = await client.fileSearch.getStatus(jobId);

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.bold('\nFile Search Job Status\n'));
          console.log(`Job ID: ${r.data.job_id}`);
          console.log(`Status: ${r.data.status}`);
          if (r.data.summary) {
            console.log(`\nSummary:`);
            console.log(`  Files scanned: ${r.data.summary.files_scanned}/${r.data.summary.files_total}`);
            console.log(`  Files matched: ${r.data.summary.files_matched}`);
            console.log(`  Total matches: ${r.data.summary.matches}`);
          }
          if (r.data.matches?.length) {
            console.log(`\nMatches (${r.data.matches.length}):`);
            r.data.matches.slice(0, 10).forEach((m: any, i: number) => {
              console.log(`  ${i + 1}. ${m.file_name} (${m.log_id})`);
            });
          }
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

fileSearch
  .command('search')
  .description('Create file search and wait for results')
  .requiredOption('-e, --expression <expr>', 'Search expression')
  .option('--mode <mode>', 'Search mode', 'literal')
  .option('--timeout <ms>', 'Timeout in ms', '300000')
  .action(async (opts) => {
    try {
      const client = getClient();
      console.log(`Searching for: ${opts.expression}...`);
      const result = await client.fileSearch.search(opts.expression, {
        searchMode: opts.mode,
      }, parseInt(opts.timeout));

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.green('\nSearch completed\n'));
          if (r.data.summary) {
            console.log(`Matches: ${r.data.summary.matches}`);
          }
          if (r.data.matches?.length) {
            console.log(`\nResults:`);
            r.data.matches.slice(0, 20).forEach((m: any, i: number) => {
              console.log(`  ${i + 1}. ${m.file_name}`);
              console.log(`     Log: ${m.log_id}`);
              if (m.match_text) {
                const text = m.match_text.length > 80 ? m.match_text.slice(0, 80) + '...' : m.match_text;
                console.log(`     Match: ${text}`);
              }
            });
          }
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

// ============================================
// EXPORT V2 COMMANDS
// ============================================

const exp = program.command('export').description('V2 Export commands');

exp
  .command('create')
  .description('Create an export job')
  .requiredOption('--type <type>', 'Export type (docs|victims)')
  .option('--format <format>', 'Output format (jsonl|csv)', 'jsonl')
  .option('--limit <n>', 'Maximum records')
  .option('-q, --query <query>', 'Search query')
  .action(async (opts) => {
    try {
      const client = getClient();
      const result = await client.exports.create(opts.type, {
        format: opts.format,
        limit: opts.limit ? parseInt(opts.limit) : undefined,
        search: opts.query ? { query: opts.query } : undefined,
      });

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.bold.green('\nExport job created\n'));
          console.log(`Job ID: ${chalk.cyan(r.data.job_id)}`);
          console.log(`Status: ${r.data.status}`);
          console.log(`\nUse: oathnet export status ${r.data.job_id}`);
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

exp
  .command('status')
  .description('Get export job status')
  .argument('<job_id>', 'Job ID')
  .action(async (jobId) => {
    try {
      const client = getClient();
      const result = await client.exports.getStatus(jobId);

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.bold('\nExport Job Status\n'));
          console.log(`Job ID: ${r.data.job_id}`);
          console.log(`Status: ${r.data.status}`);
          if (r.data.progress) {
            console.log(`\nProgress:`);
            if (r.data.progress.percent !== undefined) {
              console.log(`  Progress: ${r.data.progress.percent.toFixed(1)}%`);
            }
            if (r.data.progress.records_done !== undefined) {
              console.log(`  Records: ${r.data.progress.records_done}/${r.data.progress.records_total || '?'}`);
            }
          }
          if (r.data.result && r.data.status === 'completed') {
            console.log(`\nResult:`);
            console.log(`  File: ${r.data.result.file_name}`);
            console.log(`  Size: ${r.data.result.file_size} bytes`);
            console.log(`  Records: ${r.data.result.records}`);
          }
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

exp
  .command('download')
  .description('Download completed export')
  .argument('<job_id>', 'Job ID')
  .requiredOption('-o, --output <file>', 'Output file path')
  .action(async (jobId, opts) => {
    try {
      const client = getClient();
      console.log(`Downloading export ${jobId}...`);
      const path = await client.exports.download(jobId, opts.output);
      console.log(chalk.green(`Downloaded to ${path}`));
    } catch (error) {
      handleError(error);
    }
  });

exp
  .command('run')
  .description('Create export, wait, and download')
  .requiredOption('--type <type>', 'Export type (docs|victims)')
  .requiredOption('-o, --output <file>', 'Output file path')
  .option('--format <format>', 'Output format', 'jsonl')
  .option('--limit <n>', 'Maximum records')
  .option('-q, --query <query>', 'Search query')
  .action(async (opts) => {
    try {
      const client = getClient();
      console.log(`Creating ${opts.type} export...`);
      const path = await client.exports.export(opts.type, opts.output, {
        format: opts.format,
        limit: opts.limit ? parseInt(opts.limit) : undefined,
        search: opts.query ? { query: opts.query } : undefined,
      });
      console.log(chalk.green(`Export saved to ${path}`));
    } catch (error) {
      handleError(error);
    }
  });

// ============================================
// OSINT COMMANDS
// ============================================

const osint = program.command('osint').description('OSINT lookups');

osint
  .command('ip')
  .description('Get IP address information')
  .argument('<ip>', 'IP address')
  .action(async (ip) => {
    try {
      const client = getClient();
      const result = await client.osint.ipInfo(ip);

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.bold('\nIP Information\n'));
          console.log(`IP: ${r.data.query}`);
          console.log(`Country: ${r.data.country} (${r.data.countryCode})`);
          console.log(`Region: ${r.data.regionName}`);
          console.log(`City: ${r.data.city}`);
          console.log(`ISP: ${r.data.isp}`);
          console.log(`Org: ${r.data.org}`);
          console.log(`Mobile: ${r.data.mobile}`);
          console.log(`Proxy: ${r.data.proxy}`);
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

osint
  .command('steam')
  .description('Get Steam profile')
  .argument('<steam_id>', 'Steam ID')
  .action(async (steamId) => {
    try {
      const client = getClient();
      const result = await client.osint.steam(steamId);

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.bold('\nSteam Profile\n'));
          console.log(`Username: ${r.data.username}`);
          console.log(`Steam ID: ${r.data.steam_id}`);
          console.log(`Profile URL: ${r.data.profile_url}`);
          if (r.data.real_name) console.log(`Real Name: ${r.data.real_name}`);
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

osint
  .command('xbox')
  .description('Get Xbox Live profile')
  .argument('<gamertag>', 'Xbox gamertag')
  .action(async (gamertag) => {
    try {
      const client = getClient();
      const result = await client.osint.xbox(gamertag);

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.bold('\nXbox Profile\n'));
          console.log(`Gamertag: ${r.data.username}`);
          console.log(`Gamerscore: ${r.data.gamerscore}`);
          console.log(`Account Tier: ${r.data.account_tier}`);
          if (r.data.bio) console.log(`Bio: ${r.data.bio}`);
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

// Discord subcommands
const discord = osint.command('discord').description('Discord lookups');

discord
  .command('user')
  .description('Get Discord user info')
  .argument('<discord_id>', 'Discord user ID')
  .action(async (discordId) => {
    try {
      const client = getClient();
      const result = await client.osint.discordUserinfo(discordId);

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.bold('\nDiscord User\n'));
          console.log(`ID: ${r.data.id}`);
          console.log(`Username: ${r.data.username}`);
          if (r.data.global_name) console.log(`Display Name: ${r.data.global_name}`);
          if (r.data.bio) console.log(`Bio: ${r.data.bio}`);
          console.log(`Created: ${r.data.created_at}`);
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

discord
  .command('history')
  .description('Get Discord username history')
  .argument('<discord_id>', 'Discord user ID')
  .action(async (discordId) => {
    try {
      const client = getClient();
      const result = await client.osint.discordUsernameHistory(discordId);

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.bold('\nDiscord Username History\n'));
          console.log(`User ID: ${r.data.user_id}`);
          if (r.data.history?.length) {
            r.data.history.forEach((h: any) => {
              console.log(`  ${h.username} (${h.changed_at || 'unknown'})`);
            });
          } else {
            console.log('No history found');
          }
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

discord
  .command('roblox')
  .description('Get Roblox account linked to Discord')
  .argument('<discord_id>', 'Discord user ID')
  .action(async (discordId) => {
    try {
      const client = getClient();
      const result = await client.osint.discordToRoblox(discordId);

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.bold('\nDiscord to Roblox\n'));
          console.log(`Discord ID: ${r.data.discord_id}`);
          console.log(`Roblox ID: ${r.data.roblox_id}`);
          if (r.data.roblox_username) console.log(`Roblox Username: ${r.data.roblox_username}`);
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

osint
  .command('roblox')
  .description('Get Roblox user info')
  .option('--user-id <id>', 'Roblox user ID')
  .option('--username <name>', 'Roblox username')
  .action(async (opts) => {
    try {
      const client = getClient();
      const result = await client.osint.robloxUserinfo({
        userId: opts.userId,
        username: opts.username,
      });

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.bold('\nRoblox User\n'));
          console.log(`User ID: ${r.data.user_id}`);
          console.log(`Username: ${r.data.username}`);
          if (r.data.display_name) console.log(`Display Name: ${r.data.display_name}`);
          if (r.data.description) console.log(`Description: ${r.data.description}`);
          console.log(`Created: ${r.data.created}`);
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

osint
  .command('holehe')
  .description('Check email account existence')
  .argument('<email>', 'Email address')
  .action(async (email) => {
    try {
      const client = getClient();
      const result = await client.osint.holehe(email);

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.bold('\nHolehe Results\n'));
          console.log(`Email: ${r.data.email}`);
          const found = r.data.domains?.filter((d: any) => d.exists) || [];
          console.log(`Found on ${found.length} services:\n`);
          found.forEach((d: any) => {
            console.log(`  ${chalk.green('+')} ${d.domain}`);
          });
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

osint
  .command('ghunt')
  .description('Get Google account info')
  .argument('<email>', 'Email address')
  .action(async (email) => {
    try {
      const client = getClient();
      const result = await client.osint.ghunt(email);

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.bold('\nGHunt Results\n'));
          console.log(`Email: ${r.data.email}`);
          console.log(`Found: ${r.data.found}`);
          if (r.data.profile) {
            console.log(`Name: ${r.data.profile.name}`);
          }
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

osint
  .command('subdomain')
  .description('Extract subdomains for a domain')
  .argument('<domain>', 'Domain name')
  .option('--alive', 'Only return alive subdomains')
  .action(async (domain, opts) => {
    try {
      const client = getClient();
      const result = await client.osint.extractSubdomain(domain, opts.alive);

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.bold(`\nSubdomains for ${r.data.domain}\n`));
          console.log(`Found: ${r.data.count}\n`);
          r.data.subdomains.forEach((s: string) => console.log(`  ${s}`));
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

osint
  .command('minecraft')
  .description('Get Minecraft username history')
  .argument('<username>', 'Minecraft username')
  .action(async (username) => {
    try {
      const client = getClient();
      const result = await client.osint.minecraftHistory(username);

      output(result, (r) => {
        if (r.data) {
          console.log(chalk.bold('\nMinecraft History\n'));
          console.log(`Username: ${r.data.username}`);
          if (r.data.uuid) console.log(`UUID: ${r.data.uuid}`);
          if (r.data.history?.length) {
            console.log(`\nHistory:`);
            r.data.history.forEach((h: any) => {
              console.log(`  ${h.name} (${h.changed_at || 'original'})`);
            });
          }
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

// ============================================
// UTILITY COMMANDS
// ============================================

const util = program.command('util').description('Utility commands');

util
  .command('dbnames')
  .description('Autocomplete database names')
  .requiredOption('-q, --query <query>', 'Search query')
  .action(async (opts) => {
    try {
      const client = getClient();
      const result = await client.utility.dbnameAutocomplete(opts.query);

      output(result, (r) => {
        console.log(chalk.bold('\nDatabase Names\n'));
        if (Array.isArray(r)) {
          r.forEach((name: string) => console.log(`  ${name}`));
        }
      });
    } catch (error) {
      handleError(error);
    }
  });

// Parse and run
program.parse();
