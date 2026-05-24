# AutoMCP Backend — file-by-file reference

Same format as the examples for `Models.py`, `Scan.py`, `Github.py`, `Filter.py`.

---

## main.py

This file is the **FastAPI entry point and HTTP wiring layer** of the project. Its job is to create the FastAPI app, attach CORS, register the `/health` probe, and mount every router under the `/api` prefix so URL paths match what the frontend already expects (`/api/scan`, `/api/test-connection`, `/api/deploy`, etc.). It stores the running app instance in the `app` variable, builds the CORS allowlist into `_origins` from `settings.FRONTEND_ORIGIN`, and uses `allow_origin_regex=r"http://localhost:\d+"` to keep any localhost dev port working. The `health()` function returns `{"status": "ok"}` for uptime checks. Routers wired in are `scan`, `tools`, `generate`, `deploy`, `connection`, and `test_tools`. Overall, this file acts as the project's **HTTP front door**: every request hits middleware here before being dispatched to a route handler.

## config.py

This file is the **environment/configuration loader** of the project, built on `pydantic-settings`. Its job is to read values from a local `.env` file or process environment and expose them as a single typed `settings` object. It stores all keys the backend needs as fields on the `Settings` class: `GEMINI_API_KEY`, `GROQ_API_KEY`, `GITHUB_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_WORKERS_SUBDOMAIN`, and `FRONTEND_ORIGIN`. `SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")` controls how the file is parsed — missing keys default to empty strings, unknown keys are silently ignored. The module-level `settings = Settings()` makes the loaded values importable everywhere as `from app.config import settings`. Overall, this file acts as the project's **single source of truth for runtime configuration**.

## db.py

This file is the **async database access layer** of the project. Its job is to wrap the synchronous `supabase-py` client in `asyncio.to_thread(...)` calls so that FastAPI routes never block the event loop on a DB round-trip. It stores no state itself — it's a thin function module. `select_project(project_id)` reads one row from the `projects` table and returns it as a dict or `None`. `select_project_typed(...)` does the same but returns a validated `ProjectRecord`. `insert_project(payload)` inserts a row and returns the created row (raising `RuntimeError` if nothing came back). `update_project(project_id, patch)` updates a row in place with arbitrary jsonb-compatible fields. The internal `_sb()` helper lazily resolves the Supabase singleton via `get_supabase()`. Overall, this file acts as the **async-safe gateway between FastAPI handlers and Postgres**.

## demo.py

This file is the **Akaunting demo dataset module** of the project. Its job is to provide hand-curated, deterministic data so the "Try the demo" button can ship a working MCP server without scanning anything or talking to a real backend. It stores the demo source URL in `AKAUNTING_SOURCE_URL`, a fake `Classification` in `AKAUNTING_CLASSIFICATION` (Laravel, confidence 1.0), seven `DetectedAction` entries in `AKAUNTING_DETECTED_ACTIONS` (list/show/create invoices, mark paid, list contacts, get reports, send email), seven `ProposedTool` entries in `AKAUNTING_TOOLS` (the cleaned-up tool set the demo MCP exposes), and a dict in `AKAUNTING_MOCK` mapping each tool name to a baked-in mock response (sample invoices, customers, balance sheet, payment confirmations). The `_prop()` helper constructs `JsonSchemaProperty` objects compactly. The data is consumed by `routes/scan.py` (when seeding the demo project row) and `routes/generate.py` (embedded into the rendered Worker as `{{MOCK_JSON}}`). Overall, this file acts as the project's **canned data for a one-click no-backend demo**.

## models.py

This file is the **central data model / schema definition file** of the project. It defines all the structures used by the backend, frontend, APIs, and database using Pydantic models. It stores project-related data in models like `ProjectRecord`, scan progress in `FetchProgress`, classification info in `Classification`, detected API actions in `DetectedAction`, MCP tool definitions in `ProposedTool` and `ConfirmedTool`, authentication data in `AuthCredentials`, backend API configuration in `BackendConfig`, and API request/response data in classes like `ScanRequest`, `DeployResponse`, `GenerateMcpRequest`, etc. It also stores validation rules using `SourceType`, `ProjectStatus`, `ScanStep`, `ContentType`, and `AuthType` `Literal` types. Overall, this file acts as the **central blueprint that defines how all data is structured, validated, stored, and transferred** across the whole system.

