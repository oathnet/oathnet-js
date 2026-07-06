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
// STRUCTURED FILTERS AND SCANNER RESPONSES
// ============================================

export type JsonScalar = string | number | boolean;
export type JsonScalarOrArray = JsonScalar | JsonScalar[];

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'in'
  | 'not_in'
  | 'contains'
  | 'starts_with'
  | 'ends_with'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'exists'
  | 'wildcard';

export type StructuredFilterValue = string | boolean | string[];

export type StructuredFilterNode =
  | {
      field: string;
      operator: FilterOperator;
      value?: StructuredFilterValue;
    }
  | {
      and: StructuredFilterNode[];
    }
  | {
      or: StructuredFilterNode[];
    };

export type FilterContextId = string;

export interface SearchQueryConfig {
  [key: string]:
    | JsonScalarOrArray
    | StructuredFilterNode
    | Record<string, JsonScalarOrArray>
    | undefined;
  q?: string;
  filter?: StructuredFilterNode;
  filter_id?: string;
  wildcard?: boolean;
  logic?: 'and' | 'or';
  from?: string;
  to?: string;
  date_field?: 'indexed_at' | 'pwned_at';
  sort?: string;
}

export interface ScannerQueryConfig extends SearchQueryConfig {
  extra_params?: Record<string, JsonScalarOrArray>;
}

export type ScannerType = 'stealer' | 'breach';
export type ScannerStatus = 'active' | 'paused' | 'disabled';
export type ScannerNotificationType = 'email' | 'webhook' | 'discord';
export type ScannerRunStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'notification_failed';
export type ScannerWebhookSecurityMode =
  | 'api_key'
  | 'signed_json'
  | 'signed_encrypted';

export interface Scanner {
  uid: string;
  user: string;
  name: string;
  scanner_type: ScannerType;
  scanner_type_display: string;
  status: ScannerStatus;
  status_display: string;
  query_config: ScannerQueryConfig;
  notification_type: ScannerNotificationType;
  notification_type_display: string;
  webhook_url: string | null;
  webhook_security_mode?: ScannerWebhookSecurityMode;
  webhook_secret_last_rotated_at?: string | null;
  notify_on_zero_results: boolean;
  created_at: string;
  updated_at: string;
  last_run_at: string | null;
  last_found_at: string | null;
  next_run_at: string | null;
  total_results_found: number;
  total_runs: number;
  consecutive_failures: number;
}

export interface ScannerQuota {
  max_scanners: number;
  current_count: number;
  remaining: number;
  can_create: boolean;
}

export interface ScannerCreateRequest {
  name: string;
  scanner_type: ScannerType;
  query_config: ScannerQueryConfig;
  notification_type: ScannerNotificationType;
  webhook_url?: string;
  webhook_secret?: string;
  webhook_security_mode?: ScannerWebhookSecurityMode;
  notify_on_zero_results?: boolean;
}

export interface ScannerUpdateRequest {
  name?: string;
  scanner_type?: ScannerType;
  query_config?: ScannerQueryConfig;
  notification_type?: ScannerNotificationType;
  webhook_url?: string | null;
  webhook_secret?: string;
  webhook_security_mode?: ScannerWebhookSecurityMode;
  notify_on_zero_results?: boolean;
}

export interface ScannerDraftTestRequest {
  name?: string;
  scanner_type: ScannerType;
  query_config: ScannerQueryConfig;
  notification_type: ScannerNotificationType;
  webhook_url?: string;
  webhook_secret?: string;
  webhook_security_mode?: ScannerWebhookSecurityMode;
  notify_on_zero_results?: boolean;
}

export interface ScannerTestPreview {
  event_name?: string;
  search_url?: string;
  security_mode?: ScannerWebhookSecurityMode | string;
  verification_method?: string;
  authorization_scheme?: string;
  encryption_enabled?: boolean;
  header_names?: string[];
  body_kind?: string;
  body_example?: Record<string, any>;
}

export interface ScannerTestResponse {
  success: boolean;
  notification_type?: string;
  target?: string;
  status_code?: number;
  message?: string;
  preview?: ScannerTestPreview;
  generated_webhook_secret?: string;
}

export interface ScannerTriggerResponse {
  message?: string;
  scanner_uid?: string;
}

export interface ScannerRun {
  uid: string;
  status: ScannerRunStatus;
  status_display: string;
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  search_from: string;
  search_to: string;
  results_count: number;
  results_sample: unknown[] | null;
  request_params_used?: Record<string, unknown> | null;
  execution_meta?: Record<string, unknown> | null;
  notification_sent: boolean;
  notification_sent_at: string | null;
  notification_error: string | null;
  error_message: string | null;
}

