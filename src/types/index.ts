/**
 * OathNet SDK Types
 */

// Base response metadata
export interface ResponseMeta {
  user?: {
    plan?: string;
    plan_type?: string;
    is_plan_active?: boolean;
  };
  lookups?: {
    used_today?: number;
    left_today?: number;
    daily_limit?: number;
    is_unlimited?: boolean;
  };
  service?: {
    name?: string;
    id?: string;
    category?: string;
    is_premium?: boolean;
    is_available?: boolean;
    session_quota?: number;
  };
  performance?: {
    duration_ms?: number;
    timestamp?: string;
  };
}

// Base API Response
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// ============================================
// SEARCH RESPONSES
// ============================================

export interface SearchSession {
  id: string;
  query: string;
  search_type: string;
  expires_at: string;
}

export interface SearchSessionUser {
  plan: string;
  plan_type: string;
  is_plan_active: boolean;
  daily_lookups?: {
    used: number;
    remaining: number;
    limit: number;
    is_unlimited: boolean;
  };
}

export interface SearchSessionData {
  session: SearchSession;
  user?: SearchSessionUser;
}

export interface BreachResult {
  id?: string;
  dbname?: string;
  email?: string;
  username?: string | string[];
  password?: string;
  password_hash?: string;
  full_name?: string | string[];
  first_name?: string | string[];
  last_name?: string | string[];
  phone_number?: string;
  address_street?: string | string[];
  city?: string | string[];
  state?: string;
  zip_code?: string;
  country?: string | string[];
  date_birth?: string | string[];
  ip?: string;
  [key: string]: any;
}

export interface BreachSearchData {
  results: BreachResult[];
  results_found: number;
  results_shown: number;
  cursor?: string;
  _meta?: ResponseMeta;
}

export interface StealerResult {
  LOG?: string;
  domain?: string[];
  email?: string[];
  username?: string[];
  password?: string[];
  url?: string[];
  ip?: string;
  country?: string;
  [key: string]: any;
}

export interface StealerSearchData {
  results: StealerResult[];
  results_found: number;
  results_shown: number;
  cursor?: string;
  _meta?: ResponseMeta;
}

// ============================================
// V2 STEALER RESPONSES
// ============================================

export interface V2StealerResult {
  id?: string;
  log_id?: string;
  url?: string;
  domain?: string[];
  subdomain?: string[];
  email_domains?: string[];
  path?: string[];
  username?: string;
  password?: string;
  email?: string[];
  log?: string;
  pwned_at?: string;
  indexed_at?: string;
  [key: string]: any;
}

export interface V2SearchMeta {
  total?: number;
  count?: number;
  took_ms?: number;
  has_more?: boolean;
  total_pages?: number;
  max_score?: number;
}

export interface V2StealerData {
  items: V2StealerResult[];
  meta?: V2SearchMeta;
  next_cursor?: string;
  _meta?: ResponseMeta;
}

export interface SubdomainData {
  subdomains: string[];
  count: number;
  domain: string;
  _meta?: ResponseMeta;
}

// ============================================
// V2 VICTIMS RESPONSES
// ============================================

export interface V2VictimResult {
  log_id?: string;
  device_users?: string[];
  hwids?: string[];
  device_ips?: string[];
  device_emails?: string[];
  discord_ids?: string[];
  total_docs?: number;
  pwned_at?: string;
  indexed_at?: string;
  [key: string]: any;
}

export interface V2VictimsData {
  items: V2VictimResult[];
  meta?: V2SearchMeta;
  next_cursor?: string;
  _meta?: ResponseMeta;
}

export interface VictimManifestNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  size_bytes?: number;
  children?: VictimManifestNode[];
}

export interface VictimManifestData {
  log_id: string;
  log_name?: string;
  victim_tree: VictimManifestNode;
  _meta?: ResponseMeta;
}

// ============================================
// V2 FILE SEARCH RESPONSES
// ============================================