---

## backend_auth/auth.py

This file is the **user-backend authentication helper** of the project. Its job is to translate a stored auth config (Bearer / Basic / API key header / API key query / None) into the actual `(headers, query_params)` that go onto the outbound HTTP request when the backend talks to a *user's* API. It stores no module state — it's pure functions. `apply_auth(auth_type, creds)` normalises `creds` (None / `AuthCredentials` / dict) into a working dict `c`, then branches on `auth_type` to produce the right output: for `"basic"` it base64-encodes `username:password` into an `Authorization: Basic ...` header; for `"bearer"` it builds `Authorization: Bearer <token>`; for `"api_key_header"` it sets the user's custom header (default `X-API-Key`); for `"api_key_query"` it puts the key in a query param (default `api_key`); for `"none"` it returns both dicts empty. `build_url(api_base, path, query_params)` strips trailing slashes, ensures the path starts with `/`, and appends `urlencode(query_params)` if present. Overall, this file acts as the project's **single source of truth for outbound-API auth** — `test-connection`, `test-tools`, and the generated Worker all use it so behaviour is identical everywhere.

---

## clients/gemini.py

This file is the **Gemini 2.5 Flash client wrapper** of the project. Its job is to call Google's `google-genai` SDK in JSON mode and return parsed Python objects, off the event loop. It stores the model name in `GEMINI_MODEL = "gemini-2.5-flash"`, a generous `DEFAULT_MAX_OUTPUT_TOKENS = 32_768` (because real scans often blow past 8K), and a lazy singleton in `_client`. `_get_client()` initialises the SDK once with `settings.GEMINI_API_KEY` or raises if the key is missing. `call_gemini(system_prompt, user_prompt, response_schema=None)` builds a `GenerateContentConfig` with `response_mime_type="application/json"`, `temperature=0.2`, and the token cap; runs the sync `generate_content` call inside `asyncio.to_thread`; pulls the response text and `finish_reason`; raises a clear `RuntimeError` if the model truncated (`MAX_TOKENS`); otherwise `json.loads` and returns the parsed result. Overall, this file acts as the project's **only path to Gemini**, used by the action extractor.

## clients/groq.py

This file is the **Groq (Llama 3.3 70B) client wrapper** of the project. Its job is to talk to Groq's chat-completions API in JSON mode for tool design. It stores the model name in `GROQ_MODEL = "llama-3.3-70b-versatile"` and a lazy `AsyncGroq` singleton in `_client`. Unlike Gemini's sync SDK, Groq ships a native async client, so no thread offload is needed. `_get_client()` builds the client lazily and raises if `GROQ_API_KEY` is unset. `call_groq(system_prompt, user_prompt)` posts the two messages with `response_format={"type": "json_object"}`, `temperature=0.3`, `max_tokens=4096`, then pulls `choices[0].message.content` and parses it with `json.loads`, raising `RuntimeError` on empty or non-JSON output. Overall, this file acts as the project's **only path to Groq**, used by the tool designer.

## clients/supabase_client.py

This file is the **Supabase client singleton** of the project. Its job is to provide one shared `supabase-py` client (built with the **service-role** key, so it bypasses RLS) without paying the connection cost on every request. It stores the lazy singleton in `_client`. `get_supabase()` initialises the client on first call with `settings.SUPABASE_URL` and `settings.SUPABASE_SERVICE_ROLE_KEY`, raising a clear `RuntimeError` if either is missing. The module-level `__getattr__(name)` is a Python trick that lets callers write `from app.clients.supabase_client import supabase` and still get lazy init — `supabase` is resolved on attribute access, not at import time. supabase-py 2.x is synchronous, so all consumers (`db.py`) wrap calls in `asyncio.to_thread`. Overall, this file acts as the **server-side gateway to Postgres** via Supabase.