export interface ScannerNotificationAttempt {
  uid: string;
  attempt_number: number;
  attempted_at: string;
  success: boolean;
  response_status_code: number | null;
  error_message: string | null;
  response_excerpt?: string | null;
  delivery_id: string;
  security_mode: string;
  target: string;
}

export interface ScannerRunDetail extends ScannerRun {
  search_url: string;
  previous_results_count: number | null;
  results_delta: number | null;
  notification_logs: ScannerNotificationAttempt[];
}

export interface ScannerWebhookSecurityData {
  scanner_uid: string;
  notification_type: ScannerNotificationType | string;
  webhook_security_mode: ScannerWebhookSecurityMode | string;
  verification_method: string;
  encryption_enabled: boolean;
  secret_configured: boolean;
  secret_preview: string | null;
  key_id: string | null;
  last_rotated_at: string | null;
  headers: string[];
}

export type ScannerWebhookSecurityResponse =
  ApiResponse<ScannerWebhookSecurityData>;

export interface ScannerWebhookRotateData {
  scanner_uid: string;
  webhook_security_mode: ScannerWebhookSecurityMode | string;
  secret: string;
  secret_preview: string | null;
  key_id: string | null;
  last_rotated_at: string | null;
}

export type ScannerWebhookRotateResponse =
  ApiResponse<ScannerWebhookRotateData>;

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
// V2 BREACH RESPONSES
// ============================================

export interface V2BreachResult {
  id?: string;
  email?: string;
  email_domain?: string;
  username?: string;
  password?: string;
  password_hash?: string;
  salt?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  display_name?: string;
  phone_number?: string;
  phone_national?: string;
  address_street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  date_birth?: string;
  age?: number;
  created_at?: string;
  last_login?: string;
  indexed_at?: string;
  ip?: string;
  discordid?: string;
  discord_id?: string;
  instagram?: string;
  linkedin?: string;
  iban?: string;
  ssn?: string;
  dbname?: string;
  gender?: string;
  language?: string;
  bio?: string;
  location?: string;
  extra?: Record<string, unknown>;
  [key: string]: any;
}

export interface V2LeakMetadata {
  Title?: string;
  Domain?: string;
  BreachDate?: string;
  PwnCount?: number;
  Description?: string;
}

export interface V2BreachData {
  items: V2BreachResult[];
  meta?: V2SearchMeta;
  dbname_info?: Record<string, V2LeakMetadata>;
  next_cursor?: string;
  _meta?: ResponseMeta | Record<string, unknown>;
}

export interface V2BreachSearchOptions {
  [key: string]: unknown;
  q?: string;
  cursor?: string;
  pageSize?: number;
  page_size?: number;
  sort?: string;
  from?: string;
  to?: string;
  dateField?: 'indexed_at' | 'pwned_at';
  date_field?: 'indexed_at' | 'pwned_at';
  wildcard?: boolean;
  logic?: 'and' | 'or';
  filter?: StructuredFilterNode | string;
  filterId?: string;
  filter_id?: string;
  searchId?: string;
  search_id?: string;
  fields?: string[];
  'fields[]'?: string[];
  emails?: string[];
  'email[]'?: string[];
  emailDomains?: string[];
  'email_domain[]'?: string[];
  domains?: string[];
  'domain[]'?: string[];
  usernames?: string[];
  'username[]'?: string[];
  passwords?: string[];
  'password[]'?: string[];
  passwordHashes?: string[];
  'password_hash[]'?: string[];
  ips?: string[];
  'ip[]'?: string[];
  phones?: string[];
  'phone[]'?: string[];
  firstNames?: string[];
  'first_name[]'?: string[];
  lastNames?: string[];
  'last_name[]'?: string[];
  fullNames?: string[];
  'full_name[]'?: string[];
  cities?: string[];
  'city[]'?: string[];
  countries?: string[];
  'country[]'?: string[];
  states?: string[];
  'state[]'?: string[];
  postalCodes?: string[];
  'postal_code[]'?: string[];
  dbnames?: string[];
  'dbname[]'?: string[];
  discordIds?: string[];
  'discord_id[]'?: string[];
  ibans?: string[];
  'iban[]'?: string[];
  ssns?: string[];
  'ssn[]'?: string[];
  date_birth_from?: string;
  date_birth_to?: string;
  names?: string[];
  'name[]'?: string[];
  genders?: string[];
  'gender[]'?: string[];
  addresses?: string[];
  'address[]'?: string[];
  discords?: string[];
  'discord[]'?: string[];
  socials?: string[];
  'social[]'?: string[];
  financials?: string[];
  'financial[]'?: string[];
  gamings?: string[];
  'gaming[]'?: string[];
}