export interface FileSearchSnippet {
  line?: string;
  pre?: string[];
  post?: string[];
  truncated?: boolean;
}

export interface FileSearchMatch {
  log_id: string;
  file_id: string;
  file_name: string;
  relative_path: string;
  size_bytes?: number;
  line_number?: number;
  column_range?: {
    start: number;
    end: number;
  };
  match_text?: string;
  snippet?: FileSearchSnippet;
}

export interface FileSearchProgress {
  logs_total?: number;
  logs_completed?: number;
  files_total?: number;
  files_scanned?: number;
  percent?: number;
  updated_at?: string;
}

export interface FileSearchSummary {
  files_total?: number;
  files_scanned?: number;
  files_matched?: number;
  matches?: number;
  duration_ms?: number;
  bytes_scanned?: number;
  budget_exceeded?: boolean;
  truncated?: boolean;
  timeouts?: number;
}

export interface FileSearchLimits {
  byte_budget_bytes?: number;
  job_ttl_seconds?: number;
  max_context_lines?: number;
  max_expression_length?: number;
  max_file_size_bytes?: number;
  max_log_ids?: number;
  max_matches?: number;
}

export interface FileSearchJobData {
  job_id?: string;
  status?: string;  // queued, running, completed, canceled
  created_at?: string;
  started_at?: string;
  completed_at?: string;
  expires_at?: string;
  next_poll_after_ms?: number;
  progress?: FileSearchProgress;
  summary?: FileSearchSummary;
  limits?: FileSearchLimits;
  matches?: FileSearchMatch[];
  _meta?: ResponseMeta;
}

// ============================================
// V2 EXPORT RESPONSES
// ============================================

export interface ExportProgress {
  records_done?: number;
  records_total?: number;
  bytes_done?: number;
  percent?: number;
  updated_at?: string;
}

export interface ExportResult {
  file_name?: string;
  file_size?: number;
  records?: number;
  format?: string;
  expires_at?: string;
  download_url?: string;
}

export interface ExportJobData {
  job_id?: string;
  status?: string;  // queued, running, completed, canceled
  progress?: ExportProgress;
  result?: ExportResult;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
  expires_at?: string;
  next_poll_after_ms?: number;
  _meta?: ResponseMeta;
}

// ============================================
// OSINT RESPONSES
// ============================================

export interface IPInfoData {
  status?: string;
  query?: string;
  continent?: string;
  continentCode?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  district?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  offset?: number;
  currency?: string;
  isp?: string;
  org?: string;
  asname?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
  reverse?: string;
  _meta?: ResponseMeta;
  [key: string]: any;
}

export interface SteamRawData {
  steamid?: string;
  communityvisibilitystate?: number;
  profilestate?: number;
  personaname?: string;
  profileurl?: string;
  avatar?: string;
  avatarmedium?: string;
  avatarfull?: string;
  avatarhash?: string;
  personastate?: number;
  primaryclanid?: string;
  timecreated?: number;
  personastateflags?: number;
}

export interface SteamProfileData {
  username?: string;
  id?: string;
  avatar?: string;
  meta?: {
    username?: string;
    id?: string;
    avatar?: string;
    raw_data?: SteamRawData;
    source?: string;
  };
  _meta?: ResponseMeta;
  [key: string]: any;
}

export interface XboxGameHistory {
  title?: string;
  coverImage?: string;
  lastPlayed?: string;
  platforms?: string[];
  scoreDetails?: {
    achieved?: number;
    total?: number;
    achievementsUnlocked?: number;
  };
  completionPercentage?: number;
}

export interface XboxProfileData {
  username?: string;
  id?: string;
  avatar?: string;
  meta?: {
    id?: string;
    meta?: {
      gamerscore?: string;
      accounttier?: string;
      xboxonerep?: string;
      preferredcolor?: string;
      realname?: string;
      bio?: string;
      tenurelevel?: string;
      location?: string;
    };
    username?: string;
    avatar?: string;
    cached_at?: number;
    scraper_data?: {
      background_picture_url?: string;
      gamerscore?: number;
      games_played?: number;
      game_history?: XboxGameHistory[];
    };
  };
  _meta?: ResponseMeta;
  [key: string]: any;
}