---

## deployer/cloudflare.py

This file is the **Cloudflare Workers deployer** of the project. Its job is to upload the rendered Worker JavaScript to Cloudflare's multipart-modules API, enable the `workers.dev` subdomain for the script, and return the public URL. It stores the API base in `CF_API = "https://api.cloudflare.com/client/v4"` and reads three values from `settings`: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_WORKERS_SUBDOMAIN`. `is_cloudflare_configured()` is a cheap precheck so routes can return a friendly error before attempting an upload. `deploy_to_workers(script_name, code)` builds the multipart `files` dict (a `metadata` JSON part with `main_module=worker.js` + `compatibility_date`, and the actual `worker.js` part with `application/javascript+module` content type), `PUT`s it to `/accounts/{account_id}/workers/scripts/{script_name}`, then `POST`s to the `/subdomain` endpoint to expose it on workers.dev (treated as best-effort — a 4xx there is logged, not raised). Returns `https://{script}.{subdomain}.workers.dev`. Overall, this file acts as the project's **single point of contact with Cloudflare's API**.

---

## generator/code_renderer.py

This file is the **Cloudflare Worker code renderer** of the project. Its job is to take a project's tools, backend config, auth credentials, endpoint map, and optional mock data, and produce a deployable TypeScript-on-Workers source file. It's deliberately a **pure text-substitution module** — the entire MCP-over-HTTP plumbing lives in `templates/mcp-server.ts.tmpl`, and Python only injects JSON-valued constants. It stores the template path in `_TEMPLATE_PATH` (resolved at import time relative to this file). `_load_template()` reads the template fresh on each call (so edits take effect without a restart). `_tool_to_dict()` and `_endpoint_to_dict()` convert Pydantic models to JSON-ready dicts. `render_mcp_server(...)` builds the four big JSON literals (`tools_json`, `auth_json`, `endpoints_json`, `mock_json`), generates an ISO-Z `timestamp`, then runs eight `.replace(...)` calls against the template (`{{TIMESTAMP}}`, `{{SERVER_NAME}}`, `{{SOURCE_URL}}`, `{{API_BASE}}`, `{{AUTH_JSON}}`, `{{TOOLS_JSON}}`, `{{TOOL_ENDPOINTS_JSON}}`, `{{MOCK_JSON}}`) and returns the rendered string. Overall, this file acts as the **glue that turns project metadata into deployable Worker source code**.

## generator/tool_designer.py

This file is the **Groq-powered MCP tool designer** of the project. Its job is to take raw detected actions and produce 5-10 cleanly-named, agent-friendly MCP tool definitions. It stores a long system prompt in `SYSTEM_PROMPT` (the design rules: coarse beats fine, verbs first, descriptions as sales pitches, max 10 tools), the canonical JSON Schema types in `CANONICAL_JSON_SCHEMA_TYPES`, and a mapping from common language-level type names to canonical ones in `JSON_SCHEMA_TYPE_ALIASES` (e.g. `int → integer`, `float → number`, `bool → boolean`, `dict → object`). `canonicalize_type(t)` normalises a single type string. `_normalize_schema_node(node)` recursively rewrites `type` fields inside a JSON Schema tree. `_normalize_tool(t)` defensively converts an LLM-returned dict into a valid `ProposedTool` (drops malformed properties rather than failing the whole tool). `design_tools(actions)` caps input to 20 actions, builds the user message, calls `call_groq`, pulls `parsed["tools"]`, and returns a list of normalized `ProposedTool` objects. Overall, this file acts as the project's **AI-driven action-to-tool translator**.

---

## routes/scan.py

This file is the **main scanning API backend** of the project. It creates FastAPI routes `/scan`, `/scan/akaunting-demo`, `/scan/{project_id}`, and a legacy `/scan?id=...`. The POST routes insert a project row and schedule a background scan; the GET routes return the project row for the frontend's polling UI. The background `_run_scan()` function fetches a GitHub repo (or website), classifies the project type, ranks and trims source files into a token budget, calls Gemini to extract actions, then calls Groq to design tools — writing `current_step`, `fetch_progress`, `classification`, `detected_actions`, `proposed_tools`, `status`, and `error` after each step so the `/scan/[id]` UI sees live progress. Temporary locals include `files` (downloaded source), `actions` (Gemini output), `tools` (Groq output), `classification` (project type), `source_paths` (files selected for fetch), and `collected` (the materialised file contents). `_GITHUB_RE` decides whether to take the GitHub or website code path. Overall, this file acts as the **whole scan workflow engine**.

