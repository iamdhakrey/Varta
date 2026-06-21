export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type AuthType = "none" | "basic" | "bearer" | "apiKey";

export type BodyMode =
  | "json"
  | "form-data"
  | "urlencoded"
  | "raw"
  | "multipart";

export interface KeyValueRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface AuthConfig {
  type: AuthType;
  basic?: { username: string; password: string };
  bearer?: { token: string };
  apiKey?: { key: string; value: string; addTo: "header" | "query" };
}

export interface UploadedFile {
  id: string;
  name: string;
  sizeBytes: number;
}

export interface RequestBody {
  mode: BodyMode;
  raw?: string;
  formData?: KeyValueRow[];
  urlEncoded?: KeyValueRow[];
  files?: UploadedFile[];
}

export interface ApiFile {
  name: string;
  path: string;
}

export interface ApiRequestBody {
  files?: ApiFile[];
  raw?: string;
  json?: any;
  mode?: BodyMode;
  // Extend this if you have text fields or JSON payloads
}

export interface KeyValueRow {
  key: string;
  value: string;
  enabled: boolean; // Add or remove fields based on your exact Rust definition
}

export interface CookieRow {
  id: string;
  name: string;
  value: string;
  domain?: string;
  path?: string;
}

export interface ApiRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  params: KeyValueRow[]; // Must be a sequence (array)
  headers: KeyValueRow[]; // Must be a sequence (array)
  cookies: CookieRow[]; // Must be a sequence (array)
  auth: any; // Match your AuthConfig structure
  body: ApiRequestBody;
}

export interface CollectionFolder {
  id: string;
  name: string;
  requests: ApiRequest[];
}

export interface Collection {
  id: string;
  name: string;
  folders: CollectionFolder[];
}

export interface Environment {
  id: string;
  name: string;
}

export interface HistoryEntry {
  id: string;
  method: HttpMethod;
  url: string;
  status: number;
  timestamp: string;
  durationMs: number;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  timeMs: number;
  sizeBytes: number;
  headers: Record<string, string>;
  cookies: CookieRow[];
  body: string;
}

export interface RequestTab {
  id: string;
  request: ApiRequest;
  isDirty: boolean;
  response?: ApiResponse;
  isSending: boolean;
  error?: string;
}
