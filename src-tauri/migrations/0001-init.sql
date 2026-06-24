-- Varta initial schema.
--
-- Design note: collections/folders/requests are relational (so the
-- sidebar tree, ordering, and joins are cheap queries), while each
-- request's params/headers/cookies/auth/body are stored as JSON text
-- columns rather than further normalized tables. That nested shape
-- changes often as the app grows (new auth types, new body modes) and is
-- always read/written whole — normalizing it would mean a migration for
-- every new field and a multi-table join to reassemble one request. This
-- mirrors the hybrid relational + document approach used by Insomnia and
-- Yaak's own SQLite-backed stores.

CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    parent_folder_id TEXT REFERENCES folders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    folder_id TEXT REFERENCES folders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    method TEXT NOT NULL,
    url TEXT NOT NULL,
    params_json TEXT NOT NULL DEFAULT '[]',
    headers_json TEXT NOT NULL DEFAULT '[]',
    cookies_json TEXT NOT NULL DEFAULT '[]',
    auth_json TEXT NOT NULL DEFAULT '{"type":"none"}',
    body_json TEXT NOT NULL DEFAULT '{"mode":"json","raw":""}',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS environments (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS environment_variables (
    id TEXT PRIMARY KEY,
    environment_id TEXT NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT NOT NULL DEFAULT '',
    enabled INTEGER NOT NULL DEFAULT 1,
    is_secret INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS history (
    id TEXT PRIMARY KEY,
    request_id TEXT,
    method TEXT NOT NULL,
    url TEXT NOT NULL,
    status INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    request_snapshot_json TEXT,
    response_snapshot_json TEXT
);

-- Singleton row (id always 1) holding the full settings blob as JSON —
-- simplest possible shape for a value that's always read/written whole
-- and has no relational structure of its own.
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS themes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_builtin INTEGER NOT NULL DEFAULT 0,
    tokens_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS plugins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    enabled INTEGER NOT NULL DEFAULT 1,
    install_path TEXT NOT NULL,
    manifest_json TEXT NOT NULL,
    installed_at TEXT NOT NULL
);

-- Singleton row tracking which workspace/environment/theme is currently
-- active, so the app can restore the user's place on next launch.
CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    active_workspace_id TEXT REFERENCES workspaces(id),
    active_environment_id TEXT REFERENCES environments(id),
    active_theme_id TEXT REFERENCES themes(id)
);

CREATE INDEX IF NOT EXISTS idx_collections_workspace ON collections(workspace_id);
CREATE INDEX IF NOT EXISTS idx_folders_collection ON folders(collection_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_requests_collection ON requests(collection_id);
CREATE INDEX IF NOT EXISTS idx_requests_folder ON requests(folder_id);
CREATE INDEX IF NOT EXISTS idx_environments_workspace ON environments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_envvars_environment ON environment_variables(environment_id);
CREATE INDEX IF NOT EXISTS idx_history_created ON history(created_at DESC);

-- Seed data: a default workspace, sane default settings, and the
-- Varta Dark theme as a built-in (non-deletable) baseline.
INSERT OR IGNORE INTO workspaces (id, name, created_at, updated_at)
VALUES ('default-workspace', 'My Workspace', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO settings (id, data_json)
VALUES (1, '{
  "followRedirects": true,
  "maxRedirects": 10,
  "verifySslCertificates": true,
  "timeoutMs": 30000,
  "userAgent": "Varta/0.1",
  "proxyUrl": null
}');

INSERT OR IGNORE INTO themes (id, name, is_builtin, tokens_json, created_at, updated_at)
VALUES ('varta-dark', 'Varta Dark', 1, '{
  "colorBg": "#0D1117",
  "colorPanel": "#161B22",
  "colorPanelRaised": "#1C2129",
  "colorBorder": "#30363D",
  "colorBorderMuted": "#21262D",
  "colorTextPrimary": "#E6EDF3",
  "colorTextSecondary": "#8B949E",
  "colorTextMuted": "#6E7681",
  "colorPrimary": "#8B5CF6",
  "colorPrimaryHover": "#9D74F8",
  "colorSecondary": "#3B82F6",
  "colorSuccess": "#10B981",
  "colorError": "#EF4444",
  "colorWarning": "#F59E0B",
  "radiusMd": "8px",
  "radiusLg": "10px",
  "fontSans": "Inter, ui-sans-serif, system-ui",
  "fontMono": "JetBrains Mono, ui-monospace, monospace"
}', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO app_state (id, active_workspace_id, active_environment_id, active_theme_id)
VALUES (1, 'default-workspace', NULL, 'varta-dark');