## routes/connection.py

This file is the **backend-connection tester route** of the project. Its job is to verify a user-supplied API base URL + auth credentials before AutoMCP commits to wiring the generated MCP against it, and persist the result in `backend_config`. It exposes `POST /api/test-connection`. The handler `test_connection(req)` validates that `apiBase` is non-empty and a real `http(s)://` URL, calls `apply_auth(...)` and `build_url(...)` to assemble a probe URL, then does a 15-second `httpx.get(probe_url)` against the base. The result is judged successful for 2xx, 3xx, or 4xx-with-`WWW-Authenticate` (which proves an auth server is there). Non-success builds a `TestConnectionResponse(ok=False, ...)` with a snippet for context; success calls `select_project` + `update_project` to merge the new `BackendConfig` (preserving any prior `tool_endpoints`) into the project row. Stored locals: `headers`/`query` from auth, `probe_url`, `res` (probe response), `prior_endpoints`, `merged` (the `BackendConfig` to persist). Overall, this file acts as the **handshake between AutoMCP and the user's real API**.

## routes/tools.py

This file is the **tool-design and tool-confirmation routes** module of the project. It exposes `POST /api/generate-tools` and `POST /api/confirmed-tools`. `generate_tools(req)` loads the project's `detected_actions`, validates them into `DetectedAction` objects, calls `design_tools(...)` to get clean MCP tool definitions, writes them into `proposed_tools`, and flips `status` to `"reviewing"`. `save_confirmed_tools(req)` simply persists the user's enable-toggles/edits from the `/confirm/[id]` UI into the `confirmed_tools` column. Locals: `actions` (parsed detected actions), `tools` (Groq output). Overall, this file acts as the **bridge between the scanner's raw detected actions and the user-curated tool list** that the generator will consume.

## routes/test_tools.py

This file is the **tool dry-run probe route** of the project. Its job is to attempt a safe probe against each enabled tool's configured endpoint (`/map/[id]` page) and decide whether to mark it passing — so AutoMCP can refuse to deploy a Worker against broken paths. It exposes `POST /api/test-tools`. It stores a regex `_PARAM_RE` that matches `:foo` and `{foo}` path placeholders; `_substitute_params(path)` replaces them with `"1"` so probes hit concrete URLs. `_probe(client, backend, endpoint)` calls `apply_auth` + `build_url`, then for GET tools issues a `GET`, and for write tools climbs a probe ladder `OPTIONS → HEAD → GET` (safer than actually `POST`ing). It treats 2xx/3xx, 401/403 (auth wall = endpoint exists), 4xx, and 405 as **passing**; 404 and 5xx as **failing**; produces a `ToolTestResult` with status, snippet, error, and `tested_at`. The route handler `test_tools(req)` loads the project, merges the new `tool_endpoints` into the saved `BackendConfig`, probes every enabled tool, and writes `tool_test_results` back to the DB. Overall, this file acts as the project's **pre-deploy safety net** that catches misconfigured endpoints.

## routes/generate.py

This file is the **MCP code-generation route** of the project. Its job is to render the deployable Worker source for a project — gated so it only runs when the project is ready. It exposes `POST /api/generate-mcp`. The handler `generate_mcp(req)` resolves the tool list with a body→confirmed→proposed fallback ladder, filters to `enabled` tools, and bails with `400` if the list is empty. For non-demo projects it additionally refuses to run unless `backend_config` is set AND every enabled tool has a passing `tool_test_results` entry (returning a precise error pointing the user back to `/connect/[id]` or `/map/[id]`). Builds `server_name = "mcp-<first 8 of project id>"`, materialises the saved `BackendConfig`, and calls `render_mcp_server(...)` with `mock=AKAUNTING_MOCK` only when `source_type == "akaunting_demo"`. Persists the rendered code into `generated_code` and flips `status` to `"generating"`. Returns the code so the frontend can preview it. Overall, this file acts as the **gatekeeper that decides "is this project actually deployable yet?"** and runs the renderer if so.

