--
-- PostgreSQL database dump
--

\restrict van7OPWFzi7raG6wmGctXkuIUgntkte3cAjbaT8o37GOkCbYi49UzTNWIdz4tzi

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.api_keys (
    id text NOT NULL,
    client_id text,
    key_hash text,
    created_at timestamp with time zone DEFAULT now(),
    last_used_at timestamp with time zone
);


ALTER TABLE public.api_keys OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    actor_type character varying(32),
    actor_id text,
    action character varying(64),
    target_type character varying(32),
    target_id text,
    detail jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id text NOT NULL,
    name character varying(120) NOT NULL,
    printers jsonb DEFAULT '[]'::jsonb NOT NULL,
    selected_printer character varying(120),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_seen_at timestamp with time zone NOT NULL,
    status character varying(16) DEFAULT 'offline'::character varying NOT NULL,
    owner_user_id text
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id bigint NOT NULL,
    client_id text,
    session_id text,
    job_id text,
    type character varying(32) NOT NULL,
    payload jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_id_seq OWNER TO postgres;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id text NOT NULL,
    session_id text NOT NULL,
    original_name character varying(255) NOT NULL,
    stored_path text NOT NULL,
    size_bytes bigint NOT NULL,
    status character varying(16) NOT NULL,
    alias character varying(80),
    paper_size character varying(8) NOT NULL,
    copies integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    owner_user_id text,
    claimed_by_client_id text,
    claimed_at timestamp with time zone
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    user_id text NOT NULL,
    token_hash text NOT NULL,
    user_agent text,
    ip_address text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    replaced_by_token_id text
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    client_id text NOT NULL,
    alias character varying(80),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_seen_at timestamp with time zone NOT NULL,
    status character varying(16) DEFAULT 'active'::character varying NOT NULL,
    owner_user_id text
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: storage_usage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.storage_usage (
    id boolean DEFAULT true NOT NULL,
    total_bytes bigint DEFAULT 0 NOT NULL,
    file_count bigint DEFAULT 0 NOT NULL,
    computed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.storage_usage OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email character varying(255),
    password_hash text,
    role character varying(32),
    created_at timestamp with time zone DEFAULT now(),
    username character varying(64),
    pin_hash text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: websocket_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.websocket_subscriptions (
    id text NOT NULL,
    client_id text,
    user_id text,
    channel character varying(64) NOT NULL,
    connected_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.websocket_subscriptions OWNER TO postgres;

--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.api_keys (id, client_id, key_hash, created_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, actor_type, actor_id, action, target_type, target_id, detail, created_at) FROM stdin;
5000	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	auth.register	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	{"role": "admin", "email": null, "username": "shiroko"}	2026-03-15 23:03:08.118445+08
5001	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	auth.logout	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	{"revokedCount": 1}	2026-03-15 23:03:13.853891+08
5002	user	user_c390f862-a82d-41ad-92af-7356235697a1	auth.register	user	user_c390f862-a82d-41ad-92af-7356235697a1	{"role": "user", "email": null, "username": "yefta"}	2026-03-15 23:03:20.498048+08
5003	client	\N	client.registered	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:04:56.491238+08
5004	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:05:01.561047+08
5005	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:05:06.564582+08
5006	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:05:11.570356+08
5007	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:05:16.554078+08
5008	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:05:21.559702+08
5009	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:05:26.543072+08
5010	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:05:30.449003+08
5011	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.paired	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"identifier": "shiroko", "handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "nextOwnerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "previousOwnerUserId": null}	2026-03-15 23:05:31.329617+08
5012	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:05:31.362504+08
5013	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:05:31.562115+08
5014	system	\N	session.created	session	session_1773587133548_hqbl5n	{"alias": "Shiroko", "clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "targetSource": "kiosk", "availabilitySource": "realtime-connected"}	2026-03-15 23:05:33.558127+08
5015	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:05:36.655+08
5016	system	\N	job.created	job	job_1773587139731_5qw1qk	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773587133548_hqbl5n", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "originalName": "Standard Sim Racing PC Build.pdf"}	2026-03-15 23:05:39.742532+08
5017	system	\N	job.cloned	job	job_1773587141379_qgpusr	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773587133548_hqbl5n", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "sourceJobId": "job_1773587139731_5qw1qk"}	2026-03-15 23:05:41.394814+08
5018	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:05:41.570242+08
5019	system	\N	job.cloned	job	job_1773587141872_giu6v9	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773587133548_hqbl5n", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "sourceJobId": "job_1773587141379_qgpusr"}	2026-03-15 23:05:41.886833+08
5020	system	\N	job.cloned	job	job_1773587142199_8scn0g	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773587133548_hqbl5n", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "sourceJobId": "job_1773587141872_giu6v9"}	2026-03-15 23:05:42.213608+08
5021	system	\N	job.cloned	job	job_1773587142508_ntlk5i	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773587133548_hqbl5n", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "sourceJobId": "job_1773587142199_8scn0g"}	2026-03-15 23:05:42.548584+08
5022	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:05:46.588113+08
5023	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:05:51.566607+08
5024	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:05:56.547249+08
5025	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:06:01.646375+08
5026	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:06:06.564404+08
5027	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:06:11.590645+08
5028	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:06:16.568562+08
5029	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:06:21.588493+08
5030	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:06:26.53844+08
5031	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:06:31.5646+08
5032	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:06:36.562338+08
5033	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:06:41.558088+08
5034	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	job.status.changed	job	job_1773587142199_8scn0g	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773587133548_hqbl5n", "nextStatus": "rejected", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "previousStatus": "ready", "requestClientId": null, "claimedByClientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7"}	2026-03-15 23:06:45.238977+08
5035	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:06:46.581097+08
5036	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:06:51.561961+08
5037	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:06:56.538994+08
5038	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:07:01.661891+08
5039	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:07:06.56095+08
5040	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:07:11.557801+08
5041	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:07:16.562724+08
5042	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:07:21.590765+08
5043	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:07:26.540815+08
5044	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:07:31.548326+08
5045	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:07:36.55532+08
5046	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:07:41.562709+08
5047	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:07:46.557454+08
5048	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:07:51.551804+08
5049	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:07:56.541888+08
5050	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:08:01.565793+08
5051	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:08:06.556392+08
5052	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:08:11.560448+08
5053	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:08:16.56595+08
5054	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:08:21.560695+08
5055	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:08:26.546969+08
5056	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:08:26.582955+08
5057	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:08:31.575855+08
5058	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:08:36.569746+08
5059	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:08:41.570306+08
5060	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:08:46.571738+08
5061	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:08:51.638567+08
5062	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:08:56.540397+08
5063	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:08:56.574049+08
5064	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:09:01.578+08
5065	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:09:06.684973+08
5066	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:09:11.579261+08
5067	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:09:16.570026+08
5068	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:09:21.580564+08
5069	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:09:26.53815+08
5070	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:09:26.567812+08
5071	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:09:31.570589+08
5072	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:09:36.570545+08
5073	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:09:41.567976+08
5074	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:09:46.584229+08
5075	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:09:51.58014+08
5076	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:09:56.538252+08
5077	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:09:56.572216+08
5078	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:10:01.590183+08
5079	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:10:06.569167+08
5080	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:10:11.578147+08
5081	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:10:16.567865+08
5082	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:10:21.588753+08
5083	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:10:26.543088+08
5084	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:10:26.577484+08
5085	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:10:31.575246+08
5086	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:10:36.576804+08
5087	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:10:41.571738+08
5088	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:10:46.57446+08
5089	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:10:51.580797+08
5090	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:10:56.538178+08
5091	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:10:56.584844+08
5092	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:11:01.579648+08
5093	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:11:06.577277+08
5094	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:11:11.571939+08
5095	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:11:16.565886+08
5096	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:11:21.576672+08
5097	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:11:26.542027+08
5098	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:11:26.574439+08
5099	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:11:31.575355+08
5100	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:11:36.565897+08
5101	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:11:41.58394+08
5102	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:11:46.576882+08
5103	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:11:51.566477+08
5104	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:11:56.560475+08
5105	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:12:01.5763+08
5106	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:12:06.579942+08
5107	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:12:11.564105+08
5108	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:12:16.567394+08
5109	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:12:21.571009+08
5110	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:12:26.532068+08
5111	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:12:26.568906+08
5112	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:12:31.57035+08
5113	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:12:36.565052+08
5114	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:12:41.612879+08
5115	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:12:46.578083+08
5116	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:12:51.581726+08
5117	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:12:56.548034+08
5118	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:12:56.586178+08
5119	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:13:01.588357+08
5120	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:13:06.593662+08
5121	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:13:11.638332+08
5122	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:13:16.594097+08
5123	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:13:21.601118+08
5124	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:13:26.537938+08
5125	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:13:26.587273+08
5126	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:13:31.587265+08
5127	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:13:36.585661+08
5128	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:13:41.595556+08
5129	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:13:46.585165+08
5130	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:13:51.595889+08
5131	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:13:56.545307+08
5132	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:13:56.631734+08
5133	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:14:01.604027+08
5134	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:14:06.597391+08
5135	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:14:11.605322+08
5136	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:14:16.605905+08
5137	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:14:21.605156+08
5138	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:14:26.538238+08
5139	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:14:26.602052+08
5140	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:14:31.593692+08
5141	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:14:36.743894+08
5142	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:14:41.605434+08
5143	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:14:46.605329+08
5144	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:14:51.601759+08
5145	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:14:56.531354+08
5146	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:14:56.59627+08
5147	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:15:01.606961+08
5148	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:15:06.607689+08
5149	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:15:11.607934+08
5150	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:15:16.601042+08
5151	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:15:21.607015+08
5152	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:15:26.556778+08
5153	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:15:26.720301+08
5154	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:15:31.594903+08
5155	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:15:36.621153+08
5156	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:15:41.59745+08
5157	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:15:46.599644+08
5158	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:15:51.620483+08
5159	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:15:56.543807+08
5160	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:15:56.610074+08
5161	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:16:01.608763+08
5162	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:16:06.608139+08
5163	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:16:11.629407+08
5164	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:16:16.611121+08
5165	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:16:21.627322+08
5166	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:16:26.538319+08
5167	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:16:26.619155+08
5168	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:16:31.608681+08
5169	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:16:36.614281+08
5170	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:16:41.632709+08
5171	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:16:46.622806+08
5172	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:16:51.614169+08
5173	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:16:56.547089+08
5174	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:16:56.62238+08
5175	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:17:01.621787+08
5176	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:17:06.621198+08
5177	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:17:11.617072+08
5178	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:17:16.613823+08
5179	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:17:21.627351+08
5180	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:17:26.535325+08
5181	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:17:26.618508+08
5182	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:17:31.61821+08
5183	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:17:36.621705+08
5184	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	auth.refresh	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	{"nextRefreshTokenId": "rt_72d12eab-7880-4043-a26c-905cf6bc7463", "previousRefreshTokenId": "rt_a68705f7-9b2b-44f1-b707-aef5c982ece1"}	2026-03-15 23:23:16.265547+08
5185	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:23:16.427756+08
5186	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:23:21.544147+08
5187	system	\N	session.created	session	session_1773588204485_z3c2jf	{"alias": "Shiroko", "clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "targetSource": "kiosk", "availabilitySource": "realtime-connected"}	2026-03-15 23:23:24.516463+08
5188	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:23:26.527249+08
5189	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:23:31.537225+08
5190	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:23:36.469962+08
5191	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:23:41.468176+08
5192	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:23:46.63464+08
5193	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:23:51.46101+08
5194	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:23:56.482665+08
5195	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:24:01.501114+08
5196	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:24:06.49508+08
5197	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:24:11.499925+08
5198	user	user_c390f862-a82d-41ad-92af-7356235697a1	auth.refresh	user	user_c390f862-a82d-41ad-92af-7356235697a1	{"nextRefreshTokenId": "rt_50e110c7-fb56-45b5-b383-679c2f806ae2", "previousRefreshTokenId": "rt_f3fa11c6-c84f-4b02-bb05-ba32ad2050e3"}	2026-03-15 23:24:13.044356+08
5199	user	user_c390f862-a82d-41ad-92af-7356235697a1	auth.logout	user	user_c390f862-a82d-41ad-92af-7356235697a1	{"revokedCount": 1}	2026-03-15 23:24:14.405106+08
5200	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:24:16.462426+08
5892	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:47:36.611732+08
5201	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:24:16.510144+08
5202	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	auth.login	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	{"identifier": "shiroko"}	2026-03-15 23:24:22.720024+08
5203	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:24:22.792524+08
5204	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:24:26.486001+08
5205	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:24:31.498384+08
5206	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:24:36.493872+08
5207	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:24:41.52133+08
5208	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:24:46.461782+08
5209	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:24:46.834852+08
5210	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:24:51.516993+08
5211	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:24:56.515296+08
5212	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:25:01.531782+08
5213	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:25:06.52665+08
5214	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:25:11.512568+08
5215	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:25:16.468868+08
5216	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:25:16.516669+08
5217	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:25:21.521798+08
5218	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:25:26.511495+08
5219	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:25:31.513013+08
5220	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:25:36.510643+08
5221	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:25:41.533015+08
5222	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:25:46.472027+08
5223	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:25:46.505052+08
5224	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:25:51.512848+08
5225	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:25:56.525574+08
5226	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:26:01.515141+08
5227	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:26:06.511213+08
5228	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:26:11.5117+08
5229	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:26:16.504246+08
5230	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:26:21.516322+08
5231	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:26:26.505792+08
5232	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:26:31.547913+08
5233	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:26:36.510427+08
5234	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:26:41.850265+08
6106	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:54:16.658221+08
5235	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:26:46.488715+08
6228	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:58:11.72209+08
6229	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:58:14.838639+08
6230	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:58:16.713892+08
6231	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:58:19.907491+08
6232	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:58:21.709524+08
6233	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:58:24.854866+08
6234	user	user_decb07e3-290e-4880-bbb4-d4507a370982	auth.refresh	user	user_decb07e3-290e-4880-bbb4-d4507a370982	{"nextRefreshTokenId": "rt_c742412f-e812-4ee6-9873-503c0ac5a12c", "previousRefreshTokenId": "rt_0e62be13-4cc2-4231-bc04-05f80bf8bc99"}	2026-03-19 19:58:25.371163+08
6235	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.unbound	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "previousOwnerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982"}	2026-03-19 19:58:25.460962+08
6236	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:58:26.714534+08
6237	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:58:29.891885+08
6238	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.unbound	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "previousOwnerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982"}	2026-03-19 19:58:31.031777+08
6239	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:58:31.719584+08
6240	system	\N	session.closed	session	session_1773921470578_mcf6ch	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "removedJobs": 1}	2026-03-19 19:58:33.477298+08
6242	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:58:36.605856+08
6243	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:58:36.735828+08
6273	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:38:39.308127+08
6274	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:38:44.472223+08
6275	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:38:49.336541+08
6276	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:38:54.315284+08
6277	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:38:59.312266+08
6278	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:39:04.31167+08
6309	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:41:39.307477+08
6333	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:43:39.322813+08
6334	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:43:44.329753+08
6335	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:43:49.333241+08
6336	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:43:54.327938+08
6337	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:43:59.330398+08
6338	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:44:04.306102+08
6363	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:46:09.436745+08
6364	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:46:14.328044+08
6365	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:46:19.369382+08
6366	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:46:24.322528+08
5236	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:26:51.880984+08
5237	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:26:56.521034+08
5238	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:27:01.59752+08
5239	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:27:06.653881+08
5240	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:27:11.515663+08
5241	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	auth.refresh	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	{"nextRefreshTokenId": "rt_cd488f50-3fbe-4a35-b6ac-3e080996b485", "previousRefreshTokenId": "rt_72d12eab-7880-4043-a26c-905cf6bc7463"}	2026-03-15 23:27:30.094034+08
5242	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:27:30.292552+08
5243	system	\N	session.created	session	session_1773588451038_be308c	{"alias": "Shiroko", "clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "targetSource": "kiosk", "availabilitySource": "realtime-connected"}	2026-03-15 23:27:31.04429+08
5244	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:27:35.390436+08
5245	system	\N	session.closed	session	session_1773588451038_be308c	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "removedJobs": 0}	2026-03-15 23:27:36.308361+08
5246	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:27:40.341353+08
5247	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:27:45.355041+08
5248	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:27:50.352624+08
5249	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:27:55.338102+08
5250	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:28:00.34506+08
5251	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:28:05.354208+08
5252	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:28:10.352514+08
5253	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:28:15.334861+08
5254	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:28:20.340417+08
5255	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:28:25.337702+08
5256	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:28:30.338975+08
5257	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:28:35.360726+08
5258	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:28:40.335939+08
5259	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:28:45.34078+08
5260	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:28:50.487982+08
5261	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:28:55.497206+08
5262	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:29:00.52336+08
5263	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:29:05.519099+08
5264	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:29:10.340186+08
5265	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:29:15.338369+08
5266	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:29:20.377246+08
5267	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:29:25.344198+08
5268	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:29:30.373602+08
5269	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:29:35.348617+08
5270	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:29:40.349804+08
5271	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:29:45.347282+08
5272	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:29:50.939066+08
5273	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:29:55.342906+08
5274	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:30:00.346661+08
5275	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:30:05.388663+08
5276	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:30:10.34221+08
5277	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:30:15.347269+08
5278	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:30:20.347821+08
5279	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:30:25.337916+08
5280	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:30:30.352433+08
5281	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:30:35.5953+08
5282	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:30:40.353222+08
5283	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:30:45.335195+08
5284	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:30:50.358183+08
5285	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:30:55.345619+08
5286	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:31:00.351844+08
5287	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:31:05.384919+08
5288	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:31:10.340049+08
5289	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:31:15.344573+08
5290	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:31:20.349166+08
5291	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:31:25.351142+08
5292	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:31:30.335411+08
5293	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:31:30.365743+08
5294	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:31:35.36668+08
5295	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:31:40.373235+08
5296	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:31:45.361127+08
5297	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:31:50.35981+08
5298	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:31:55.357033+08
5299	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:32:00.381893+08
5300	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:32:05.425386+08
5301	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:32:10.357236+08
5302	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:32:15.41254+08
5303	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:32:20.351238+08
5304	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:32:25.371514+08
5305	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:32:30.352343+08
5306	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:32:35.387627+08
5307	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:32:40.379744+08
5308	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:32:45.391404+08
5309	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:32:50.374363+08
5310	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:32:55.370534+08
5311	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:33:00.353189+08
5312	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:33:00.564782+08
5313	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:33:05.381588+08
5314	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:33:10.527881+08
5315	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:33:15.465992+08
5316	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:33:20.394303+08
5317	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:33:25.370088+08
5318	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:33:30.369422+08
5319	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:33:35.541106+08
5320	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:33:40.406056+08
5321	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:33:45.367267+08
5322	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:33:50.42831+08
5323	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:33:55.378362+08
5324	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:34:00.33875+08
5325	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:34:00.382293+08
5326	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:34:05.371562+08
5327	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:34:10.378202+08
5328	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:34:15.572372+08
5329	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:34:20.381678+08
5330	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:34:25.902223+08
5331	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:34:30.342173+08
5332	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:34:30.378071+08
5333	system	\N	session.closed	session	session_1773588451038_be308c	{"clientId": null, "ownerUserId": null, "removedJobs": 0}	2026-03-15 23:34:32.494339+08
5334	system	\N	session.created	session	session_1773588874042_fhgnew	{"alias": "Shiroko", "clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "targetSource": "kiosk", "availabilitySource": "realtime-connected"}	2026-03-15 23:34:34.049212+08
5335	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:34:35.402049+08
5336	system	\N	job.created	job	job_1773588879511_5lq7w3	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773588874042_fhgnew", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "originalName": "Standard Sim Racing PC Build.pdf"}	2026-03-15 23:34:39.53528+08
5337	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:34:40.562164+08
5338	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:34:45.370013+08
5339	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:34:50.394619+08
5342	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:35:05.412906+08
5343	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:35:10.36865+08
6241	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:58:34.865286+08
6244	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:58:41.713125+08
6245	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:58:46.694044+08
6246	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:58:51.72234+08
6247	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:58:56.724496+08
6249	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:59:06.620478+08
6250	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:59:06.715404+08
6251	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:59:11.7316+08
6279	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:39:09.309086+08
6280	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:39:14.338644+08
6314	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:42:04.335657+08
6339	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:44:09.324587+08
6340	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:44:14.327178+08
6341	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:44:19.331056+08
6342	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:44:24.315675+08
6343	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:44:29.331965+08
6344	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:44:34.315254+08
6346	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:44:44.325081+08
6348	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:44:54.327637+08
6349	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:44:59.337248+08
6350	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:45:04.302968+08
6367	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:46:29.325292+08
6368	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:46:34.302739+08
6384	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:47:49.327067+08
6385	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:47:54.318821+08
6395	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:48:39.322891+08
6396	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:48:44.325329+08
6397	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:48:49.335053+08
6398	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:48:54.327526+08
6399	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:48:59.328346+08
5340	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:34:55.379513+08
5341	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:35:00.365936+08
5344	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:35:15.369838+08
5345	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:35:20.390648+08
5346	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:35:25.385182+08
5347	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:35:30.350999+08
5348	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:35:30.557578+08
5349	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:35:35.393883+08
5350	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:35:40.397153+08
5351	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:35:45.458897+08
5352	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:35:50.39155+08
5353	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:35:55.397481+08
5354	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:36:00.348643+08
5355	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:36:00.544837+08
5356	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:36:05.393941+08
5357	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:36:10.397466+08
5358	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:36:15.40231+08
5359	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:36:20.392918+08
5360	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:36:25.382711+08
5361	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:36:30.354736+08
5362	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:36:30.448149+08
5363	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:36:35.403834+08
5364	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:36:40.661954+08
5365	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:36:45.386555+08
5366	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:36:50.404707+08
5367	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:36:55.431933+08
5368	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:37:00.348945+08
5369	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:37:05.397517+08
5370	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:37:10.40534+08
5371	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:37:15.405169+08
5372	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:37:20.39982+08
5373	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:37:25.39865+08
5374	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:37:30.396719+08
5375	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:37:35.460202+08
5376	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:37:40.40962+08
5377	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:37:45.404718+08
5378	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:37:50.412157+08
5379	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:37:55.775337+08
5380	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:38:00.39573+08
5381	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:38:05.409714+08
5382	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:38:10.395356+08
5383	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:38:15.401623+08
5384	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:38:20.408711+08
5385	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:38:25.411149+08
5386	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:38:30.346173+08
5387	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:38:30.51146+08
5388	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:38:35.418433+08
5389	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:38:40.436273+08
5390	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:38:45.40839+08
5391	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:38:50.441988+08
5392	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:38:55.482297+08
5393	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:39:00.352979+08
5394	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:39:00.551547+08
5395	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:39:05.394702+08
5396	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:39:10.397499+08
5397	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:39:15.423885+08
5398	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:39:20.543719+08
5399	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:39:25.424404+08
5400	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:39:30.377348+08
5401	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:39:35.403665+08
5402	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:39:40.396947+08
5403	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:39:45.459869+08
5404	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:39:50.59593+08
5405	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:39:55.432119+08
5406	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:40:00.342081+08
5407	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:40:00.397515+08
5408	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:40:05.434591+08
5409	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:40:10.404806+08
5410	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:40:15.473107+08
5411	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:40:20.61165+08
5412	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:40:25.407522+08
5413	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:40:30.336393+08
5414	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:40:30.409045+08
5415	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:40:35.408502+08
5416	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:40:40.563657+08
5417	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:40:45.609639+08
5418	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:40:50.416712+08
5419	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:40:55.406707+08
5420	system	\N	session.created	session	session_1773589256784_5v8f1i	{"alias": "Shiroko", "clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "targetSource": "kiosk", "availabilitySource": "realtime-connected"}	2026-03-15 23:40:56.79258+08
5421	system	\N	session.created	session	session_1773589257984_6n6afn	{"alias": "Shiroko", "clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "targetSource": "kiosk", "availabilitySource": "realtime-connected"}	2026-03-15 23:40:57.990765+08
5422	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:41:00.454309+08
5423	system	\N	session.closed	session	session_1773589256784_5v8f1i	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "removedJobs": 0}	2026-03-15 23:41:05.278135+08
5424	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:41:05.410426+08
5425	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:41:10.416009+08
5426	system	\N	session.created	session	session_1773589272079_o0hwsm	{"alias": "WOng", "clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "targetSource": "kiosk", "availabilitySource": "realtime-connected"}	2026-03-15 23:41:12.084734+08
5427	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:41:15.404992+08
5428	system	\N	job.created	job	job_1773589275666_3pxd37	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773589257984_6n6afn", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "originalName": "Standard Sim Racing PC Build.pdf"}	2026-03-15 23:41:15.6803+08
5429	system	\N	job.cloned	job	job_1773589277198_kid1ie	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773589257984_6n6afn", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "sourceJobId": "job_1773589275666_3pxd37"}	2026-03-15 23:41:17.213489+08
5430	system	\N	job.cloned	job	job_1773589278996_k5dtin	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773589257984_6n6afn", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "sourceJobId": "job_1773589277198_kid1ie"}	2026-03-15 23:41:19.009601+08
5431	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:41:20.518156+08
5432	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:41:25.402219+08
5433	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:41:30.36675+08
5434	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:41:30.49653+08
5435	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:41:35.472391+08
5436	system	\N	job.created	job	job_1773589299749_of14g0	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773589272079_o0hwsm", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "originalName": "Ready2Race PC Setup.pdf"}	2026-03-15 23:41:39.758962+08
5437	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:41:40.412478+08
5438	system	\N	job.cloned	job	job_1773589301087_aokzmy	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773589272079_o0hwsm", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "sourceJobId": "job_1773589299749_of14g0"}	2026-03-15 23:41:41.10828+08
5439	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:41:45.400777+08
5440	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:41:50.409254+08
5441	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:41:55.394735+08
5442	system	\N	job.status.changed	job	job_1773589299749_of14g0	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773589272079_o0hwsm", "nextStatus": "canceled", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "previousStatus": "ready", "requestClientId": null, "claimedByClientId": null}	2026-03-15 23:41:56.568808+08
5443	system	\N	job.status.changed	job	job_1773589301087_aokzmy	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773589272079_o0hwsm", "nextStatus": "canceled", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "previousStatus": "ready", "requestClientId": null, "claimedByClientId": null}	2026-03-15 23:42:00.022356+08
5444	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:42:00.477971+08
5445	system	\N	job.status.changed	job	job_1773589278996_k5dtin	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773589257984_6n6afn", "nextStatus": "canceled", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "previousStatus": "ready", "requestClientId": null, "claimedByClientId": null}	2026-03-15 23:42:02.726511+08
5446	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:42:05.39734+08
5447	system	\N	session.closed	session	session_1773589257984_6n6afn	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "removedJobs": 3}	2026-03-15 23:42:10.243516+08
5448	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:42:10.568289+08
5449	system	\N	session.closed	session	session_1773589272079_o0hwsm	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "removedJobs": 2}	2026-03-15 23:42:12.440755+08
5450	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:42:15.420525+08
5451	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:42:20.430897+08
5452	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:42:25.423174+08
5453	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	auth.refresh	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	{"nextRefreshTokenId": "rt_f5ce6fe0-8a40-4640-a5e7-1c93afe41d28", "previousRefreshTokenId": "rt_cd488f50-3fbe-4a35-b6ac-3e080996b485"}	2026-03-15 23:42:30.399289+08
5454	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:42:30.44852+08
5455	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	auth.refresh	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	{"nextRefreshTokenId": "rt_b68bbf26-bc30-4f4a-ad06-ca8d682a4c1c", "previousRefreshTokenId": "rt_f5ce6fe0-8a40-4640-a5e7-1c93afe41d28"}	2026-03-15 23:42:30.484792+08
5456	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:42:35.412635+08
5457	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:42:40.432133+08
5458	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:42:45.414643+08
5459	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:42:50.433402+08
5460	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:42:55.481219+08
5461	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:43:00.338194+08
5462	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:43:00.420908+08
5463	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:43:05.431127+08
5464	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:43:10.411101+08
5465	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:43:15.425716+08
5466	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:43:20.421022+08
5467	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:43:25.419711+08
5468	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:43:30.345426+08
5469	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:43:30.417979+08
5470	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:43:35.455764+08
5471	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:43:40.415468+08
5472	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:43:45.466561+08
5473	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:43:50.429686+08
5474	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:43:55.429049+08
5475	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:44:00.332028+08
5476	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:44:00.408729+08
5477	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:44:05.413437+08
5478	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:44:10.429088+08
5479	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:44:15.489513+08
5480	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:44:20.431099+08
5481	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:44:25.41785+08
5482	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:44:30.342438+08
5483	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:44:30.415503+08
5484	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:44:35.413322+08
5485	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:44:40.439849+08
5486	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:44:45.427627+08
5487	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:44:50.442684+08
5488	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:44:55.442161+08
5489	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:45:00.353805+08
5490	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:45:00.411892+08
5491	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:45:05.439157+08
5492	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:45:10.41334+08
5493	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:45:15.414575+08
5494	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:45:20.562547+08
5495	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:45:25.438738+08
5496	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:45:30.368402+08
5497	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:45:30.428028+08
5498	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:45:35.438806+08
5499	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:45:40.440946+08
5500	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:45:45.430898+08
5501	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:45:50.438936+08
5502	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:45:55.439067+08
5503	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:46:00.386783+08
5504	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:46:00.428508+08
5505	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:46:05.488065+08
5506	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:46:10.470703+08
5507	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:46:15.437609+08
5508	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:46:20.447637+08
5509	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:46:25.557115+08
5510	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:46:30.372856+08
5511	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:46:30.44471+08
5512	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:46:35.516263+08
5513	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:46:40.43844+08
5514	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:46:45.471817+08
5515	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:46:50.433577+08
5516	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-15 23:46:55.506255+08
5517	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	auth.refresh	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	{"nextRefreshTokenId": "rt_89243d91-8189-45e9-9813-66a34d76c412", "previousRefreshTokenId": "rt_86ae75e8-2202-41ca-a92c-4f4beb0209d9"}	2026-03-16 10:51:45.315017+08
5518	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	auth.login	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	{"identifier": "shiroko"}	2026-03-16 10:53:17.297833+08
5519	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	auth.refresh	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	{"nextRefreshTokenId": "rt_6e925ff8-2a17-4767-b5b9-2b4123b3e8e2", "previousRefreshTokenId": "rt_89243d91-8189-45e9-9813-66a34d76c412"}	2026-03-16 13:07:40.824602+08
5520	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	auth.refresh	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	{"nextRefreshTokenId": "rt_7f48b2f4-8a3c-41f0-bee1-e52a95aafa1f", "previousRefreshTokenId": "rt_b68bbf26-bc30-4f4a-ad06-ca8d682a4c1c"}	2026-03-16 14:20:04.252774+08
5521	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 14:20:04.847976+08
5522	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 14:20:10.079144+08
5523	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 14:20:15.06336+08
5524	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 14:20:20.295695+08
5525	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	auth.refresh	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	{"nextRefreshTokenId": "rt_390bcb30-334a-4f7a-a1fa-19d724343d98", "previousRefreshTokenId": "rt_6e925ff8-2a17-4767-b5b9-2b4123b3e8e2"}	2026-03-16 14:20:49.239946+08
5526	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	auth.refresh	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	{"nextRefreshTokenId": "rt_3c14e81d-d912-4c51-8d14-d2a101510e1a", "previousRefreshTokenId": "rt_390bcb30-334a-4f7a-a1fa-19d724343d98"}	2026-03-16 16:59:12.739616+08
5527	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	auth.refresh	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	{"nextRefreshTokenId": "rt_0acf1f4a-1874-45e2-b09c-823ff5416565", "previousRefreshTokenId": "rt_7f48b2f4-8a3c-41f0-bee1-e52a95aafa1f"}	2026-03-16 17:00:08.617014+08
5528	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:00:08.747531+08
5529	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:00:13.800475+08
5530	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:00:18.793646+08
5531	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:00:23.775801+08
5532	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:00:28.779586+08
5533	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:00:33.772389+08
5534	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:00:38.795631+08
5535	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:00:43.773954+08
5536	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:00:48.99241+08
5537	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:00:53.79892+08
5538	system	\N	session.created	session	session_1773651654491_9kn2po	{"alias": "Mulyono", "clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "targetSource": "kiosk", "availabilitySource": "realtime-connected"}	2026-03-16 17:00:54.523319+08
5539	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:00:58.852938+08
6248	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:59:01.739923+08
5540	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:01:03.968459+08
6252	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:37:24.565036+08
6253	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:37:29.316699+08
6254	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:37:32.448868+08
6259	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:37:44.321035+08
6260	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:37:49.311551+08
6261	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:37:54.340237+08
6281	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:39:19.350015+08
6282	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:39:24.313728+08
6283	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:39:29.328025+08
6284	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:39:34.581465+08
6315	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:42:09.320327+08
6321	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:42:39.445183+08
6322	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:42:44.312955+08
6323	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:42:49.305546+08
6324	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:42:54.310157+08
6325	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:42:59.437297+08
6345	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:44:39.321868+08
6347	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:44:49.336851+08
6369	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:46:34.468206+08
6370	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:46:39.326291+08
6371	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:46:44.330968+08
6372	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:46:49.318161+08
6373	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:46:54.325976+08
6376	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:47:09.322211+08
6377	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:47:14.329966+08
6378	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:47:19.33202+08
6379	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:47:24.319221+08
6380	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:47:29.335335+08
6381	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:47:34.305916+08
6386	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:47:59.314997+08
6387	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:48:04.311756+08
6388	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:48:04.331218+08
6389	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:48:09.324619+08
6390	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:48:14.316556+08
5541	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:01:09.40682+08
5542	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:01:13.788975+08
5543	system	\N	job.created	job	job_1773651674950_e3ftua	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773651654491_9kn2po", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "originalName": "Ready2Race PC Setup.pdf"}	2026-03-16 17:01:15.101329+08
5544	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:01:19.070103+08
5545	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:01:23.845801+08
5546	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:01:28.977104+08
5547	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:01:33.813491+08
5548	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:01:38.798299+08
5549	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:01:43.900193+08
5550	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:01:48.833853+08
5551	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:01:53.800549+08
5552	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:01:58.998955+08
5553	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:02:03.791867+08
5554	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:02:08.823245+08
5555	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:02:13.79243+08
5556	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:02:18.827023+08
5557	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:02:23.795791+08
5558	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:02:28.808213+08
5559	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:02:33.789832+08
5560	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:02:38.789446+08
5561	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:02:43.880608+08
5562	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:02:48.837405+08
5563	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:02:53.807028+08
5564	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:02:58.802747+08
5565	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:03:03.794222+08
5566	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:03:08.793209+08
5567	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:03:13.803329+08
5568	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:03:18.79158+08
5569	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:03:23.800327+08
5570	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:03:28.908921+08
5571	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:03:33.799495+08
5572	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:03:38.790709+08
5573	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:03:43.905569+08
5574	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:03:48.80085+08
5575	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:03:53.899423+08
5576	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:03:58.803652+08
5577	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:04:03.796885+08
5578	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:04:08.887213+08
5579	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:04:13.871716+08
5580	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:04:18.794445+08
5581	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:04:23.792316+08
5582	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:04:28.81506+08
5583	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:04:33.88945+08
5584	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:04:38.774715+08
5585	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:04:43.850803+08
5586	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:04:48.80061+08
5587	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:04:53.801545+08
5588	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:04:58.801423+08
5589	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:05:03.809344+08
5590	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:05:08.795684+08
5591	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:05:13.821672+08
5592	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:05:18.812882+08
5593	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:05:23.804322+08
5594	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:05:28.830511+08
5595	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:05:34.179826+08
5596	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:05:38.79013+08
5597	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:05:43.805526+08
5598	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:05:48.861642+08
5599	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:05:53.809181+08
5600	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:05:58.804347+08
5601	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:06:03.816413+08
5602	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:06:08.863756+08
5603	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:06:13.803069+08
5604	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:06:18.814917+08
5605	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:06:23.817219+08
5606	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:06:28.828671+08
5607	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:06:33.826543+08
5608	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:06:38.794057+08
5609	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:06:38.860331+08
5610	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:06:43.82911+08
5611	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:06:48.834684+08
5612	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:06:53.830277+08
5613	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:06:58.833097+08
5614	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:07:03.831176+08
5615	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:07:08.778045+08
5616	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:07:08.822964+08
5617	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:07:13.828248+08
5618	system	\N	session.closed	session	session_1773651654491_9kn2po	{"clientId": null, "ownerUserId": null, "removedJobs": 0}	2026-03-16 17:07:15.235951+08
5619	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:07:18.834931+08
5620	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:07:23.833563+08
5621	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:07:28.967991+08
5622	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:07:33.870201+08
5623	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:07:38.821082+08
5624	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:07:43.931047+08
5625	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:07:48.818342+08
5626	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:07:53.830057+08
5627	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:07:58.859946+08
5628	system	\N	session.created	session	session_1773652080320_v6h0y5	{"alias": "Mulyono", "clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "targetSource": "kiosk", "availabilitySource": "realtime-connected"}	2026-03-16 17:08:00.376371+08
5629	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:08:04.074301+08
5630	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:08:08.790175+08
5631	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:08:08.834716+08
5632	system	\N	job.created	job	job_1773652089024_pm4cpa	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773652080320_v6h0y5", "ownerUserId": "user_3531e328-7fa7-45f3-bdb6-687f8fb72af6", "originalName": "Minimal, Complete PC Build.pdf"}	2026-03-16 17:08:09.033737+08
5633	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:08:13.904754+08
5634	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:08:18.830002+08
5635	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:08:23.830415+08
5636	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:08:29.090174+08
5637	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:08:33.851457+08
5638	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:08:38.790209+08
5639	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:08:38.840384+08
5640	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:08:43.844759+08
5641	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:08:48.99514+08
5642	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:09:08.789304+08
5643	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:09:08.83557+08
5644	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:09:13.83508+08
5645	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:09:18.832812+08
5646	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:09:23.845706+08
5647	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:09:28.850952+08
5648	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	auth.refresh	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	{"nextRefreshTokenId": "rt_95dd96c4-2879-4c41-9133-27f736ee0708", "previousRefreshTokenId": "rt_0acf1f4a-1874-45e2-b09c-823ff5416565"}	2026-03-16 17:35:12.825466+08
5649	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:35:13.920499+08
5650	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:35:19.034483+08
5651	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:35:23.933884+08
5652	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:35:28.920659+08
5653	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:35:33.928757+08
5654	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	auth.refresh	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	{"nextRefreshTokenId": "rt_04f0f8f5-b2f6-4d9c-90a5-5bedf38ffe05", "previousRefreshTokenId": "rt_95dd96c4-2879-4c41-9133-27f736ee0708"}	2026-03-16 17:37:58.202612+08
5655	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	client.registered	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:37:58.300494+08
5656	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:38:03.36326+08
5657	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:38:08.340557+08
5658	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:38:13.335794+08
5659	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:38:14.164353+08
5660	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.paired	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"identifier": "yefta", "handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "nextOwnerUserId": "user_c390f862-a82d-41ad-92af-7356235697a1", "previousOwnerUserId": null}	2026-03-16 17:38:15.058866+08
5661	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:38:15.091526+08
5662	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:38:18.341351+08
5663	user	user_c390f862-a82d-41ad-92af-7356235697a1	auth.refresh	user	user_c390f862-a82d-41ad-92af-7356235697a1	{"nextRefreshTokenId": "rt_e0e704f1-4d52-4ff3-ab93-574213321fad", "previousRefreshTokenId": "rt_dbed1bdb-b289-4590-a2e2-d4d713f9dc65"}	2026-03-16 17:38:24.843105+08
5664	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:38:24.943778+08
5665	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:38:30.030126+08
5666	user	user_c390f862-a82d-41ad-92af-7356235697a1	auth.refresh	user	user_c390f862-a82d-41ad-92af-7356235697a1	{"nextRefreshTokenId": "rt_4f201666-9456-458e-bf9c-bfa1e3ac6af6", "previousRefreshTokenId": "rt_e0e704f1-4d52-4ff3-ab93-574213321fad"}	2026-03-16 17:39:20.993929+08
5667	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.registered	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:39:21.091795+08
5668	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:39:26.116554+08
5669	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:39:31.123126+08
5670	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:39:36.116075+08
5671	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:39:37.243024+08
5672	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.paired	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"identifier": "yefta", "handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "nextOwnerUserId": "user_c390f862-a82d-41ad-92af-7356235697a1", "previousOwnerUserId": null}	2026-03-16 17:39:38.383938+08
5673	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:39:38.45801+08
5674	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:39:41.127211+08
5675	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:39:46.126052+08
5676	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:39:51.129251+08
5677	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:39:56.125098+08
5678	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:40:01.122069+08
5679	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:40:06.12726+08
5680	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:40:11.129525+08
5681	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:40:16.129864+08
5682	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:40:21.24506+08
5683	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:40:26.125962+08
5684	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:40:31.118325+08
5685	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:40:36.125307+08
5686	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:40:41.130625+08
5687	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:40:46.122638+08
5688	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:40:51.372533+08
5689	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:40:56.127966+08
5690	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:41:01.127304+08
5691	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:41:06.146763+08
5692	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:41:11.118878+08
5693	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:41:16.120833+08
5694	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:41:21.129493+08
5695	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:41:26.159479+08
5696	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:41:31.49553+08
5697	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:41:36.120456+08
5698	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:41:41.131149+08
5699	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:41:46.175806+08
5700	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:41:51.142275+08
5701	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:41:56.433427+08
5702	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-16 17:42:01.126607+08
5703	client	\N	client.registered	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:39:15.249977+08
5704	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:39:20.377135+08
5705	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:39:25.365147+08
5706	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:39:30.366353+08
5707	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:39:35.380852+08
5708	user	user_decb07e3-290e-4880-bbb4-d4507a370982	auth.register	user	user_decb07e3-290e-4880-bbb4-d4507a370982	{"role": "user", "email": null, "username": "agus"}	2026-03-19 19:39:37.80027+08
5709	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:39:40.353469+08
5710	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:39:45.437625+08
5711	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:39:50.381511+08
5712	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:39:50.788796+08
5713	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.paired	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"identifier": "agus", "handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "nextOwnerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "previousOwnerUserId": null}	2026-03-19 19:39:51.872446+08
5714	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:39:51.918685+08
5715	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:39:55.408933+08
5716	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:40:00.379968+08
5717	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:40:05.42724+08
5718	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:40:10.407341+08
5719	user	user_c390f862-a82d-41ad-92af-7356235697a1	auth.refresh	user	user_c390f862-a82d-41ad-92af-7356235697a1	{"nextRefreshTokenId": "rt_4b152aee-a609-495b-9025-8527e364836a", "previousRefreshTokenId": "rt_aaff75da-0ecd-433d-877d-fdc0b9bdccac"}	2026-03-19 19:40:11.938411+08
5720	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:40:12.077346+08
5721	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:40:15.404464+08
5722	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:40:17.127211+08
5723	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:40:20.642107+08
5724	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:40:22.139255+08
5725	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:40:25.399182+08
5726	system	\N	session.created	session	session_1773920426429_8nxysr	{"alias": "Mulyono", "clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "targetSource": "kiosk", "availabilitySource": "realtime-connected"}	2026-03-19 19:40:26.486848+08
5727	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:40:27.114784+08
5728	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:40:30.525624+08
5729	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:40:32.14807+08
5730	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:40:35.417044+08
5731	system	\N	job.created	job	job_1773920435690_dim1m8	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "sessionId": "session_1773920426429_8nxysr", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "originalName": "single label.docx"}	2026-03-19 19:40:35.726675+08
5732	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:40:37.125122+08
5733	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:40:40.410609+08
5734	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:40:42.120321+08
5735	system	\N	session.closed	session	session_1773920426429_8nxysr	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "removedJobs": 1}	2026-03-19 19:40:43.906841+08
5736	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:40:45.341442+08
5737	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:40:45.915851+08
5738	system	\N	session.created	session	session_1773920446354_uqff04	{"alias": "Mulyono", "clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "targetSource": "kiosk", "availabilitySource": "realtime-connected"}	2026-03-19 19:40:46.383639+08
5739	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:40:47.245138+08
5740	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:40:50.637942+08
5741	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:40:52.124861+08
5742	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:40:55.433055+08
5743	system	\N	job.created	job	job_1773920455909_kwy28l	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "sessionId": "session_1773920446354_uqff04", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "originalName": "ok.docx"}	2026-03-19 19:40:55.91685+08
5745	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:41:00.44864+08
5747	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:41:05.450438+08
5749	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:41:10.447492+08
6255	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.paired	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"identifier": "yefta", "handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "nextOwnerUserId": "user_c390f862-a82d-41ad-92af-7356235697a1", "previousOwnerUserId": null}	2026-03-20 07:37:33.308993+08
6256	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:37:33.341133+08
6257	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:37:34.362784+08
6258	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:37:39.312684+08
6285	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:39:39.350985+08
6286	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:39:44.357472+08
6287	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:39:49.309682+08
6288	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:39:54.326216+08
6316	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:42:14.315359+08
6317	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:42:19.318246+08
6318	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:42:24.341505+08
6319	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:42:29.323309+08
6320	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:42:34.358387+08
6351	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:45:09.340704+08
6352	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:45:14.339242+08
6353	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:45:19.320869+08
6354	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:45:24.319128+08
6355	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:45:29.331731+08
6356	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:45:34.311981+08
6374	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:46:59.337421+08
6375	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:47:04.313254+08
6391	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:48:19.319454+08
6392	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:48:24.337428+08
6393	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:48:29.332995+08
6400	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:49:04.313899+08
6401	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:49:04.340893+08
6402	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:49:09.317967+08
6403	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:49:14.323377+08
6404	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:49:19.322501+08
5744	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:40:57.362602+08
5746	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:41:02.146402+08
5748	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:41:07.13837+08
5750	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:41:12.155365+08
5751	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:41:15.350548+08
5752	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:41:15.428989+08
5753	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:41:17.206288+08
5754	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:41:20.460531+08
5755	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:41:22.121321+08
5756	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:41:25.441335+08
5757	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:41:27.124406+08
5758	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:41:30.435295+08
5759	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:41:32.1114+08
5760	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:41:35.609423+08
5761	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:41:37.158952+08
5762	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	auth.refresh	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	{"nextRefreshTokenId": "rt_b62f75c4-2ac8-4bb5-9d46-c2adb91d430e", "previousRefreshTokenId": "rt_3c14e81d-d912-4c51-8d14-d2a101510e1a"}	2026-03-19 19:41:37.833081+08
5763	system	\N	session.closed	session	session_1773920446354_uqff04	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "removedJobs": 1}	2026-03-19 19:41:38.87487+08
5764	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:41:40.469413+08
5765	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:41:42.104098+08
5766	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	auth.logout	user	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	{"revokedCount": 1}	2026-03-19 19:41:42.58769+08
5767	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:41:45.35125+08
5768	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:41:45.47123+08
5769	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:41:47.133972+08
5770	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:41:50.61478+08
5771	user	user_c390f862-a82d-41ad-92af-7356235697a1	auth.login	user	user_c390f862-a82d-41ad-92af-7356235697a1	{"identifier": "yefta"}	2026-03-19 19:41:50.615666+08
5772	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:41:52.404715+08
5773	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:41:55.458899+08
5774	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:41:57.136182+08
5775	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:42:00.508766+08
5776	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:42:02.120952+08
5777	user	user_c390f862-a82d-41ad-92af-7356235697a1	user.pin.updated	user	user_c390f862-a82d-41ad-92af-7356235697a1	{"pinLength": 4}	2026-03-19 19:42:05.167231+08
5778	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:42:05.486493+08
5779	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:42:07.134599+08
5780	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:42:10.63745+08
5781	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:42:12.765193+08
5782	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.unbound	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "previousOwnerUserId": "user_c390f862-a82d-41ad-92af-7356235697a1"}	2026-03-19 19:42:12.907539+08
5783	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:42:12.976914+08
5784	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:42:15.354611+08
5785	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:42:15.477302+08
5786	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:42:17.118582+08
5787	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:42:20.08655+08
5788	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:42:20.746133+08
5789	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:42:22.22151+08
5790	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:42:25.50047+08
5791	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:42:27.146052+08
5792	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:42:30.481018+08
5793	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:42:32.129726+08
5794	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:42:35.479723+08
5795	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:42:40.515454+08
5796	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:42:45.495079+08
5797	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:42:46.883258+08
5798	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:42:50.543058+08
5799	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:42:52.004158+08
5800	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:42:55.532592+08
5801	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:42:56.990819+08
5802	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:42:57.548762+08
5803	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:43:00.556997+08
5804	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:43:02.000498+08
5805	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:43:05.569292+08
5806	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:43:07.037382+08
5807	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:43:10.59103+08
5808	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:43:15.372811+08
5809	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:43:15.778085+08
5810	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:43:20.582884+08
5811	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:43:25.598543+08
5812	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:43:30.601042+08
5813	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:43:35.889212+08
5814	user	user_decb07e3-290e-4880-bbb4-d4507a370982	user.pin.updated	user	user_decb07e3-290e-4880-bbb4-d4507a370982	{"pinLength": 4}	2026-03-19 19:43:37.033895+08
5815	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:43:40.62586+08
5816	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:43:45.380239+08
5817	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:43:45.627644+08
5818	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:43:50.639958+08
5819	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.unbound	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "previousOwnerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982"}	2026-03-19 19:43:52.87356+08
5820	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:43:52.939397+08
5821	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:43:55.890264+08
5822	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:44:00.638779+08
5823	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:44:00.85388+08
5824	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:44:05.635912+08
5825	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:44:05.961095+08
5826	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:44:06.255728+08
5827	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:44:10.634903+08
5828	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:44:10.936705+08
5829	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:44:15.378312+08
5830	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:44:15.638006+08
5831	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:44:15.938562+08
5832	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:44:20.670805+08
5833	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:44:25.658148+08
5834	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:44:30.65951+08
5835	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:44:35.650812+08
5836	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:44:40.644904+08
5837	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:44:45.38469+08
5838	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:44:45.665371+08
5839	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:44:50.641972+08
5840	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:44:55.647608+08
5841	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:45:00.637189+08
5842	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:45:05.873728+08
5843	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:45:10.657413+08
5844	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:45:15.4406+08
5845	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:45:15.837841+08
5846	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:45:20.657052+08
5847	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:45:25.648179+08
5848	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:45:30.641821+08
5849	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:45:35.745963+08
5850	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:45:40.663977+08
5851	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:45:45.386552+08
5852	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:45:45.63894+08
5853	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:45:50.739655+08
5854	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:45:55.656816+08
5855	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:46:00.679774+08
5856	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:46:05.679975+08
5857	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:46:10.682118+08
5858	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:46:15.358186+08
5859	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:46:15.671187+08
5860	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:46:20.666951+08
5861	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:46:25.688132+08
5862	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:46:30.669456+08
5863	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:46:35.694695+08
5864	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:46:36.543285+08
5865	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:46:40.681315+08
5866	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:46:41.628041+08
5867	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:46:43.280422+08
5868	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:46:45.374714+08
5869	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:46:45.701042+08
5870	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:46:46.61466+08
5871	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:46:50.787802+08
5872	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:46:51.667131+08
5873	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:47:01.698774+08
5874	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:47:05.707512+08
5875	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:47:06.597922+08
5876	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:47:10.693825+08
5877	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:47:11.6607+08
5878	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:47:14.46326+08
5879	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:47:15.561613+08
5880	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:47:15.694684+08
5881	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:47:16.696882+08
5882	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:47:20.7169+08
5883	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:47:21.619117+08
5884	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:47:25.712409+08
5885	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:47:26.645149+08
5886	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:47:30.713445+08
5887	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:47:31.511509+08
5888	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:47:32.142403+08
5889	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.paired	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"identifier": "yefta", "handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "nextOwnerUserId": "user_c390f862-a82d-41ad-92af-7356235697a1", "previousOwnerUserId": null}	2026-03-19 19:47:32.690784+08
5890	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:47:32.739441+08
5891	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:47:35.716098+08
5893	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:47:40.69581+08
5894	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:47:41.628401+08
5897	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:47:46.630478+08
5898	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.unbound	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "previousOwnerUserId": "user_c390f862-a82d-41ad-92af-7356235697a1"}	2026-03-19 19:47:50.359701+08
5899	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:47:50.392815+08
5900	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:47:50.719323+08
5901	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:47:51.61154+08
5902	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:47:55.713221+08
5903	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:47:56.640868+08
5904	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:47:58.567015+08
5905	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.paired	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"identifier": "yefta", "handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "nextOwnerUserId": "user_c390f862-a82d-41ad-92af-7356235697a1", "previousOwnerUserId": null}	2026-03-19 19:47:59.275404+08
5906	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:47:59.312919+08
5907	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:48:00.724115+08
6262	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:37:59.382689+08
6263	system	\N	session.closed	session	session_1773920446354_uqff04	{"clientId": null, "ownerUserId": null, "removedJobs": 0}	2026-03-20 07:38:01.970457+08
6266	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:38:09.324336+08
6267	system	\N	job.created	job	job_1773963490562_kvzeo3	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773963483987_nz6f93", "ownerUserId": "user_c390f862-a82d-41ad-92af-7356235697a1", "originalName": "WhatsApp Image 2026-03-16 at 13.29.11.jpeg"}	2026-03-20 07:38:10.583527+08
6268	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:38:14.387828+08
6269	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:38:19.342906+08
6270	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:38:24.308591+08
6289	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:39:59.33733+08
6290	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:40:04.318923+08
6291	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:40:09.375004+08
6292	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:40:14.315472+08
6293	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:40:19.307751+08
6294	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:40:24.318353+08
6295	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:40:29.327658+08
6326	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:43:04.815428+08
6328	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:43:14.319959+08
6329	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:43:19.560076+08
6330	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:43:24.323274+08
6331	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:43:29.330924+08
6332	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:43:34.305051+08
6357	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:45:39.367179+08
5895	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:47:45.404135+08
5896	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:47:45.716818+08
5908	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:48:01.628105+08
5909	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:48:05.72275+08
5910	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:48:06.611996+08
5911	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:48:10.70525+08
5912	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:48:11.665736+08
5913	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:48:15.422129+08
5914	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:48:15.717774+08
5915	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:48:16.61958+08
5916	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:48:20.716053+08
5917	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:48:21.666711+08
5918	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:48:25.72503+08
5919	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:48:26.637937+08
5920	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:48:30.698412+08
5921	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:48:31.617056+08
5922	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:48:35.704244+08
5923	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:48:36.603479+08
5924	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:48:40.722605+08
5925	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:48:41.623997+08
5926	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:48:45.441532+08
5927	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:48:45.719255+08
5928	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:48:46.682191+08
5929	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:48:50.712401+08
5930	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:48:51.626686+08
5931	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:48:55.72633+08
5932	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:48:56.69927+08
5933	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:49:00.748815+08
5934	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:49:01.62582+08
5935	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:49:05.761133+08
5936	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:49:06.604942+08
5937	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:49:10.731724+08
5938	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:49:11.632042+08
5939	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:49:15.449913+08
5940	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:49:15.733188+08
5941	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:49:16.603914+08
5942	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.unbound	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "previousOwnerUserId": "user_c390f862-a82d-41ad-92af-7356235697a1"}	2026-03-19 19:49:19.407606+08
5943	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:49:19.445084+08
5944	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:49:20.736517+08
5945	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:49:21.680954+08
5946	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:49:25.750325+08
5947	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:49:26.63587+08
5948	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:49:30.741533+08
5949	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:49:31.612875+08
5950	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:49:33.505151+08
5951	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.paired	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"identifier": "agus", "handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "nextOwnerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "previousOwnerUserId": null}	2026-03-19 19:49:34.093066+08
5952	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:49:34.129043+08
5953	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:49:35.738012+08
5954	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:49:36.607281+08
5955	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:49:40.752702+08
5956	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:49:41.642867+08
5957	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:49:45.433735+08
5958	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:49:45.760078+08
5959	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:49:46.628194+08
5960	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:49:47.768094+08
5961	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.paired	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"identifier": "yefta", "handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "nextOwnerUserId": "user_c390f862-a82d-41ad-92af-7356235697a1", "previousOwnerUserId": "user_c390f862-a82d-41ad-92af-7356235697a1"}	2026-03-19 19:49:48.457027+08
5962	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:49:48.493758+08
5963	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:49:50.738725+08
5964	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:49:51.66534+08
5965	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.unbound	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "previousOwnerUserId": "user_c390f862-a82d-41ad-92af-7356235697a1"}	2026-03-19 19:49:55.38786+08
5966	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:49:55.404331+08
5967	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:49:55.737281+08
5968	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:49:56.631467+08
5969	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:50:00.731791+08
5970	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:50:01.631768+08
5971	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:50:03.139815+08
5972	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.paired	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"identifier": "agus", "handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "nextOwnerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "previousOwnerUserId": null}	2026-03-19 19:50:03.912995+08
5973	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:50:03.943211+08
5974	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:50:05.742525+08
5975	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:50:06.6197+08
5979	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:50:15.445584+08
5980	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:50:15.763163+08
5989	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:50:36.624283+08
5991	system	\N	session.created	session	session_1773921040653_pvkhj9	{"alias": "mas", "clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "targetSource": "kiosk", "availabilitySource": "realtime-connected"}	2026-03-19 19:50:40.681748+08
5992	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:50:40.761238+08
5996	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:50:46.648134+08
5997	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:50:50.751571+08
5998	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:50:51.633233+08
5999	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:50:55.767613+08
6000	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:50:56.657322+08
6001	system	\N	job.created	job	job_1773921058421_lmhg5q	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773921040653_pvkhj9", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "originalName": "Resi Pengiriman Surat Penatua dan Tim Transisi.docx"}	2026-03-19 19:50:58.432313+08
6002	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:51:00.77373+08
6004	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:51:05.760277+08
6005	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:51:06.610802+08
6006	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:51:06.688041+08
6007	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:51:10.790887+08
6008	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:51:11.655544+08
6009	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:51:15.599858+08
6010	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:51:16.861706+08
6013	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:51:25.776532+08
6014	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:51:26.666727+08
6016	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:51:31.661558+08
6017	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:51:35.778401+08
6018	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:51:36.610912+08
6019	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:51:36.663341+08
6020	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:51:40.792509+08
6021	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:51:41.65956+08
6024	system	\N	job.cloned	job	job_1773921102478_x8ci6m	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773921040653_pvkhj9", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "sourceJobId": "job_1773921102138_v0xwxa"}	2026-03-19 19:51:42.494637+08
6025	system	\N	job.cloned	job	job_1773921103060_9fvmwf	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773921040653_pvkhj9", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "sourceJobId": "job_1773921102478_x8ci6m"}	2026-03-19 19:51:43.097038+08
6028	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:51:46.662442+08
5976	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:50:06.67687+08
5977	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:50:10.73586+08
5978	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:50:11.677894+08
5981	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:50:16.645759+08
5982	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:50:20.745358+08
5983	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:50:21.737487+08
5984	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:50:25.751261+08
5985	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:50:26.660735+08
5986	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:50:30.731942+08
5987	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:50:31.647027+08
5988	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:50:35.757586+08
5990	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:50:36.652233+08
5993	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:50:41.669784+08
5994	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:50:45.511122+08
5995	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:50:45.782788+08
6003	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:51:01.645548+08
6011	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:51:20.83401+08
6012	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:51:21.632813+08
6015	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:51:30.78199+08
6022	system	\N	job.cloned	job	job_1773921101785_20wh00	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773921040653_pvkhj9", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "sourceJobId": "job_1773921058421_lmhg5q"}	2026-03-19 19:51:41.802579+08
6023	system	\N	job.cloned	job	job_1773921102138_v0xwxa	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773921040653_pvkhj9", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "sourceJobId": "job_1773921101785_20wh00"}	2026-03-19 19:51:42.15741+08
6026	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:51:45.460312+08
6027	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:51:45.797404+08
6030	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:51:51.657376+08
6031	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:51:55.804172+08
6032	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:51:56.66412+08
6033	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:52:00.80737+08
6038	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:52:06.656414+08
6039	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:52:10.826035+08
6040	user	user_decb07e3-290e-4880-bbb4-d4507a370982	job.status.changed	job	job_1773921101785_20wh00	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773921040653_pvkhj9", "nextStatus": "rejected", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "previousStatus": "ready", "requestClientId": null, "claimedByClientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7"}	2026-03-19 19:52:11.357467+08
6041	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:52:11.718252+08
6264	system	\N	session.created	session	session_1773963483987_nz6f93	{"alias": "Mulyono", "clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "ownerUserId": "user_c390f862-a82d-41ad-92af-7356235697a1", "targetSource": "kiosk", "availabilitySource": "realtime-connected"}	2026-03-20 07:38:04.020194+08
6029	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:51:50.793778+08
6034	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:52:01.652078+08
6035	user	user_decb07e3-290e-4880-bbb4-d4507a370982	job.status.changed	job	job_1773921058421_lmhg5q	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773921040653_pvkhj9", "nextStatus": "rejected", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "previousStatus": "ready", "requestClientId": null, "claimedByClientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7"}	2026-03-19 19:52:05.291642+08
6036	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:52:05.82433+08
6037	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:52:06.607591+08
6042	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:52:15.478145+08
6043	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:52:15.834934+08
6044	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:52:16.655328+08
6045	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:52:20.850733+08
6046	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:52:21.65546+08
6047	user	user_decb07e3-290e-4880-bbb4-d4507a370982	job.status.changed	job	job_1773921102138_v0xwxa	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773921040653_pvkhj9", "nextStatus": "rejected", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "previousStatus": "ready", "requestClientId": null, "claimedByClientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7"}	2026-03-19 19:52:23.95366+08
6048	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:52:25.840977+08
6049	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:52:26.642456+08
6050	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:52:30.839092+08
6051	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:52:31.644626+08
6052	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:52:35.831856+08
6053	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:52:36.627182+08
6054	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:52:40.855435+08
6055	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:52:41.655276+08
6056	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:52:45.484073+08
6057	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:52:45.840912+08
6058	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:52:46.646873+08
6059	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:52:50.821568+08
6060	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:52:51.635262+08
6061	user	user_decb07e3-290e-4880-bbb4-d4507a370982	job.status.changed	job	job_1773921102478_x8ci6m	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773921040653_pvkhj9", "nextStatus": "rejected", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "previousStatus": "ready", "requestClientId": null, "claimedByClientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7"}	2026-03-19 19:52:53.747124+08
6062	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:52:55.836753+08
6063	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:52:56.66139+08
6064	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:53:00.842908+08
6065	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:53:01.676862+08
6066	user	user_decb07e3-290e-4880-bbb4-d4507a370982	job.status.changed	job	job_1773921103060_9fvmwf	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773921040653_pvkhj9", "nextStatus": "rejected", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "previousStatus": "ready", "requestClientId": null, "claimedByClientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7"}	2026-03-19 19:53:03.251395+08
6067	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:53:05.843891+08
6068	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:53:06.624652+08
6265	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:38:04.313251+08
6296	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:40:34.500558+08
6297	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:40:39.325502+08
6298	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:40:44.302538+08
6299	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:40:49.308565+08
6300	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:40:54.313717+08
6301	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:40:59.394936+08
6302	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:41:04.383412+08
6303	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:41:09.310125+08
6304	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:41:14.309839+08
6305	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:41:19.389552+08
6327	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:43:09.318673+08
6358	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:45:44.326109+08
6359	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:45:49.332359+08
6360	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:45:54.341269+08
6361	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:45:59.33186+08
6362	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:46:04.3087+08
6382	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:47:39.330024+08
6383	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:47:44.325264+08
6394	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:48:34.308702+08
6405	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:49:24.326849+08
6406	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:49:29.328944+08
6407	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:49:34.3051+08
6408	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:49:39.325132+08
6409	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:49:44.407061+08
6410	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:49:49.323953+08
6411	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:49:54.328775+08
6412	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:49:59.322685+08
6413	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:50:04.304361+08
6414	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:50:09.370809+08
6415	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:50:14.327472+08
6416	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:50:19.327206+08
6069	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:53:10.85406+08
6070	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:53:11.656843+08
6071	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:53:15.47835+08
6072	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:53:15.830825+08
6073	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:53:16.654305+08
6074	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:53:20.836009+08
6075	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:53:21.661103+08
6076	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:53:25.840729+08
6077	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:53:26.66148+08
6078	system	\N	job.created	job	job_1773921208748_r5jas0	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773921040653_pvkhj9", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "originalName": "Resi Pengiriman Surat Penatua dan Tim Transisi.docx"}	2026-03-19 19:53:28.764958+08
6079	system	\N	job.cloned	job	job_1773921210360_rvi73s	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773921040653_pvkhj9", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "sourceJobId": "job_1773921208748_r5jas0"}	2026-03-19 19:53:30.378784+08
6080	system	\N	job.cloned	job	job_1773921210612_652adb	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773921040653_pvkhj9", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "sourceJobId": "job_1773921210360_rvi73s"}	2026-03-19 19:53:30.634281+08
6081	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:53:30.845144+08
6082	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:53:31.657619+08
6083	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:53:35.824177+08
6084	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:53:36.596909+08
6085	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:53:36.630574+08
6086	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:53:40.860549+08
6087	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:53:41.641358+08
6088	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:53:45.464423+08
6089	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:53:45.847364+08
6090	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:53:46.633604+08
6091	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:53:50.835921+08
6092	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:53:51.685803+08
6093	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.unbound	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 5, "sessionsReowned": 0, "sessionsDetached": 0}, "previousOwnerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982"}	2026-03-19 19:53:52.543043+08
6094	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:53:52.557352+08
6095	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:53:55.863568+08
6096	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:53:56.655644+08
6097	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:54:00.870328+08
6098	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:54:01.660751+08
6099	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:54:05.859066+08
6100	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:54:06.592055+08
6101	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:54:06.651727+08
6102	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:54:10.865726+08
6103	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:54:11.636325+08
6104	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:54:15.478478+08
6105	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:54:15.852316+08
6108	user	user_decb07e3-290e-4880-bbb4-d4507a370982	job.status.changed	job	job_1773921210612_652adb	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773921040653_pvkhj9", "nextStatus": "rejected", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "previousStatus": "ready", "requestClientId": null, "claimedByClientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7"}	2026-03-19 19:54:20.080518+08
6109	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:54:20.854643+08
6110	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:54:21.6323+08
6120	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:54:41.651581+08
6121	system	\N	session.closed	session	session_1773921040653_pvkhj9	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "removedJobs": 8}	2026-03-19 19:54:42.111892+08
6125	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:54:46.638797+08
6126	system	\N	session.closed	session	session_1773921284127_81xvzc	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "removedJobs": 0}	2026-03-19 19:54:47.628012+08
6127	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:54:50.864809+08
6128	system	\N	session.created	session	session_1773921291096_wzzg3r	{"alias": "mas", "clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "targetSource": "kiosk", "availabilitySource": "realtime-connected"}	2026-03-19 19:54:51.101301+08
6129	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:54:51.643609+08
6130	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:54:55.868304+08
6131	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:54:56.668069+08
6137	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:55:06.659868+08
6138	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:55:10.872607+08
6139	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:55:11.663862+08
6140	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:55:15.576512+08
6141	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:55:15.881015+08
6148	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:55:31.659442+08
6149	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:55:35.912802+08
6154	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.unbound	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "previousOwnerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982"}	2026-03-19 19:55:44.76887+08
6155	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:55:44.797491+08
6156	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:55:45.460247+08
6157	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:55:45.904558+08
6164	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:56:01.676442+08
6165	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:56:05.883314+08
6166	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:56:06.375909+08
6167	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:56:07.066129+08
6168	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.paired	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"identifier": "agus", "handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "nextOwnerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "previousOwnerUserId": null}	2026-03-19 19:56:07.262371+08
6169	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:56:07.344398+08
6107	user	user_decb07e3-290e-4880-bbb4-d4507a370982	job.status.changed	job	job_1773921210360_rvi73s	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773921040653_pvkhj9", "nextStatus": "rejected", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "previousStatus": "ready", "requestClientId": null, "claimedByClientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7"}	2026-03-19 19:54:18.905667+08
6111	user	user_decb07e3-290e-4880-bbb4-d4507a370982	job.status.changed	job	job_1773921208748_r5jas0	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "sessionId": "session_1773921040653_pvkhj9", "nextStatus": "rejected", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "previousStatus": "ready", "requestClientId": null, "claimedByClientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7"}	2026-03-19 19:54:25.519483+08
6112	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:54:25.869782+08
6113	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:54:26.659449+08
6114	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:54:30.870842+08
6115	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:54:31.635718+08
6116	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:54:35.864291+08
6117	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:54:36.606474+08
6118	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:54:36.674981+08
6119	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:54:40.859792+08
6122	system	\N	session.created	session	session_1773921284127_81xvzc	{"alias": "mas", "clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "targetSource": "kiosk", "availabilitySource": "realtime-connected"}	2026-03-19 19:54:44.149769+08
6123	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:54:45.50325+08
6124	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:54:45.866748+08
6132	system	\N	job.created	job	job_1773921297192_yi3efn	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "sessionId": "session_1773921291096_wzzg3r", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "originalName": "Resi Pengiriman Surat Penatua dan Tim Transisi.docx"}	2026-03-19 19:54:57.207413+08
6133	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:55:00.853806+08
6134	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:55:01.653858+08
6135	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:55:05.872261+08
6136	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:55:06.612578+08
6142	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:55:16.6536+08
6143	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:55:20.88802+08
6144	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:55:21.637592+08
6145	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:55:25.90085+08
6146	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:55:26.664154+08
6147	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:55:30.905699+08
6150	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:55:36.603139+08
6151	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:55:36.65275+08
6152	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:55:40.920368+08
6153	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:55:41.670615+08
6158	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:55:46.689464+08
6159	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:55:50.897089+08
6160	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:55:51.693984+08
6161	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:55:55.90403+08
6162	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:55:56.690195+08
6163	client	\N	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:56:00.94857+08
6170	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:56:10.924373+08
6171	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:56:11.681914+08
6172	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:56:15.483182+08
6173	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:56:15.921437+08
6174	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:56:16.680731+08
6175	user	user_decb07e3-290e-4880-bbb4-d4507a370982	job.status.changed	job	job_1773921297192_yi3efn	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "sessionId": "session_1773921291096_wzzg3r", "nextStatus": "rejected", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "previousStatus": "ready", "requestClientId": null, "claimedByClientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd"}	2026-03-19 19:56:18.075145+08
6176	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:56:20.9473+08
6177	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:56:21.698919+08
6178	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:56:26.696165+08
6179	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:56:31.706456+08
6180	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:56:36.609618+08
6181	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:56:36.689559+08
6182	system	\N	session.closed	session	session_1773921291096_wzzg3r	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "removedJobs": 1}	2026-03-19 19:56:39.254317+08
6183	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:56:41.710863+08
6184	user	user_decb07e3-290e-4880-bbb4-d4507a370982	auth.refresh	user	user_decb07e3-290e-4880-bbb4-d4507a370982	{"nextRefreshTokenId": "rt_edba171b-947c-4632-a1a8-acd4351d7d18", "previousRefreshTokenId": "rt_9e050cbc-011e-4072-99a4-1be820af0894"}	2026-03-19 19:56:44.734378+08
6185	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:56:44.770727+08
6186	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:56:46.708607+08
6187	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:56:49.842386+08
6188	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:56:51.681382+08
6189	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:56:54.828502+08
6190	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:56:56.686564+08
6191	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:56:59.813954+08
6192	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:57:01.720789+08
6193	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:57:04.823253+08
6194	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:57:06.609947+08
6195	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:57:06.688929+08
6196	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:57:06.80853+08
6197	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.paired	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"identifier": "agus", "handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "nextOwnerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "previousOwnerUserId": null}	2026-03-19 19:57:07.800639+08
6198	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:57:07.847978+08
6199	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:57:09.850252+08
6200	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:57:11.745078+08
6201	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:57:14.888186+08
6202	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:57:16.723251+08
6203	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:57:19.865627+08
6204	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:57:21.725449+08
6205	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:57:24.850571+08
6206	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:57:26.730389+08
6207	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:57:29.902273+08
6208	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:57:31.720316+08
6209	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:57:34.880302+08
6210	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:57:36.619638+08
6211	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:57:36.71169+08
6212	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:57:39.889151+08
6213	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:57:41.69257+08
6214	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:57:44.996808+08
6215	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:57:46.718661+08
6216	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:57:49.901571+08
6217	system	\N	session.created	session	session_1773921470578_mcf6ch	{"alias": "mas", "clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "targetSource": "kiosk", "availabilitySource": "realtime-connected"}	2026-03-19 19:57:50.607487+08
6218	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:57:51.70374+08
6219	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:57:54.875361+08
6220	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:57:56.732867+08
6221	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:57:59.875895+08
6222	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:58:01.729132+08
6223	system	\N	job.created	job	job_1773921482796_2o09tx	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "sessionId": "session_1773921470578_mcf6ch", "ownerUserId": "user_decb07e3-290e-4880-bbb4-d4507a370982", "originalName": "Resi Pengiriman Surat Penatua dan Tim Transisi.docx"}	2026-03-19 19:58:02.806887+08
6224	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:58:04.846956+08
6225	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:58:06.61986+08
6226	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-19 19:58:06.711067+08
6227	user	user_decb07e3-290e-4880-bbb4-d4507a370982	client.updated	client	cb358d0f-c500-4cf3-add8-89d4750f9cfd	{"clientId": "cb358d0f-c500-4cf3-add8-89d4750f9cfd", "clientName": "DESKTOP-KF4KI8Q"}	2026-03-19 19:58:09.865437+08
6271	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:38:29.314156+08
6272	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:38:34.633508+08
6306	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:41:24.364991+08
6307	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:41:29.330953+08
6308	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:41:34.303893+08
6310	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:41:44.30336+08
6311	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:41:49.311319+08
6312	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:41:54.311152+08
6313	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:41:59.320407+08
6417	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:50:24.324441+08
6418	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:50:29.317723+08
6419	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:50:34.310403+08
6420	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:50:34.335116+08
6421	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:50:39.331491+08
6422	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:50:44.329372+08
6423	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:50:49.326484+08
6424	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:50:54.328704+08
6425	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:50:59.321789+08
6426	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:51:04.306196+08
6427	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:51:09.324691+08
6428	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:51:14.32874+08
6429	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:51:19.324914+08
6430	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:51:24.330341+08
6431	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:51:29.316634+08
6432	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:51:34.319158+08
6433	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:51:39.352057+08
6434	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:51:44.31776+08
6435	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:51:49.322246+08
6436	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:51:54.322667+08
6437	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:51:59.319116+08
6438	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:52:04.305255+08
6439	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:52:09.325922+08
6440	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:52:14.320818+08
6441	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:52:19.327805+08
6442	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:52:24.326976+08
6443	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:52:29.327445+08
6444	user	user_c390f862-a82d-41ad-92af-7356235697a1	auth.refresh	user	user_c390f862-a82d-41ad-92af-7356235697a1	{"nextRefreshTokenId": "rt_d742a2a0-fb51-4dcf-b09c-1ba944994221", "previousRefreshTokenId": "rt_45cdaa8d-35ee-4ae4-b838-e3064d7beed7"}	2026-03-20 07:52:34.34939+08
6445	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:52:34.370405+08
6446	user	user_c390f862-a82d-41ad-92af-7356235697a1	auth.refresh	user	user_c390f862-a82d-41ad-92af-7356235697a1	{"nextRefreshTokenId": "rt_10b23e26-791b-461c-a243-2e1bac616a5a", "previousRefreshTokenId": "rt_d742a2a0-fb51-4dcf-b09c-1ba944994221"}	2026-03-20 07:52:34.504564+08
6447	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:52:39.401932+08
6448	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:52:44.324727+08
6449	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:52:49.319954+08
6450	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:52:54.33002+08
6451	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:52:59.323797+08
6452	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:53:04.312526+08
6453	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:53:09.322352+08
6454	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:53:14.329499+08
6455	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:53:19.345448+08
6456	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:53:24.356123+08
6457	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:53:29.326849+08
6458	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:53:34.312124+08
6459	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:53:39.32289+08
6460	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:53:44.344682+08
6461	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:53:49.320349+08
6462	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:53:54.317643+08
6463	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:53:59.329493+08
6464	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:54:04.306837+08
6465	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:54:04.342216+08
6466	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:54:09.328748+08
6467	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:54:14.319195+08
6468	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:54:19.320919+08
6469	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:54:24.329645+08
6470	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:54:29.322476+08
6471	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:54:34.327656+08
6472	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:54:39.317729+08
6473	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:54:44.32014+08
6474	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:54:49.324644+08
6475	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:54:54.329397+08
6476	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:54:59.324482+08
6477	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:55:04.304045+08
6478	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:55:09.331226+08
6479	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:55:14.34446+08
6480	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:55:19.341781+08
6481	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:55:24.323005+08
6482	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:55:29.320128+08
6483	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:55:34.369178+08
6484	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:55:39.317321+08
6485	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:55:44.409667+08
6486	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:55:49.319642+08
6487	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:55:54.324218+08
6488	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:55:59.328556+08
6489	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:56:04.310526+08
6490	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:56:09.372099+08
6491	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:56:14.319315+08
6492	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:56:19.32099+08
6493	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:56:24.313335+08
6494	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:56:29.360433+08
6495	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:56:34.306319+08
6496	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:56:34.327751+08
6497	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:56:39.331495+08
6498	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:56:44.35425+08
6499	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:56:49.340957+08
6500	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:56:54.331581+08
6501	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:56:59.345486+08
6502	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:57:04.307618+08
6503	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:57:04.339663+08
6504	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:57:09.339599+08
6505	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:57:14.348392+08
6506	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:57:19.340552+08
6507	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:57:24.34109+08
6508	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:57:29.341583+08
6509	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:57:34.309656+08
6510	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:57:34.334594+08
6511	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:57:39.337699+08
6512	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:57:44.336132+08
6513	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:57:49.344384+08
6514	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:57:54.335004+08
6515	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:57:59.341337+08
6516	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:58:04.307428+08
6517	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:58:04.338699+08
6518	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:58:09.345663+08
6519	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:58:14.355684+08
6520	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:58:19.402375+08
6521	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:58:24.359799+08
6522	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:58:29.351859+08
6523	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:58:34.310883+08
6524	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:58:34.358127+08
6525	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:58:39.355302+08
6526	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:58:44.350357+08
6527	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:58:49.349696+08
6528	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:58:54.35497+08
6529	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:58:59.348994+08
6530	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:59:04.331131+08
6531	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:59:04.41001+08
6532	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:59:09.366673+08
6533	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:59:14.360799+08
6534	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:59:19.34846+08
6535	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:59:24.359226+08
6536	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:59:29.358744+08
6537	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:59:34.302639+08
6538	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:59:34.350231+08
6539	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:59:39.358475+08
6540	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:59:44.367251+08
6541	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:59:49.355401+08
6542	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:59:54.428685+08
6543	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 07:59:59.361867+08
6544	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:00:04.310775+08
6545	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:00:04.358335+08
6546	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:00:09.354737+08
6547	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:00:14.364963+08
6548	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:00:19.360265+08
6549	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:00:24.356503+08
6550	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:00:29.356776+08
6551	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:00:34.364489+08
6552	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:00:39.355054+08
6553	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:00:44.349445+08
6554	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:00:49.353942+08
6555	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:00:54.359479+08
6556	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:00:59.351131+08
6557	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:01:04.308736+08
6558	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:01:04.354975+08
6559	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:01:09.358468+08
6560	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:01:14.361478+08
6561	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:01:19.34631+08
6562	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:01:24.359999+08
6563	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:01:29.360844+08
6564	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:01:34.308942+08
6565	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:01:34.36074+08
6566	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:01:39.356786+08
6567	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:01:44.347599+08
6568	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:01:49.357521+08
6569	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:01:54.506851+08
6570	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:01:59.368079+08
6571	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:02:04.317775+08
6572	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:02:04.363719+08
6573	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:02:09.354731+08
6574	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:02:14.361753+08
6575	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:02:19.355255+08
6576	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:02:24.392611+08
6577	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:02:29.358195+08
6578	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:02:34.776265+08
6579	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:02:39.351443+08
6580	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:02:44.359131+08
6581	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:02:49.388614+08
6582	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:02:54.355645+08
6583	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:02:59.404484+08
6584	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:03:04.347235+08
6585	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:03:09.360541+08
6586	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:03:14.35679+08
6587	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:03:19.361907+08
6588	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:03:24.369437+08
6589	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:03:29.352824+08
6590	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:03:34.302013+08
6591	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:03:34.345532+08
6592	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:03:39.374373+08
6593	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:03:44.346325+08
6594	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:03:49.352761+08
6595	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:03:54.352085+08
6596	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:03:59.360429+08
6597	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:04:04.311455+08
6598	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:04:04.362454+08
6599	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:04:09.361259+08
6600	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:04:14.353956+08
6601	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:04:19.353204+08
6602	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:04:24.355984+08
6603	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:04:29.361273+08
6604	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:04:34.312688+08
6605	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:04:34.367887+08
6606	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:04:39.348148+08
6607	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:04:44.358413+08
6608	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:04:49.363544+08
6609	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:04:54.349094+08
6610	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:04:59.357176+08
6611	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:05:04.324097+08
6612	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:05:04.50523+08
6613	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:05:09.355444+08
6614	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:05:14.349882+08
6615	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:05:19.35552+08
6616	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:05:24.356181+08
6617	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:05:29.372933+08
6618	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:05:34.30959+08
6619	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:05:34.357145+08
6620	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:05:39.35799+08
6621	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:05:44.351591+08
6622	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:05:49.354584+08
6623	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:05:54.350358+08
6624	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:05:59.347669+08
6625	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:06:04.31786+08
6626	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:06:04.44948+08
6627	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:06:09.35919+08
6628	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:06:14.348588+08
6629	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:06:19.357053+08
6630	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:06:24.363263+08
6631	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:06:29.356319+08
6632	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:06:34.311526+08
6633	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:06:34.357609+08
6634	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:06:39.354378+08
6635	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:06:44.35076+08
6636	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:06:49.380857+08
6637	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:06:54.348566+08
6638	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:06:59.355059+08
6639	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:07:04.299537+08
6640	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:07:04.347285+08
6641	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:07:09.361485+08
6642	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:07:14.35145+08
6643	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:07:19.361623+08
6644	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:07:24.358924+08
6645	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:07:29.357218+08
6646	user	user_c390f862-a82d-41ad-92af-7356235697a1	auth.refresh	user	user_c390f862-a82d-41ad-92af-7356235697a1	{"nextRefreshTokenId": "rt_74b4fee1-df96-4e8f-b731-b910823088e5", "previousRefreshTokenId": "rt_10b23e26-791b-461c-a243-2e1bac616a5a"}	2026-03-20 08:07:34.358958+08
6647	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:07:34.379316+08
6648	user	user_c390f862-a82d-41ad-92af-7356235697a1	auth.refresh	user	user_c390f862-a82d-41ad-92af-7356235697a1	{"nextRefreshTokenId": "rt_9a92622e-a999-40e6-883d-48c0e76a6d27", "previousRefreshTokenId": "rt_74b4fee1-df96-4e8f-b731-b910823088e5"}	2026-03-20 08:07:34.431391+08
6649	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:07:39.353178+08
6650	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:07:44.359279+08
6651	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:07:49.367214+08
6652	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:07:54.362354+08
6653	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:07:59.375444+08
6654	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:08:04.303618+08
6655	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:08:04.420561+08
6656	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:08:09.359991+08
6657	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:08:14.362325+08
6658	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:08:19.346109+08
6659	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:08:24.355757+08
6660	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:08:29.367737+08
6661	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:08:34.308017+08
6662	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:08:34.354555+08
6663	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:08:39.362024+08
6664	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:08:44.355806+08
6665	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:08:49.369388+08
6666	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:08:54.370605+08
6667	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:08:59.45021+08
6668	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:09:04.306361+08
6669	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:09:04.35273+08
6670	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:09:09.360016+08
6671	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:09:14.361818+08
6672	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:09:19.359966+08
6673	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:09:24.347821+08
6674	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:09:29.400623+08
6675	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:09:34.312437+08
6676	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:09:34.352642+08
6677	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:09:39.357062+08
6678	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:09:44.355698+08
6679	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:09:49.355595+08
6680	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:09:54.359253+08
6681	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:09:59.352489+08
6682	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:10:04.303417+08
6683	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:10:04.370209+08
6684	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:10:09.357778+08
6685	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:10:14.36002+08
6686	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:10:19.347787+08
6687	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:10:24.358988+08
6688	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:10:29.376366+08
6689	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:10:34.30261+08
6690	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:10:34.34805+08
6691	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:10:39.354441+08
6692	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:10:44.357993+08
6693	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:10:49.362483+08
6694	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:10:54.364903+08
6695	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:10:59.379293+08
6696	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:11:04.3083+08
6697	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:11:04.372184+08
6698	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:11:09.367654+08
6699	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:11:14.371379+08
6700	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:11:19.364075+08
6701	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:11:24.378052+08
6702	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:11:29.368883+08
6703	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:11:34.311537+08
6704	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:11:34.365263+08
6705	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:11:39.369745+08
6706	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:11:44.370908+08
6707	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:11:49.363806+08
6708	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:11:54.374757+08
6709	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:11:59.373271+08
6710	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:12:04.312944+08
6711	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:12:04.368639+08
6712	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:12:09.367375+08
6713	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:12:14.367595+08
6714	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:12:19.363224+08
6715	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:12:24.376686+08
6716	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:12:29.366281+08
6717	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:12:34.381261+08
6718	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:12:39.695691+08
6719	user	user_c390f862-a82d-41ad-92af-7356235697a1	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-03-20 08:12:44.414234+08
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, name, printers, selected_printer, created_at, last_seen_at, status, owner_user_id) FROM stdin;
1e4e3e2f-046f-4395-8123-d73c2af8e9b7	YEFTA	["OneNote (Desktop)", "Sipil (HP LaserJet MFP E72530)", "Microsoft Print to PDF", "HP LaserJet Professional P1102", "Fax", "Canon MG2500 series Printer", "Canon G1030 series"]	Canon G1030 series	2026-03-16 17:39:21.086+08	2026-03-20 08:12:44.687+08	offline	user_c390f862-a82d-41ad-92af-7356235697a1
cb358d0f-c500-4cf3-add8-89d4750f9cfd	DESKTOP-KF4KI8Q	["Microsoft XPS Document Writer", "Microsoft Print to PDF", "Fax"]	Microsoft Print to PDF	2026-03-19 19:39:15.192+08	2026-03-19 19:58:34.9+08	offline	\N
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, client_id, session_id, job_id, type, payload, created_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, session_id, original_name, stored_path, size_bytes, status, alias, paper_size, copies, created_at, updated_at, owner_user_id, claimed_by_client_id, claimed_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token_hash, user_agent, ip_address, created_at, expires_at, revoked_at, replaced_by_token_id) FROM stdin;
rt_61a6bb80-bef7-4fe6-bc9b-cabe6dbb1e6d	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	0e43f9a84494c64b6ad1b0092ac90718e82273b1ba3f032e1c697e0b7238db27	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-15 23:03:08.162985+08	2026-04-14 23:03:08.16+08	2026-03-15 23:03:13.844564+08	\N
rt_a68705f7-9b2b-44f1-b707-aef5c982ece1	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	e044b97c61c56fc5a3d2d397579914df7e27dcb258bd4b2e42594f85a8a8ac14	\N	::ffff:127.0.0.1	2026-03-15 23:05:31.3222+08	2026-04-14 23:05:31.321+08	2026-03-15 23:23:16.262527+08	rt_72d12eab-7880-4043-a26c-905cf6bc7463
rt_f3fa11c6-c84f-4b02-bb05-ba32ad2050e3	user_c390f862-a82d-41ad-92af-7356235697a1	3625ea59b1efb0d8225f6bbf5061dd4e393fcef74cf73e246988973ba3c85d2c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-15 23:03:20.503615+08	2026-04-14 23:03:20.502+08	2026-03-15 23:24:13.041623+08	rt_50e110c7-fb56-45b5-b383-679c2f806ae2
rt_50e110c7-fb56-45b5-b383-679c2f806ae2	user_c390f862-a82d-41ad-92af-7356235697a1	f994b7930e302a0c5e83910cec1b255782d8ceaa6f33ec87c99072c01316b4ab	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-15 23:24:13.037536+08	2026-04-14 23:24:13.035+08	2026-03-15 23:24:14.40235+08	\N
rt_72d12eab-7880-4043-a26c-905cf6bc7463	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	e499898ef7d39b113b697bf0a6c509f6b46f8888f116818f11323023781b92a0	\N	::ffff:127.0.0.1	2026-03-15 23:23:16.257417+08	2026-04-14 23:23:16.256+08	2026-03-15 23:27:30.035198+08	rt_cd488f50-3fbe-4a35-b6ac-3e080996b485
rt_cd488f50-3fbe-4a35-b6ac-3e080996b485	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	c7d1f88f2bed356ff3b78891aa1724010537f43aa99f5717570e12000aac5346	\N	::ffff:127.0.0.1	2026-03-15 23:27:30.031786+08	2026-04-14 23:27:30.03+08	2026-03-15 23:42:30.396565+08	rt_f5ce6fe0-8a40-4640-a5e7-1c93afe41d28
rt_f5ce6fe0-8a40-4640-a5e7-1c93afe41d28	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	1dfbfa8fb4d11ed9177da168d3e16ef1238725e94de01aa0f77b645f350f9ec5	\N	::ffff:127.0.0.1	2026-03-15 23:42:30.392058+08	2026-04-14 23:42:30.39+08	2026-03-15 23:42:30.481667+08	rt_b68bbf26-bc30-4f4a-ad06-ca8d682a4c1c
rt_86ae75e8-2202-41ca-a92c-4f4beb0209d9	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	fe08aeac9f92b67ece222d68fe896e276c4e968abb4d5d34d6cff1e538993ba7	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-15 23:24:22.712044+08	2026-04-14 23:24:22.711+08	2026-03-16 10:51:45.311995+08	rt_89243d91-8189-45e9-9813-66a34d76c412
rt_ec0bd3e2-a703-4ea6-8742-499601cda411	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	08d0ea503626573b2502bc411a3b0c4b7119c739f29906c13fab297f31ead1f4	Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26200; en-ID) PowerShell/7.5.5	::1	2026-03-16 10:53:17.292021+08	2026-04-15 10:53:17.29+08	\N	\N
rt_89243d91-8189-45e9-9813-66a34d76c412	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	f76f85201703715766743b2def839a49998e54e6b2602c0eadc428efb3268b40	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-16 10:51:45.273811+08	2026-04-15 10:51:45.247+08	2026-03-16 13:07:40.795968+08	rt_6e925ff8-2a17-4767-b5b9-2b4123b3e8e2
rt_b68bbf26-bc30-4f4a-ad06-ca8d682a4c1c	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	63d1b8d0dcacd47d9467d5608667c0b2b4d78561dcc2df33bc7ed1964225572b	\N	::ffff:127.0.0.1	2026-03-15 23:42:30.478858+08	2026-04-14 23:42:30.477+08	2026-03-16 14:20:04.250067+08	rt_7f48b2f4-8a3c-41f0-bee1-e52a95aafa1f
rt_6e925ff8-2a17-4767-b5b9-2b4123b3e8e2	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	9dcda282932f818eb731ef2ff223cbfe4ae12fba4d1f0000ae038ba48dfc3949	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-16 13:07:40.768889+08	2026-04-15 13:07:40.752+08	2026-03-16 14:20:49.237668+08	rt_390bcb30-334a-4f7a-a1fa-19d724343d98
rt_390bcb30-334a-4f7a-a1fa-19d724343d98	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	443c75cce20e9615eb312da02f5e383d5e2841c388c9991adc93674831dfafbc	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-16 14:20:49.23246+08	2026-04-15 14:20:49.231+08	2026-03-16 16:59:12.734579+08	rt_3c14e81d-d912-4c51-8d14-d2a101510e1a
rt_7f48b2f4-8a3c-41f0-bee1-e52a95aafa1f	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	085587095b186a6bb88dd6d819040311a7a036055838b9574345f2857515c853	\N	::ffff:127.0.0.1	2026-03-16 14:20:04.235325+08	2026-04-15 14:20:04.233+08	2026-03-16 17:00:08.614739+08	rt_0acf1f4a-1874-45e2-b09c-823ff5416565
rt_0acf1f4a-1874-45e2-b09c-823ff5416565	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	6dd7f602f709ea0afcf347912255393067fa6aa2658bc3c8932c65d570713237	\N	::ffff:127.0.0.1	2026-03-16 17:00:08.612202+08	2026-04-15 17:00:08.611+08	2026-03-16 17:35:12.822202+08	rt_95dd96c4-2879-4c41-9133-27f736ee0708
rt_04f0f8f5-b2f6-4d9c-90a5-5bedf38ffe05	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	d52908de9fe533abbc3205a4b929e8a248162e6246f1ac708da94e2b16acc377	\N	::ffff:127.0.0.1	2026-03-16 17:37:58.187515+08	2026-04-15 17:37:58.185+08	\N	\N
rt_95dd96c4-2879-4c41-9133-27f736ee0708	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	ed2177d8a0f9adf9fbaf2e53a1c0cd391e5d7ded3d9da15b8452864188d3494c	\N	::ffff:127.0.0.1	2026-03-16 17:35:12.816365+08	2026-04-15 17:35:12.809+08	2026-03-16 17:37:58.199227+08	rt_04f0f8f5-b2f6-4d9c-90a5-5bedf38ffe05
rt_dbed1bdb-b289-4590-a2e2-d4d713f9dc65	user_c390f862-a82d-41ad-92af-7356235697a1	41f60f185db63e77be22e02b57529cc4fe98f72ab7c50f82564708e97eec0a2b	\N	::ffff:127.0.0.1	2026-03-16 17:38:15.053947+08	2026-04-15 17:38:15.052+08	2026-03-16 17:38:24.840592+08	rt_e0e704f1-4d52-4ff3-ab93-574213321fad
rt_4f201666-9456-458e-bf9c-bfa1e3ac6af6	user_c390f862-a82d-41ad-92af-7356235697a1	c9a6c39620a80d56500dfb3a40de14f35d9e49a298ef7571226221ab6f7a5f02	\N	::ffff:127.0.0.1	2026-03-16 17:39:20.984746+08	2026-04-15 17:39:20.983+08	\N	\N
rt_e0e704f1-4d52-4ff3-ab93-574213321fad	user_c390f862-a82d-41ad-92af-7356235697a1	38f5c268f2dd19b48ad5fac21d807c7013b0695107a81347a7715f73a65a044d	\N	::ffff:127.0.0.1	2026-03-16 17:38:24.838331+08	2026-04-15 17:38:24.837+08	2026-03-16 17:39:20.990998+08	rt_4f201666-9456-458e-bf9c-bfa1e3ac6af6
rt_13be67c0-6761-4573-aabd-27695628706c	user_decb07e3-290e-4880-bbb4-d4507a370982	ffab08513369776ef57f17ac4cb6cc39bb594fe32ba9ed80753483580d1dddcc	\N	::ffff:192.168.1.247	2026-03-19 19:39:51.864835+08	2026-04-18 19:39:51.863+08	\N	\N
rt_4b152aee-a609-495b-9025-8527e364836a	user_c390f862-a82d-41ad-92af-7356235697a1	bb8922786805a3dd3c09aae2986809b0653b5779ca7d73435cde598ec834da96	\N	::ffff:127.0.0.1	2026-03-19 19:40:11.932496+08	2026-04-18 19:40:11.931+08	\N	\N
rt_aaff75da-0ecd-433d-877d-fdc0b9bdccac	user_c390f862-a82d-41ad-92af-7356235697a1	b141375d7cb612e60d2183de32f02f24324aa365808bc7ffcc338b774cbab6cd	\N	::ffff:127.0.0.1	2026-03-16 17:39:38.376604+08	2026-04-15 17:39:38.375+08	2026-03-19 19:40:11.93584+08	rt_4b152aee-a609-495b-9025-8527e364836a
rt_3c14e81d-d912-4c51-8d14-d2a101510e1a	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	de51e83ed62bbb23aa7bcb4ebb0064199b5cd33733c06f19219f39fdfe8461ff	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-16 16:59:12.721587+08	2026-04-15 16:59:12.719+08	2026-03-19 19:41:37.830568+08	rt_b62f75c4-2ac8-4bb5-9d46-c2adb91d430e
rt_b62f75c4-2ac8-4bb5-9d46-c2adb91d430e	user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	86f5829403cbd5987208528c482b85bcb047ace38d2c528cc6444be96fbe0917	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	::1	2026-03-19 19:41:37.809861+08	2026-04-18 19:41:37.808+08	2026-03-19 19:41:42.577686+08	\N
rt_0e62be13-4cc2-4231-bc04-05f80bf8bc99	user_decb07e3-290e-4880-bbb4-d4507a370982	36a0330a86cad5d4249fafb64d77f69e3339d8b0b74886ff126733af6357cbab	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	::ffff:192.168.1.247	2026-03-19 19:39:37.818158+08	2026-04-18 19:39:37.816+08	2026-03-19 19:58:25.368788+08	rt_c742412f-e812-4ee6-9873-503c0ac5a12c
rt_39a61a5a-c7c3-472d-a8cc-f6ff92e7b09f	user_c390f862-a82d-41ad-92af-7356235697a1	f08b79f3bcebb5768b8a6a5f5740a97fcb98ae2056856a38544693f4f8ff8dd0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	::1	2026-03-19 19:41:50.593621+08	2026-04-18 19:41:50.592+08	\N	\N
rt_0ef60ed5-192a-4033-9d39-f5b6a3850f26	user_c390f862-a82d-41ad-92af-7356235697a1	92970b8f731775cda12cc09520539b83dc85f6517198e3875aa69f3b509e85cf	\N	::ffff:192.168.1.247	2026-03-19 19:47:32.647807+08	2026-04-18 19:47:32.646+08	\N	\N
rt_1701ce26-adde-4510-bb17-e14009444a7a	user_c390f862-a82d-41ad-92af-7356235697a1	eb7d0a44033595b1964c98d8c91f879fd20f3dff305d93878545a71788ec1523	\N	::ffff:192.168.1.247	2026-03-19 19:47:59.24955+08	2026-04-18 19:47:59.248+08	\N	\N
rt_a664e89f-3a51-460c-b200-297a0dea1a2f	user_decb07e3-290e-4880-bbb4-d4507a370982	7c39a4b046348f7e3021e974426e14aa41b279ac7427d6f9bd2de1c44c5c779d	\N	::ffff:192.168.1.247	2026-03-19 19:49:34.068783+08	2026-04-18 19:49:34.068+08	\N	\N
rt_0816bed6-9e09-4875-b384-1ebe22bb2b2e	user_c390f862-a82d-41ad-92af-7356235697a1	adbbf4e123b92ece656912f1838402d34c8c77274a8076201aa34ed4ac5fcaaa	\N	::ffff:127.0.0.1	2026-03-19 19:49:48.434838+08	2026-04-18 19:49:48.433+08	\N	\N
rt_46e4e28a-5b3f-428a-bc51-dd85bbf49640	user_decb07e3-290e-4880-bbb4-d4507a370982	bd67ddbd73c26385808b61b4a7fe89d269fa2b04f4c87749454531f01fcd8ce3	\N	::ffff:127.0.0.1	2026-03-19 19:50:03.889991+08	2026-04-18 19:50:03.888+08	\N	\N
rt_edba171b-947c-4632-a1a8-acd4351d7d18	user_decb07e3-290e-4880-bbb4-d4507a370982	1b2410284b3a14827832f2f94e22a8055cf6c9c2d1f0ff60213ad949892a5561	\N	::ffff:192.168.1.247	2026-03-19 19:56:44.72813+08	2026-04-18 19:56:44.726+08	\N	\N
rt_9e050cbc-011e-4072-99a4-1be820af0894	user_decb07e3-290e-4880-bbb4-d4507a370982	a09a6b147f1b1817ab08c37191e07e1c90ce94aa2078e4edfcc0e4e2db1403ec	\N	::ffff:192.168.1.247	2026-03-19 19:56:07.168805+08	2026-04-18 19:56:07.167+08	2026-03-19 19:56:44.732167+08	rt_edba171b-947c-4632-a1a8-acd4351d7d18
rt_25c84b22-35e4-45d6-ad28-2498d9bb46ee	user_decb07e3-290e-4880-bbb4-d4507a370982	0a74e17d9dce4e7f9448263f5945ed73a03d14f1db14f8eca2827f523353e71b	\N	::ffff:127.0.0.1	2026-03-19 19:57:07.775407+08	2026-04-18 19:57:07.773+08	\N	\N
rt_c742412f-e812-4ee6-9873-503c0ac5a12c	user_decb07e3-290e-4880-bbb4-d4507a370982	0c2b8f5ea2c36a4756d70e77ba3eb676b246a97381fe0fe8d566c029f64160a4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	::ffff:192.168.1.247	2026-03-19 19:58:25.346889+08	2026-04-18 19:58:25.345+08	\N	\N
rt_45cdaa8d-35ee-4ae4-b838-e3064d7beed7	user_c390f862-a82d-41ad-92af-7356235697a1	b9ab84bc69bcc73f81ed2939d9fd54b98c9cc9e67d05627d4503fc606294f820	\N	::ffff:127.0.0.1	2026-03-20 07:37:33.272012+08	2026-04-19 07:37:33.271+08	2026-03-20 07:52:34.347377+08	rt_d742a2a0-fb51-4dcf-b09c-1ba944994221
rt_d742a2a0-fb51-4dcf-b09c-1ba944994221	user_c390f862-a82d-41ad-92af-7356235697a1	a754ba483c476064e739363faa5cd2fd51f8c40d26b54a90608a10b34b8b6010	\N	::ffff:127.0.0.1	2026-03-20 07:52:34.344477+08	2026-04-19 07:52:34.343+08	2026-03-20 07:52:34.502837+08	rt_10b23e26-791b-461c-a243-2e1bac616a5a
rt_10b23e26-791b-461c-a243-2e1bac616a5a	user_c390f862-a82d-41ad-92af-7356235697a1	a0b3fd18f47861ee36b0ca9a71c3458640adcc9ce55fa3b4662e7e211e8cf288	\N	::ffff:127.0.0.1	2026-03-20 07:52:34.500134+08	2026-04-19 07:52:34.499+08	2026-03-20 08:07:34.356682+08	rt_74b4fee1-df96-4e8f-b731-b910823088e5
rt_9a92622e-a999-40e6-883d-48c0e76a6d27	user_c390f862-a82d-41ad-92af-7356235697a1	cd6e580ccf44173dadbfd1c3fb90f55aa343e79557a1d6537ce43709dce9604f	\N	::ffff:127.0.0.1	2026-03-20 08:07:34.425434+08	2026-04-19 08:07:34.424+08	\N	\N
rt_74b4fee1-df96-4e8f-b731-b910823088e5	user_c390f862-a82d-41ad-92af-7356235697a1	b69b3322fe96cf541cdc9b2620315bb80d4670587e67590a6fc07e1b727cc995	\N	::ffff:127.0.0.1	2026-03-20 08:07:34.330432+08	2026-04-19 08:07:34.329+08	2026-03-20 08:07:34.427602+08	rt_9a92622e-a999-40e6-883d-48c0e76a6d27
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, client_id, alias, created_at, last_seen_at, status, owner_user_id) FROM stdin;
\.


