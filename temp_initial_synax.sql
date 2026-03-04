-- Postgres schema bootstrap for PrintForm
-- Run on psql or any Postgres client; safe to re-run due to IF NOT EXISTS on extensions and tables.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- === Core tables ===

CREATE TABLE IF NOT EXISTS clients (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	name varchar(120) NOT NULL,
	printers jsonb NOT NULL DEFAULT '[]'::jsonb,
	selected_printer varchar(120),
	created_at timestamptz NOT NULL DEFAULT now(),
	last_seen_at timestamptz NOT NULL,
	status varchar(16) NOT NULL DEFAULT 'offline'
);

CREATE INDEX IF NOT EXISTS idx_clients_last_seen ON clients (last_seen_at);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients (name);

CREATE TABLE IF NOT EXISTS sessions (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
	alias varchar(80),
	created_at timestamptz NOT NULL DEFAULT now(),
	last_seen_at timestamptz NOT NULL,
	status varchar(16) NOT NULL DEFAULT 'active' -- active | closed | expired
);

CREATE INDEX IF NOT EXISTS idx_sessions_client ON sessions (client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_seen ON sessions (last_seen_at);

CREATE TABLE IF NOT EXISTS jobs (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
	target_client_id uuid REFERENCES clients(id),
	target_client_name varchar(120),
	original_name varchar(255) NOT NULL,
	stored_path text NOT NULL,
	size_bytes bigint NOT NULL,
	status varchar(16) NOT NULL,
	alias varchar(80),
	paper_size varchar(8) NOT NULL,
	copies int NOT NULL,
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_session ON jobs (session_id);
CREATE INDEX IF NOT EXISTS idx_jobs_target_client ON jobs (target_client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_desc ON jobs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_ready_pending ON jobs (status) WHERE status IN ('ready','pending');

CREATE TABLE IF NOT EXISTS events (
	id bigserial PRIMARY KEY,
	client_id uuid REFERENCES clients(id),
	session_id uuid REFERENCES sessions(id),
	job_id uuid REFERENCES jobs(id),
	type varchar(32) NOT NULL,
	payload jsonb NOT NULL,
	created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_type_created ON events (type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_client_created ON events (client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_job ON events (job_id);

-- === Optional / future ===

CREATE TABLE IF NOT EXISTS users (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	email varchar(255) UNIQUE,
	password_hash text,
	role varchar(32),
	created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS api_keys (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
	key_hash text UNIQUE,
	created_at timestamptz DEFAULT now(),
	last_used_at timestamptz
);

CREATE TABLE IF NOT EXISTS audit_logs (
	id bigserial PRIMARY KEY,
	actor_type varchar(32), -- user | client | system
	actor_id uuid,
	action varchar(64), -- job.status.change, session.close, client.register, quota.block
	target_type varchar(32), -- job | session | client
	target_id uuid,
	detail jsonb,
	created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS storage_usage (
	id boolean PRIMARY KEY DEFAULT true,
	total_bytes bigint NOT NULL DEFAULT 0,
	file_count bigint NOT NULL DEFAULT 0,
	computed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS websocket_subscriptions (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	client_id uuid REFERENCES clients(id),
	user_id uuid REFERENCES users(id),
	channel varchar(64) NOT NULL,
	connected_at timestamptz NOT NULL DEFAULT now()
);

-- View or materialized view for active storage can be added later.
