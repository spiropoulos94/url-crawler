export type CrawlStatus = 'queued' | 'running' | 'done' | 'error' | 'stopped';

export interface URL {
  id: number;
  url: string;
  title: string;
  status: CrawlStatus;
  error_message?: string;
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
  action: 'stop' | 'delete' | 'recrawl';
}

// API Response wrapper types
export interface APIResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface APIError {
  error: string;
  message?: string;
  details?: Record<string, string[]>;
}

// Form state types
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Pagination params
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface HeadingData {
  level: string;
  count: number;
}

// Component prop types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Auth context types
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
}