--
-- Data for Name: storage_usage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storage_usage (id, total_bytes, file_count, computed_at) FROM stdin;
t	0	0	2026-03-21 10:58:48.678934+08
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, role, created_at, username, pin_hash) FROM stdin;
user_decb07e3-290e-4880-bbb4-d4507a370982	\N	$2b$12$NfXAJsF6xD75v0E9SIQa6u4XwzYcmys0IoA0Y0.5R02R//FTUEr3e	user	2026-03-19 19:39:37.779315+08	agus	$2b$12$Fk6YP3NZRen1iuoY5fpujO2R9hTk3pR7XpnY3fK9oOAAPuExcAnq6
user_3531e328-7fa7-45f3-bdb6-687f8fb72af6	\N	$2b$12$0UBAeQFKxHredgtzpPmynezZ5nirWmPdMZ5qLowYG2FRGnKRAk40u	admin	2026-03-15 23:03:08.113805+08	shiroko	\N
user_c390f862-a82d-41ad-92af-7356235697a1	\N	$2b$12$svsGVSasTpFvX2E56X0S6O0mfVfM7QZN7s7kKtqF0ndtLZp0MwgG.	user	2026-03-15 23:03:20.495464+08	yefta	$2b$12$oopIEs1SnyOc8FuYnnkPjeKSzs3rcoMkgIoYxXNFm3DlbLEcJZcNC
\.


