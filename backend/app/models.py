"""Pydantic models mirroring the TypeScript types in automcp/lib/types.ts.

These are the wire shapes read/written from Supabase plus the request/response
shapes for the FastAPI routes (Phase 5). Field names match the SQL columns and
the Next.js client expectations exactly so the frontend rewrite is a base-URL
swap, not a schema change.
"""

from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

# --- Enums -------------------------------------------------------------------

SourceType = Literal["github", "website", "akaunting_demo"]

ProjectStatus = Literal[
    "pending",
    "scanning",
    "reviewing",
    "generating",
    "deployed",
    "failed",
]

ScanStep = Literal[
    "fetching_source",
    "classifying",
    "extracting_actions",
    "designing_tools",
    "complete",
    "failed",
]

ContentType = Literal[
    "application/json",
    "application/x-www-form-urlencoded",
]

AuthType = Literal[
    "basic",
    "bearer",
    "api_key_header",
    "api_key_query",
    "none",
]

# --- Scan progress -----------------------------------------------------------


class FetchProgress(BaseModel):
    fetched: int
    total: int


class Classification(BaseModel):
    type: str
    confidence: float = 0.0
    signals: list[str] = Field(default_factory=list)


# --- Scanner output ----------------------------------------------------------


class ActionInput(BaseModel):
    name: str
    type: str
    description: str = ""


class DetectedAction(BaseModel):
    """Raw action detected in source code by Gemini."""

    name: str
    description: str = ""
    http_method: str = "GET"
    # null when the scanner could not determine the real path; confidence forced to 0
    path: Optional[str] = None
    inputs: list[ActionInput] = Field(default_factory=list)
    output_description: str = ""
    is_write: bool = False
    requires_auth: bool = False
    content_type: ContentType = "application/json"
    source_file: str = ""
    confidence: float = 0.0


# --- JSON Schema (tool input) ------------------------------------------------


class JsonSchemaProperty(BaseModel):
    """Tiny self-referencing JSON Schema node — enough for MCP tool inputs."""

    model_config = ConfigDict(extra="allow")

    type: Optional[str] = None
    description: Optional[str] = None
    enum: Optional[list[Any]] = None
    items: Optional["JsonSchemaProperty"] = None
    properties: Optional[dict[str, "JsonSchemaProperty"]] = None
    required: Optional[list[str]] = None


class JsonSchema(BaseModel):
    type: str = "object"
    properties: dict[str, JsonSchemaProperty] = Field(default_factory=dict)
    required: list[str] = Field(default_factory=list)


# --- MCP tools ---------------------------------------------------------------


class ProposedTool(BaseModel):
    """Clean MCP tool definition designed by Groq from detected actions."""

    # camelCase to match the MCP spec and the existing TS shape on the wire.
    model_config = ConfigDict(populate_by_name=True)

    name: str
    description: str = ""
    inputSchema: JsonSchema = Field(default_factory=JsonSchema)
    is_write: bool = False
    source_action: list[str] = Field(default_factory=list)


class ConfirmedTool(ProposedTool):
    enabled: bool = True


# --- Backend wiring ----------------------------------------------------------


class AuthCredentials(BaseModel):
    model_config = ConfigDict(extra="allow")

    username: Optional[str] = None
    password: Optional[str] = None
    token: Optional[str] = None
    key_name: Optional[str] = None
    key_value: Optional[str] = None


class ToolEndpoint(BaseModel):
    path: str
    method: str = "GET"
    content_type: ContentType = "application/json"
    requires_auth: bool = True


class BackendConfig(BaseModel):
    api_base: str
    auth_type: AuthType
    # TODO(v2): encrypt at rest (Supabase Vault). Plaintext is hackathon-acceptable.
    auth_credentials: AuthCredentials = Field(default_factory=AuthCredentials)
    tool_endpoints: dict[str, ToolEndpoint] = Field(default_factory=dict)


class ToolTestResult(BaseModel):
    # `pass` is a Python keyword, so use an alias.
    model_config = ConfigDict(populate_by_name=True)

    pass_: bool = Field(alias="pass")
    status: Optional[int] = None
    snippet: Optional[str] = None
    error: Optional[str] = None
    tested_at: str


# --- Persisted project row ---------------------------------------------------


class ProjectRecord(BaseModel):
    """Mirror of the `projects` table row. Used both as DB read shape and as
    the GET /api/scan response body."""

    model_config = ConfigDict(extra="allow")

    id: str
    created_at: str
    source_url: str
    source_type: SourceType
    status: ProjectStatus
    classification: Optional[Classification] = None
    detected_actions: Optional[list[DetectedAction]] = None
    proposed_tools: Optional[list[ProposedTool]] = None
    confirmed_tools: Optional[list[ConfirmedTool]] = None
    generated_code: Optional[str] = None
    mcp_url: Optional[str] = None
    error: Optional[str] = None
    backend_config: Optional[BackendConfig] = None
    tool_test_results: Optional[dict[str, ToolTestResult]] = None
    current_step: Optional[ScanStep] = None
    fetch_progress: Optional[FetchProgress] = None


# --- Request / response bodies (used by Phase 5 routes) ---------------------


class ScanRequest(BaseModel):
    sourceUrl: str


class ScanCreateResponse(BaseModel):
    projectId: str


class GenerateToolsRequest(BaseModel):
    projectId: str


class GenerateToolsResponse(BaseModel):
    tools: list[ProposedTool]


class TestConnectionRequest(BaseModel):
    projectId: str
    apiBase: str
    authType: AuthType
    credentials: AuthCredentials = Field(default_factory=AuthCredentials)


class TestConnectionResponse(BaseModel):
    ok: bool
    status: Optional[int] = None
    error: Optional[str] = None


class TestToolsRequest(BaseModel):
    projectId: str
    toolEndpoints: dict[str, ToolEndpoint]


class TestToolsResponse(BaseModel):
    results: dict[str, ToolTestResult]


class GenerateMcpRequest(BaseModel):
    projectId: str
    confirmedTools: Optional[list[ConfirmedTool]] = None


class GenerateMcpResponse(BaseModel):
    code: str


class DeployRequest(BaseModel):
    projectId: str


class DeployResponse(BaseModel):
    mcpUrl: str


class ConfirmedToolsRequest(BaseModel):
    projectId: str
    confirmedTools: list[ConfirmedTool]


class OkResponse(BaseModel):
    ok: bool = True


# Resolve self-referencing forward refs.
JsonSchemaProperty.model_rebuild()
