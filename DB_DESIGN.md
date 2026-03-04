# Database Design

Target: Postgres (can map to MySQL if needed). Core tables cover clients, sessions, jobs, and event log. Optional tables prepare for auth, quota, and audit in later phases.

## Core Tables

- **clients**
	- id (uuid, pk)
	- name (varchar(120), not null)
	- printers (jsonb array of string, not null default [])
	- selected_printer (varchar(120), null)
	- created_at (timestamptz, not null default now())
	- last_seen_at (timestamptz, not null)
	- status (varchar(16), not null, computed from heartbeat; can store cached state)
	- indexes: (last_seen_at), (name)

- **sessions**
	- id (uuid, pk)
	- client_id (uuid, fk -> clients.id, on delete cascade)
	- alias (varchar(80), null)
	- created_at (timestamptz, not null default now())
	- last_seen_at (timestamptz, not null)
	- status (varchar(16), not null default 'active') -- active | closed | expired
	- indexes: (client_id), (last_seen_at)

- **jobs**
	- id (uuid, pk)
	- session_id (uuid, fk -> sessions.id, on delete cascade)
	- target_client_id (uuid, fk -> clients.id)
	- target_client_name (varchar(120), snapshot)
	- original_name (varchar(255), not null)
	- stored_path (text, not null) -- filesystem path; for future object storage store key/url
	- size_bytes (bigint, not null)
	- status (varchar(16), not null) -- ready | printing | done | pending | failed | rejected | canceled | send
	- alias (varchar(80), null)
	- paper_size (varchar(8), not null)
	- copies (int, not null)
	- created_at (timestamptz, not null default now())
	- updated_at (timestamptz, not null default now())
	- indexes: (session_id), (target_client_id), (status), (created_at desc)

- **events** (for ping and status changes)
	- id (bigserial, pk)
	- client_id (uuid, fk -> clients.id, null)
	- session_id (uuid, fk -> sessions.id, null)
	- job_id (uuid, fk -> jobs.id, null)
	- type (varchar(32), not null) -- ping | job_status | heartbeat | quota
	- payload (jsonb, not null)
	- created_at (timestamptz, not null default now())
	- indexes: (type, created_at desc), (client_id, created_at desc), (job_id)

## Optional / Future Tables

- **users** (for auth/JWT)
	- id (uuid, pk)
	- email (varchar(255), unique)
	- password_hash (text)
	- role (varchar(32))
	- created_at (timestamptz)

- **api_keys** (for print clients)
	- id (uuid, pk)
	- client_id (uuid, fk -> clients.id)
	- key_hash (text, unique)
	- created_at (timestamptz)
	- last_used_at (timestamptz)

- **audit_logs**
	- id (bigserial, pk)
	- actor_type (varchar(32)) -- user | client | system
	- actor_id (uuid, null)
	- action (varchar(64)) -- job.status.change, session.close, client.register, quota.block
	- target_type (varchar(32)) -- job | session | client
	- target_id (uuid)
	- detail (jsonb)
	- created_at (timestamptz)

- **storage_usage** (denormalized snapshot for 1GB limit)
	- id (bool pk or singleton)
	- total_bytes (bigint)
	- file_count (bigint)
	- computed_at (timestamptz)

- **websocket_subscriptions** (if needed for presence)
	- id (uuid, pk)
	- client_id (uuid, fk -> clients.id, null)
	- user_id (uuid, fk -> users.id, null)
	- channel (varchar(64))
	- connected_at (timestamptz)

## Notes on Quota (1GB)

- Compute size from jobs.size_bytes sum where status in (ready, printing, pending, send) and files exist.
- On upload: check cached usage (storage_usage) and recalc periodically; block with message "Antrian server penuh" when projected total exceeds limit.

## Indexing and Partitions

- Consider partitioning **events** by month for cleanup.
- Add partial index on jobs where status in ('ready','pending') to speed up queue queries.

## Migration Approach

- Start with core tables (clients, sessions, jobs, events).
- Backfill from existing JSON by reading files and inserting.
- Keep feature flag to choose JSON vs DB repositories during transition.
