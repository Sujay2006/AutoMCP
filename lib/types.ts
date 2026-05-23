// Shared types for AutoMCP.

export type SourceType = "github" | "website" | "akaunting_demo";

export type ProjectStatus =
  | "pending"
  | "scanning"
  | "reviewing"
  | "generating"
  | "deployed"
  | "failed";

/**
 * Fine-grained progress for the scan UI. The 4-step stepper renders based on
 * this rather than a wall-clock timer, so each step matches actual server work.
 */
export type ScanStep =
  | "fetching_source"
  | "classifying"
  | "extracting_actions"
  | "designing_tools"
  | "complete"
  | "failed";

export type FetchProgress = { fetched: number; total: number };

/** Lightweight JSON Schema shape used for tool inputs. */
export type JsonSchema = {
  type: string;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
};

export type JsonSchemaProperty = {
  type?: string;
  description?: string;
  enum?: (string | number)[];
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
};

/** Platform classification produced by the scanner. */
export type Classification = {
  type: string;
  confidence: number;
  signals: string[];
};

export type ContentType =
  | "application/json"
  | "application/x-www-form-urlencoded";

/** A raw action detected in source code by Gemini. */
export type DetectedAction = {
  name: string;
  description: string;
  http_method: string;
  /** Full URL path including any framework prefix (e.g. /api, /api/v1).
   *  Null when the scanner could not determine the real path from code. */
  path: string | null;
  inputs: { name: string; type: string; description: string }[];
  output_description: string;
  is_write: boolean;
  /** True when the endpoint is behind auth middleware. */
  requires_auth: boolean;
  /** The wire format the endpoint expects for request bodies. */
  content_type: ContentType;
  source_file: string;
  /** 0-1. Forced to 0 when path is null. */
  confidence: number;
};

/** A clean MCP tool definition designed by Groq from detected actions. */
export type ProposedTool = {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  is_write: boolean;
  source_action: string[];
};

/** A proposed tool plus the user's confirm-page choices. */
export type ConfirmedTool = ProposedTool & { enabled: boolean };

// --- Backend wiring (Phases B-D) ---------------------------------------------

export type AuthType =
  | "basic"
  | "bearer"
  | "api_key_header"
  | "api_key_query"
  | "none";

export type AuthCredentials = {
  username?: string;
  password?: string;
  token?: string;
  key_name?: string;
  key_value?: string;
};

/** Per-tool endpoint mapping the user reviewed in the /map UI. */
export type ToolEndpoint = {
  path: string;
  method: string;
  content_type: ContentType;
  requires_auth: boolean;
};

/** Persisted backend wiring for a project. */
export type BackendConfig = {
  api_base: string;
  auth_type: AuthType;
  // TODO(v2): encrypt credentials at rest (Supabase Vault or a server-held key).
  auth_credentials: AuthCredentials;
  tool_endpoints: Record<string, ToolEndpoint>;
};

/** Result of a single tool dry-run probe. */
export type ToolTestResult = {
  pass: boolean;
  status?: number;
  snippet?: string;
  error?: string;
  tested_at: string;
};

export type ToolTestResults = Record<string, ToolTestResult>;

// --- Persisted project shape -------------------------------------------------

export type Project = {
  id: string;
  created_at: string;
  source_url: string;
  source_type: SourceType;
  status: ProjectStatus;
  classification: Classification | null;
  detected_actions: DetectedAction[] | null;
  proposed_tools: ProposedTool[] | null;
  confirmed_tools: ConfirmedTool[] | null;
  generated_code: string | null;
  mcp_url: string | null;
  error: string | null;
  backend_config: BackendConfig | null;
  tool_test_results: ToolTestResults | null;
  current_step: ScanStep | null;
  fetch_progress: FetchProgress | null;
};