## routes/deploy.py

This file is the **Cloudflare deploy route** of the project. Its job is to push the previously-generated Worker code to Cloudflare Workers and persist the resulting public URL. It exposes `POST /api/deploy`. The handler `deploy(req)` loads the project, returns `404` if missing or `400` if there's no `generated_code` (you must call `/api/generate-mcp` first), and short-circuits to `400` with a clear message if Cloudflare env vars aren't all set (writing `status=failed` + `error` to the row for visibility). Builds `script_name = "mcp-<first 8 of project id>"`, calls `deploy_to_workers(...)`, and on any exception writes `status=failed` + `error` and raises `502`. On success writes `mcp_url` and `status=deployed` and returns the URL. Overall, this file acts as the project's **deploy trigger** — the last step in the user flow before the success page.

---

## scanner/classify.py

This file is the **project-type classifier** of the project. Its job is to look at a repo's file-path list and produce a `Classification(type, confidence, signals)` that's used as a hint in the Gemini extraction prompt. It's a pure function — no I/O, no state. `classify_project(file_paths)` builds a `path_set` for O(1) lookups, defines three helpers (`has`, `starts_with`, `includes`), then walks an explicit if/elif ladder: `composer.json` + Laravel markers → `"laravel"`; `composer.json` + WordPress markers → `"wordpress"`; bare `composer.json` → `"php"`; Python markers → `"django"`; `Gemfile` → `"rails"`; `package.json` + `next.config.*` or `app/`/`pages/` → `"next"`; bare `package.json` → `"express"`; only `.html` files → `"static"`; otherwise `"unknown"`. **Backend frameworks come first** — the comment in the file calls out that full-stack apps shipping `package.json` for frontend assets used to be mislabeled as `"next"`. Confidence is `min(1.0, len(signals) / 3)`. Overall, this file acts as the project's **lightweight first-pass framework detector**.

## scanner/filter.py

This file is the **source-file filtering and optimisation module** for the scanner system. Its job is to clean and reduce huge repositories into only the most relevant source files before sending them to AI models like Gemini. It stores filtering rules in `EXCLUDE_DIRS` (folders to ignore such as `node_modules`, `.git`, `dist`), `EXCLUDE_FILENAMES` (lock files), `INCLUDE_EXTENSIONS` (allowed programming file types), and budget limits `MAX_TOTAL_CHARS`, `MAX_PER_FILE_CHARS`, `MAX_FILES_TO_FETCH` to prevent memory overload and AI token overflow. The `SourceFile` NamedTuple stores each file's `path` and `content`. `filter_source_files()` removes unnecessary files, `rank_source_files()` prioritises API/backend-related files using `_RELEVANT_PATH_RE`, `_relevance()`, and path length, and `trim_to_budget()` ensures the final selected files stay within character/token limits before AI processing. Overall, this file acts as the project's **intelligent repository cleaner and optimiser** before scanning begins.

## scanner/github.py

This file is the **GitHub downloader/helper module** of the project. Its job is to connect to GitHub, read repository metadata, fetch the repository tree (all file paths), build raw GitHub file URLs, and download source code files asynchronously with retry + exponential backoff. It stores important temporary variables like `owner` and `repo` (parsed from the GitHub URL), `branch` (default branch name), `paths` (all repository file paths), `url` (raw GitHub file URL), `headers` (auth headers using `GITHUB_TOKEN`), `attempt` (retry count), `backoff_s` (retry wait time), `last_err` (last network error), and `res` (HTTP response object). The main functions are `parse_github_url()` which extracts repo info from a GitHub link, `fetch_repo_tree()` which gets all repository files, and `fetch_file()` which downloads file contents safely with retries and timeout handling. Overall, this file acts as the project's **GitHub scanning/fetching engine**.

