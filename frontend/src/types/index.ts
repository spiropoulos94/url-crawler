export type CrawlStatus = 'queued' | 'running' | 'done' | 'error';

export interface URL {
  id: number;
  url: string;
  title: string;
  status: CrawlStatus;
  created_at: string;
  updated_at: string;
  results?: CrawlResult[];
}

export interface CrawlResult {
  id: number;
  url_id: number;
  html_version: string;
  title: string;
  h1_count: number;
  h2_count: number;
  h3_count: number;
  h4_count: number;
  h5_count: number;
  h6_count: number;
  internal_links: number;
  external_links: number;
  broken_links: number;
  has_login_form: boolean;
  error_message?: string;
  created_at: string;
  updated_at: string;
  broken_urls?: BrokenURL[];
}

export interface BrokenURL {
  id: number;
  crawl_result_id: number;
  url: string;
  status_code: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface URLListResponse {
  urls: URL[];
  total: number;
  page: number;
  limit: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AddURLRequest {
  url: string;
}

export interface BulkActionRequest {
  ids: number[];
  action: 'start' | 'stop' | 'delete' | 'recrawl';
}