--
-- Data for Name: websocket_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.websocket_subscriptions (id, client_id, user_id, channel, connected_at) FROM stdin;
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 6719, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_id_seq', 369, true);


--
-- Name: api_keys api_keys_key_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_hash_key UNIQUE (key_hash);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: storage_usage storage_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storage_usage
    ADD CONSTRAINT storage_usage_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: websocket_subscriptions websocket_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.websocket_subscriptions
    ADD CONSTRAINT websocket_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: idx_clients_last_seen; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_last_seen ON public.clients USING btree (last_seen_at);


--
-- Name: idx_clients_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_name ON public.clients USING btree (name);


--
-- Name: idx_clients_owner_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_owner_user ON public.clients USING btree (owner_user_id);


--
-- Name: idx_events_client_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_client_created ON public.events USING btree (client_id, created_at DESC);


--
-- Name: idx_events_job; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_job ON public.events USING btree (job_id);


--
-- Name: idx_events_type_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_type_created ON public.events USING btree (type, created_at DESC);


--
-- Name: idx_jobs_claimed_by_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_claimed_by_client_id ON public.jobs USING btree (claimed_by_client_id);


--
-- Name: idx_jobs_created_desc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_created_desc ON public.jobs USING btree (created_at DESC);


--
-- Name: idx_jobs_owner_status_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_owner_status_created ON public.jobs USING btree (owner_user_id, status, created_at DESC);