## scanner/extract.py

This file is the **Gemini-powered action extractor** of the project. Its job is to send the project type + filtered source files to Gemini and get back a list of `DetectedAction` objects describing the user-facing endpoints the repo exposes. It stores a long `SYSTEM_PROMPT` that's word-for-word identical to the TypeScript port (so both backends produce the same output for the same input) — the rules force the model to emit canonical fields (`name`, `http_method`, `path` or `null`, `inputs`, `output_description`, `is_write`, `requires_auth`, `content_type`, `source_file`, `confidence`) and to *prefer null over a guessed path*. `extract_actions(project_type, files)` formats every file as a markdown code block, builds the user message, calls `call_gemini`, and maps each item through `_normalize_action`. `_normalize_action(a)` defensively normalises an LLM-returned dict: forces `confidence=0` when `path is None`, clamps confidence to 0-1, picks `content_type` from the two allowed values, builds `ActionInput` objects safely, and provides defaults for every missing field. Overall, this file acts as the **second half of the scan pipeline**, turning raw source code into structured action metadata that the tool designer can consume.

---

## test_clients.py

This file is a **Phase 2 smoke test** for the client wrappers. Its job is to make one live call to Gemini, one to Groq, and one to Supabase, confirming each integration is wired up correctly. Run from the `backend/` directory after `.env` is populated: `.venv/Scripts/python test_clients.py`. `test_gemini()` calls `call_gemini` asking for a JSON object with a `greeting` key, asserts the key exists, prints elapsed time. `test_groq()` does the same against Groq. (The Supabase check imports `get_supabase` and exercises a trivial query.) Useful as a one-shot post-setup confirmation.

## test_phase4.py

This file is a **Phase 4 acceptance test** — one self-contained unit test per module, no external services. It covers `backend_auth.auth` (basic/bearer/api-key header/query auth shapes), `generator.tool_designer` (`canonicalize_type` aliases, `_normalize_tool` defensiveness), and `generator.code_renderer` (the template substitution actually runs and produces a renderable string). Run with `.venv/Scripts/python test_phase4.py`. Use it after touching any of the pure-Python modules to catch regressions without burning API quota.

## test_scanner.py

This file is a **Phase 3 end-to-end smoke test** for the scanner. It points at a real GitHub repo (`gothinkster/node-express-realworld-example-app`), runs the full pipeline — `parse_github_url` → `fetch_repo_tree` → `classify_project` → `filter_source_files` → `rank_source_files` → concurrent `fetch_file` (`CONCURRENCY=12`) → `trim_to_budget` → `extract_actions` — and prints timing for each phase. Useful for catching regressions in the github fetcher, the filter rules, or the Gemini prompt. Costs one Gemini call per run.

---

## requirements.txt

This file pins the **Python runtime dependencies** for the backend: `fastapi==0.115.0`, `uvicorn[standard]==0.32.0`, `pydantic==2.9.2`, `pydantic-settings==2.5.2`, `httpx==0.27.2`, `google-genai==0.3.0`, `groq==0.11.0`, `PyGithub==2.4.0`, `supabase==2.8.1`, `python-dotenv==1.0.1`. Installed once into `.venv` with `pip install -r requirements.txt`. Pin versions are deliberate — `google-genai 0.3.0` has the `finish_reason` semantics the gemini wrapper depends on.

## Dockerfile

Containerises the backend for Railway / any Docker host. Listens on `$PORT` (Railway sets this). Build with `docker build -t automcp-backend .`, run with `docker run -e PORT=8000 -p 8000:8000 automcp-backend`.

## templates/mcp-server.ts.tmpl

The **Cloudflare Worker source template**. Not Python — it's TypeScript/JavaScript. `code_renderer.render_mcp_server(...)` reads it from disk and substitutes eight `{{...}}` placeholders to produce the deployed Worker. All MCP-over-HTTP plumbing (the JSON-RPC handshake, `tools/list`, `tools/call`) lives here; the Python side just injects project-specific JSON literals.