export type V2BreachSearchPostOptions = Omit<
  V2BreachSearchOptions,
  'filter' | 'filterId' | 'filter_id'
>;

export interface V2BreachSearchPostBody {
  [key: string]: unknown;
  filter?: StructuredFilterNode;
  filterId?: string;
  filter_id?: string;
}

export interface V2AutocompleteValueItem {
  field?: string;
  value?: string;
  count?: number;
}

export interface V2AutocompleteValueResponse {
  items: V2AutocompleteValueItem[];
  took_ms?: number;
}

export interface V2AutocompleteDBNameItem {
  name?: string;
  count?: number;
  fields?: string[];
  info?: V2LeakMetadata;
}

export interface V2AutocompleteDBNamesResponse {
  items: V2AutocompleteDBNameItem[];
  took_ms?: number;
}

export interface V2AutocompleteFieldItem {
  dbname?: string;
  count?: number;
}

export interface V2AutocompleteFieldsResponse {
  field?: string;
  items: V2AutocompleteFieldItem[];
  total?: number;
  took_ms?: number;
}

export interface V2BreachAutocompleteValuesOptions {
  field?: string;
  q?: string;
  limit?: number;
  includeInfo?: boolean;
  include_info?: boolean;
}

export interface V2BreachAutocompleteDBNamesOptions {
  q?: string;
  limit?: number;
}

export interface V2BreachAutocompleteFieldsOptions {
  limit?: number;
}

export type V2AIFilterIndex =
  | 'breach'
  | 'docs'
  | 'victims'
  | 'investigation'
  | 'stealer_investigation';

export interface V2AIFilterRequest {
  query: string;
  index?: V2AIFilterIndex;
  filter_id?: FilterContextId;
}

export interface V2AIResponse {
  filter_id?: FilterContextId;
  filter?: StructuredFilterNode;
}

export interface V2AIHistoryItem {
  query?: string;
  filter?: StructuredFilterNode;
}

export interface V2AIContextResponse {
  id?: FilterContextId;
  index_type?: string;
  query?: string;
  filter?: StructuredFilterNode;
  sample_data?: Record<string, unknown>;
  field_values?: Record<string, string[]>;
  total_hits?: number;
  history?: V2AIHistoryItem[];
  source?: string;
  parent_id?: FilterContextId | null;
  created_at?: string;
  expires_at?: string;
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
  format?: string;
  file_name?: string;
  file_path?: string;
  file_size?: number;
  records?: number;
  ready_at?: string;
  expires_at?: string;
  download_url?: string;
}

export interface ExportRequestSummary {
  type?: string;
  service?: string;
  format?: string;
  limit?: number;
  fields?: string[];
  request_count?: number;
}

export interface ExportJobData {
  id?: string;
  job_id?: string;
  status?: string;  // queued, running, completed, canceled
  progress?: ExportProgress;
  result?: ExportResult;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
  expires_at?: string;
  last_error?: string;
  request?: ExportRequestSummary;
  next_poll_after_ms?: number;
  metadata?: Record<string, unknown>;
  _meta?: ResponseMeta;
}

// ============================================
// V2 BULK SEARCH RESPONSES
// ============================================

export type BulkSearchServiceType = 'stealer' | 'docs' | 'victims' | 'breach';
export type BulkSearchFormat = 'csv' | 'json' | 'jsonl' | 'txt' | 'html';

export interface BulkSearchCreateRequest {
  [key: string]: unknown;
  terms?: string[];
  service: BulkSearchServiceType;
  format?: BulkSearchFormat;
  dbnames?: string[];
  query_config?: SearchQueryConfig;
  limit?: number;
  fields?: string[];
}

export interface BulkSearchListOptions {
  page?: number;
  pageSize?: number;
  page_size?: number;
}

export interface BulkSearchJobData extends ExportJobData {
  user?: string;
  updated_at?: string;
  search_service?: string | null;
  output_format?: BulkSearchFormat | string | null;
  results_expired?: boolean;
  query?: string | null;
  results_count?: number | null;
  lookups_deducted?: number | null;
}

export interface BulkSearchListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BulkSearchJobData[];
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