--
-- Name: idx_jobs_owner_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_owner_user ON public.jobs USING btree (owner_user_id);


--
-- Name: idx_jobs_ready_pending; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_ready_pending ON public.jobs USING btree (status) WHERE ((status)::text = ANY ((ARRAY['ready'::character varying, 'pending'::character varying])::text[]));


--
-- Name: idx_jobs_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_session ON public.jobs USING btree (session_id);


--
-- Name: idx_jobs_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_status ON public.jobs USING btree (status);


--
-- Name: idx_refresh_tokens_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_expires ON public.refresh_tokens USING btree (expires_at);


--
-- Name: idx_refresh_tokens_revoked; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_revoked ON public.refresh_tokens USING btree (revoked_at);


--
-- Name: idx_refresh_tokens_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_user ON public.refresh_tokens USING btree (user_id);


--
-- Name: idx_sessions_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_client ON public.sessions USING btree (client_id);


--
-- Name: idx_sessions_last_seen; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_last_seen ON public.sessions USING btree (last_seen_at);


--
-- Name: idx_sessions_owner_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_owner_user ON public.sessions USING btree (owner_user_id);


--
-- Name: idx_users_username_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_users_username_unique ON public.users USING btree (lower((username)::text)) WHERE (username IS NOT NULL);


--
-- Name: api_keys api_keys_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: clients clients_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: events events_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: events events_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;


--
-- Name: events events_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE SET NULL;


--
-- Name: jobs jobs_claimed_by_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_claimed_by_client_id_fkey FOREIGN KEY (claimed_by_client_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: jobs jobs_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: jobs jobs_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_replaced_by_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_replaced_by_token_id_fkey FOREIGN KEY (replaced_by_token_id) REFERENCES public.refresh_tokens(id) ON DELETE SET NULL;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: websocket_subscriptions websocket_subscriptions_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.websocket_subscriptions
    ADD CONSTRAINT websocket_subscriptions_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: websocket_subscriptions websocket_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.websocket_subscriptions
    ADD CONSTRAINT websocket_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict van7OPWFzi7raG6wmGctXkuIUgntkte3cAjbaT8o37GOkCbYi49UzTNWIdz4tzi

