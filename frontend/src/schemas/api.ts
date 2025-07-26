import { z } from 'zod';

// Base schemas for common data types
export const CrawlStatusSchema = z.enum(['queued', 'running', 'done', 'error', 'stopped']);

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const BrokenURLSchema = z.object({
  id: z.number(),
  crawl_result_id: z.number(),
  url: z.string().url(),
  status_code: z.number(),
  error_message: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CrawlResultSchema = z.object({
  id: z.number(),
  url_id: z.number(),
  html_version: z.string(),
  title: z.string(),
  h1_count: z.number(),
  h2_count: z.number(),
  h3_count: z.number(),
  h4_count: z.number(),
  h5_count: z.number(),
  h6_count: z.number(),
  internal_links: z.number(),
  external_links: z.number(),
  broken_links: z.number(),
  has_login_form: z.boolean(),
  error_message: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  broken_urls: z.array(BrokenURLSchema).optional(),
});

export const URLSchema = z.object({
  id: z.number(),
  url: z.string().url(),
  title: z.string(),
  status: CrawlStatusSchema,
  error_message: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  results: z.array(CrawlResultSchema).optional(),
});

// API Response schemas
export const AuthResponseSchema = z.object({
  user: UserSchema,
});

export const URLListResponseSchema = z.object({
  urls: z.array(URLSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const AddURLResponseSchema = z.object({
  url: URLSchema,
  message: z.string().optional(),
  is_new: z.boolean(),
});

export const BulkActionResponseSchema = z.object({
  message: z.string(),
});

export const LogoutResponseSchema = z.object({
  message: z.string(),
});

export const RegisterResponseSchema = z.object({
  user: UserSchema,
});

// Generic API wrapper schemas
export const APIResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string().optional(),
    error: z.string().optional(),
  });

export const APIErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  details: z.record(z.string(), z.array(z.string())).optional(),
});

// Export type inference helpers
export type User = z.infer<typeof UserSchema>;
export type URL = z.infer<typeof URLSchema>;
export type CrawlResult = z.infer<typeof CrawlResultSchema>;
export type BrokenURL = z.infer<typeof BrokenURLSchema>;
export type CrawlStatus = z.infer<typeof CrawlStatusSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type URLListResponse = z.infer<typeof URLListResponseSchema>;
export type AddURLResponse = z.infer<typeof AddURLResponseSchema>;
export type BulkActionResponse = z.infer<typeof BulkActionResponseSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type APIError = z.infer<typeof APIErrorSchema>;