export interface DiscordUserData {
  id?: string;
  username?: string;
  global_name?: string;
  avatar_url?: string;
  banner_url?: string | null;
  creation_date?: string;
  badges?: string[];
  _meta?: ResponseMeta;
  [key: string]: any;
}

export interface DiscordUsernameHistoryEntry {
  name: string[];
  time: string[];
}

export interface DiscordUsernameHistoryData {
  success?: boolean;
  message?: string;
  history: DiscordUsernameHistoryEntry[];
  lookups_left?: number | null;
  _meta?: ResponseMeta;
}

export interface DiscordToRobloxData {
  roblox_id?: string;
  name?: string;
  displayName?: string;
  created?: string;
  description?: string;
  avatar?: string;
  badges?: string[];
  groupCount?: number;
  _meta?: ResponseMeta;
}

export interface RobloxUserData {
  username?: string;
  'Current Username'?: string;
  'Old Usernames'?: string;
  'Display Name'?: string;
  user_id?: string;
  'User ID'?: string;
  Discord?: string;
  'Join Date'?: string;
  'Avatar URL'?: string;
  _meta?: ResponseMeta;
  [key: string]: any;
}

export interface HoleheData {
  domains: string[];
  _meta?: ResponseMeta;
}

export interface GHuntData {
  email: string;
  found: boolean;
  profile?: {
    name?: string;
    profile_picture?: string;
    cover_picture?: string;
    last_edit?: string;
    maps_id?: string;
    calendar_id?: string;
  };
  _meta?: ResponseMeta;
  [key: string]: any;
}

export interface ExtractSubdomainData {
  domain: string;
  subdomains: string[];
  count: number;
  _meta?: ResponseMeta;
}

export interface MinecraftHistoryEntry {
  name: string;
  changed_at?: string;
}

export interface MinecraftHistoryData {
  uuid?: string;
  username: string;
  history: MinecraftHistoryEntry[];
  _meta?: ResponseMeta;
}

// ============================================
// V2 HEALTH & ANALYTICS
// ============================================

export interface V2HealthData {
  status: 'ok' | 'degraded' | 'down';
  checked_at_utc: string;
  dependencies: {
    redis: { status: string };
    s3: { status: string };
  };
}

export interface V2AnalyticsDayStats {
  date: string;
  docs: number;
  victims: number;
  emails?: number;
  ips?: number;
  discord_ids?: number;
  hwids?: number;
}

export interface V2AnalyticsData {
  totals: V2AnalyticsDayStats;
  past_hour: V2AnalyticsDayStats;
  last_7_days: V2AnalyticsDayStats[];
  updated_at: string;
}

// ============================================
// ERROR TYPES
// ============================================

export class OathNetError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseData?: any
  ) {
    super(message);
    this.name = 'OathNetError';
  }
}

export class AuthenticationError extends OathNetError {
  constructor(message: string = 'Invalid API key', responseData?: any) {
    super(message, 401, responseData);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends OathNetError {
  constructor(message: string, responseData?: any) {
    super(message, 400, responseData);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends OathNetError {
  constructor(message: string = 'Resource not found', responseData?: any) {
    super(message, 404, responseData);
    this.name = 'NotFoundError';
  }
}

export class QuotaExceededError extends OathNetError {
  constructor(message: string = 'Quota exceeded', responseData?: any) {
    super(message, 429, responseData);
    this.name = 'QuotaExceededError';
  }
}

export class RateLimitError extends OathNetError {
  constructor(message: string = 'Rate limit exceeded', responseData?: any) {
    super(message, 429, responseData);
    this.name = 'RateLimitError';
  }
}
