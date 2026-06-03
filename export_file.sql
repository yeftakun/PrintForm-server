--
-- PostgreSQL database dump
--

\restrict aaJElJjtQqZ3YCwUF8mKx72ajBStu9hfjfctfBuJzpe0cwh59vbdezVxpgQV5HU

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
-- Name: admin_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_profiles (
    user_id text NOT NULL,
    nama_lengkap character varying(120),
    departemen character varying(50)
);


ALTER TABLE public.admin_profiles OWNER TO postgres;

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
-- Name: coupon_usages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupon_usages (
    id bigint NOT NULL,
    coupon_id text NOT NULL,
    order_id text NOT NULL,
    user_id text NOT NULL,
    plan_id text,
    discount_idr integer DEFAULT 0 NOT NULL,
    used_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT coupon_usages_discount_check CHECK ((discount_idr >= 0))
);


ALTER TABLE public.coupon_usages OWNER TO postgres;

--
-- Name: coupon_usages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.coupon_usages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coupon_usages_id_seq OWNER TO postgres;

--
-- Name: coupon_usages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coupon_usages_id_seq OWNED BY public.coupon_usages.id;


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    id text NOT NULL,
    code character varying(64) NOT NULL,
    name character varying(120),
    discount_type character varying(20) NOT NULL,
    discount_value integer DEFAULT 0 NOT NULL,
    max_discount_idr integer,
    min_order_amount_idr integer DEFAULT 0 NOT NULL,
    applies_to_plan_id text,
    usage_limit integer,
    usage_limit_per_user integer,
    starts_at timestamp with time zone,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT coupons_discount_type_check CHECK (((discount_type)::text = ANY ((ARRAY['fixed_amount'::character varying, 'percent'::character varying, 'free'::character varying])::text[]))),
    CONSTRAINT coupons_discount_value_check CHECK ((discount_value >= 0)),
    CONSTRAINT coupons_min_order_check CHECK ((min_order_amount_idr >= 0))
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- Name: credit_usages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credit_usages (
    id bigint NOT NULL,
    user_id text NOT NULL,
    credit_id text,
    job_id text,
    amount integer DEFAULT 1 NOT NULL,
    usage_type character varying(32) DEFAULT 'job_print'::character varying NOT NULL,
    job_snapshot jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT credit_usages_amount_check CHECK ((amount > 0))
);


ALTER TABLE public.credit_usages OWNER TO postgres;

--
-- Name: credit_usages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.credit_usages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.credit_usages_id_seq OWNER TO postgres;

--
-- Name: credit_usages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.credit_usages_id_seq OWNED BY public.credit_usages.id;


--
-- Name: credits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credits (
    id text NOT NULL,
    user_id text NOT NULL,
    plan_id text,
    order_id text,
    source_type character varying(20) NOT NULL,
    total_credits integer NOT NULL,
    used_credits integer DEFAULT 0 NOT NULL,
    starts_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT credits_credit_check CHECK (((total_credits >= 0) AND (used_credits >= 0) AND (used_credits <= total_credits))),
    CONSTRAINT credits_source_type_check CHECK (((source_type)::text = ANY ((ARRAY['free'::character varying, 'subscription'::character varying, 'topup'::character varying, 'bonus'::character varying, 'refund'::character varying])::text[]))),
    CONSTRAINT credits_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'expired'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.credits OWNER TO postgres;

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
    claimed_at timestamp with time zone,
    color_mode character varying(20),
    orientation character varying(20),
    page_range character varying(50),
    content_scale integer DEFAULT 100,
    notes text,
    estimated_price integer DEFAULT 0 NOT NULL,
    file_status character varying(20) DEFAULT 'not available'::character varying NOT NULL
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: mitra_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mitra_profiles (
    user_id text NOT NULL,
    kode_toko character varying(64),
    alamat text,
    pin_hash text,
    konfigurasi_toko jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.mitra_profiles OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id text NOT NULL,
    user_id text NOT NULL,
    plan_id text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    subtotal_idr integer DEFAULT 0 NOT NULL,
    discount_idr integer DEFAULT 0 NOT NULL,
    total_idr integer DEFAULT 0 NOT NULL,
    coupon_id text,
    coupon_code character varying(64),
    status character varying(32) DEFAULT 'pending_payment'::character varying NOT NULL,
    payment_instruction text,
    payment_expires_at timestamp with time zone,
    activated_at timestamp with time zone,
    rejected_at timestamp with time zone,
    rejected_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT orders_amount_check CHECK (((subtotal_idr >= 0) AND (discount_idr >= 0) AND (total_idr >= 0))),
    CONSTRAINT orders_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['pending_payment'::character varying, 'waiting_verification'::character varying, 'paid'::character varying, 'rejected'::character varying, 'cancelled'::character varying, 'expired'::character varying])::text[])))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id text NOT NULL,
    user_id text NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: payment_proofs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_proofs (
    id text NOT NULL,
    order_id text NOT NULL,
    user_id text NOT NULL,
    original_name character varying(255) NOT NULL,
    stored_path text NOT NULL,
    mime_type character varying(128) NOT NULL,
    size_bytes bigint NOT NULL,
    status character varying(32) DEFAULT 'submitted'::character varying NOT NULL,
    user_note text,
    admin_note text,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone,
    CONSTRAINT payment_proofs_status_check CHECK (((status)::text = ANY ((ARRAY['submitted'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.payment_proofs OWNER TO postgres;

--
-- Name: plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plans (
    id text NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    plan_type character varying(20) NOT NULL,
    price_idr integer DEFAULT 0 NOT NULL,
    credits_per_unit integer DEFAULT 0 NOT NULL,
    duration_months integer DEFAULT 1 NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT plans_credits_check CHECK ((credits_per_unit >= 0)),
    CONSTRAINT plans_duration_check CHECK ((duration_months >= 0)),
    CONSTRAINT plans_plan_type_check CHECK (((plan_type)::text = ANY ((ARRAY['free'::character varying, 'subscription'::character varying, 'credit_pack'::character varying])::text[]))),
    CONSTRAINT plans_price_check CHECK ((price_idr >= 0))
);


ALTER TABLE public.plans OWNER TO postgres;

--
-- Name: preview_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.preview_files (
    id text NOT NULL,
    stored_name text NOT NULL,
    converted_name text,
    original_name character varying(255),
    mime_type character varying(128),
    size_bytes bigint,
    status character varying(16) DEFAULT 'pending'::character varying NOT NULL,
    conversion_error text,
    session_id text,
    job_id text,
    owner_user_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_seen_at timestamp with time zone,
    expires_at timestamp with time zone
);


ALTER TABLE public.preview_files OWNER TO postgres;

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
    alias character varying(80),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_seen_at timestamp with time zone NOT NULL,
    status character varying(16) DEFAULT 'active'::character varying NOT NULL,
    owner_user_id text
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: user_credit_balances; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.user_credit_balances AS
 SELECT user_id,
    COALESCE(sum(total_credits), (0)::bigint) AS total_credits,
    COALESCE(sum(used_credits), (0)::bigint) AS used_credits,
    COALESCE(sum((total_credits - used_credits)), (0)::bigint) AS remaining_credits,
    min(expires_at) FILTER (WHERE ((used_credits < total_credits) AND ((status)::text = 'active'::text) AND (starts_at <= now()) AND (expires_at > now()))) AS nearest_expiry_at
   FROM public.credits
  WHERE (((status)::text = 'active'::text) AND (starts_at <= now()) AND (expires_at > now()))
  GROUP BY user_id;


ALTER VIEW public.user_credit_balances OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email character varying(255),
    password_hash text,
    role character varying(32) DEFAULT 'mitra'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    username character varying(64)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: coupon_usages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages ALTER COLUMN id SET DEFAULT nextval('public.coupon_usages_id_seq'::regclass);


--
-- Name: credit_usages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_usages ALTER COLUMN id SET DEFAULT nextval('public.credit_usages_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Data for Name: admin_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_profiles (user_id, nama_lengkap, departemen) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, actor_type, actor_id, action, target_type, target_id, detail, created_at) FROM stdin;
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, name, printers, selected_printer, created_at, last_seen_at, status, owner_user_id) FROM stdin;
\.


--
-- Data for Name: coupon_usages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupon_usages (id, coupon_id, order_id, user_id, plan_id, discount_idr, used_at) FROM stdin;
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, code, name, discount_type, discount_value, max_discount_idr, min_order_amount_idr, applies_to_plan_id, usage_limit, usage_limit_per_user, starts_at, expires_at, is_active, created_at, updated_at) FROM stdin;
coupon_79c37fde-056e-4fd8-a568-d6cf3b5b4b18	TESAWAL	Kupon Tes	percent	100	20000	0	\N	300	1	2026-06-02 08:00:00+08	2026-06-13 07:59:59.999+08	t	2026-06-03 14:21:20.854017+08	2026-06-03 14:25:09.824053+08
coupon_8d9ab36b-81bc-4712-8ada-6072c2b82ab5	AAA	\N	percent	100	13000	0	\N	2	1	2026-06-03 08:00:00+08	2026-06-04 07:59:59.999+08	t	2026-06-03 14:26:10.841282+08	2026-06-03 14:26:10.841282+08
\.


--
-- Data for Name: credit_usages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credit_usages (id, user_id, credit_id, job_id, amount, usage_type, job_snapshot, created_at) FROM stdin;
\.


--
-- Data for Name: credits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credits (id, user_id, plan_id, order_id, source_type, total_credits, used_credits, starts_at, expires_at, status, created_at) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, client_id, session_id, job_id, type, payload, created_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, session_id, original_name, stored_path, size_bytes, status, alias, paper_size, copies, created_at, updated_at, owner_user_id, claimed_by_client_id, claimed_at, color_mode, orientation, page_range, content_scale, notes, estimated_price, file_status) FROM stdin;
\.


--
-- Data for Name: mitra_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mitra_profiles (user_id, kode_toko, alamat, pin_hash, konfigurasi_toko) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, user_id, plan_id, quantity, subtotal_idr, discount_idr, total_idr, coupon_id, coupon_code, status, payment_instruction, payment_expires_at, activated_at, rejected_at, rejected_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, user_id, token_hash, expires_at, used_at, created_at) FROM stdin;
\.


--
-- Data for Name: payment_proofs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_proofs (id, order_id, user_id, original_name, stored_path, mime_type, size_bytes, status, user_note, admin_note, submitted_at, reviewed_at) FROM stdin;
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plans (id, code, name, plan_type, price_idr, credits_per_unit, duration_months, description, is_active, sort_order, created_at, updated_at) FROM stdin;
plan_free	free	Free	free	0	10	0	10 tugas per minggu untuk mencoba layanan PrintForm.	t	1	2026-05-28 18:05:39.246002+08	2026-05-28 18:05:39.246002+08
plan_starter_monthly	starter_monthly	Starter	subscription	13000	1000	1	1.000 tugas cetak per bulan.	t	2	2026-05-28 18:05:39.246002+08	2026-05-28 18:05:39.246002+08
plan_pro_monthly	pro_monthly	Pro	subscription	20000	2500	1	2.500 tugas cetak per bulan.	t	3	2026-05-28 18:05:39.246002+08	2026-05-28 18:05:39.246002+08
plan_credit_200	credit_200	Buy Credit	credit_pack	5000	200	4	200 kredit tugas, berlaku 4 bulan.	t	4	2026-05-28 18:05:39.246002+08	2026-05-28 18:05:39.246002+08
\.


--
-- Data for Name: preview_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.preview_files (id, stored_name, converted_name, original_name, mime_type, size_bytes, status, conversion_error, session_id, job_id, owner_user_id, created_at, last_seen_at, expires_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token_hash, user_agent, ip_address, created_at, expires_at, revoked_at, replaced_by_token_id) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, alias, created_at, last_seen_at, status, owner_user_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, role, created_at, username) FROM stdin;
user_e39c94fb-573b-486a-ab1a-7fbf96514929	yeftaasyel026@student.unsrat.ac.id	$2b$12$qTxV7UIvTD.9HX79Ja/HKuyVyx5IK42SwYpz5iaeJwPuIUzoXxByq	admin	2026-05-29 12:13:37.218672+08	yefta2
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: coupon_usages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coupon_usages_id_seq', 1, false);


--
-- Name: credit_usages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.credit_usages_id_seq', 1, false);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_id_seq', 1, false);


--
-- Name: admin_profiles admin_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_profiles
    ADD CONSTRAINT admin_profiles_pkey PRIMARY KEY (user_id);


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
-- Name: coupon_usages coupon_usages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: credit_usages credit_usages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_usages
    ADD CONSTRAINT credit_usages_pkey PRIMARY KEY (id);


--
-- Name: credits credits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_pkey PRIMARY KEY (id);


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
-- Name: mitra_profiles mitra_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mitra_profiles
    ADD CONSTRAINT mitra_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: payment_proofs payment_proofs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_proofs
    ADD CONSTRAINT payment_proofs_pkey PRIMARY KEY (id);


--
-- Name: plans plans_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_code_key UNIQUE (code);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: preview_files preview_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preview_files
    ADD CONSTRAINT preview_files_pkey PRIMARY KEY (id);


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
-- Name: idx_coupon_usages_coupon; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupon_usages_coupon ON public.coupon_usages USING btree (coupon_id);


--
-- Name: idx_coupon_usages_order_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_coupon_usages_order_unique ON public.coupon_usages USING btree (order_id);


--
-- Name: idx_coupon_usages_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupon_usages_user ON public.coupon_usages USING btree (user_id);


--
-- Name: idx_coupons_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupons_active ON public.coupons USING btree (is_active);


--
-- Name: idx_coupons_code_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_coupons_code_unique ON public.coupons USING btree (lower((code)::text));


--
-- Name: idx_credit_usages_credit; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_credit_usages_credit ON public.credit_usages USING btree (credit_id);


--
-- Name: idx_credit_usages_job_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_credit_usages_job_unique ON public.credit_usages USING btree (job_id) WHERE (job_id IS NOT NULL);


--
-- Name: idx_credit_usages_user_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_credit_usages_user_created ON public.credit_usages USING btree (user_id, created_at DESC);


--
-- Name: idx_credits_expiry; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_credits_expiry ON public.credits USING btree (expires_at);


--
-- Name: idx_credits_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_credits_order ON public.credits USING btree (order_id);


--
-- Name: idx_credits_user_active_expiry; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_credits_user_active_expiry ON public.credits USING btree (user_id, status, expires_at);


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
-- Name: idx_mitra_profiles_kode_toko_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_mitra_profiles_kode_toko_unique ON public.mitra_profiles USING btree (lower((kode_toko)::text)) WHERE (kode_toko IS NOT NULL);


--
-- Name: idx_orders_plan; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_plan ON public.orders USING btree (plan_id);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_user_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user_created ON public.orders USING btree (user_id, created_at DESC);


--
-- Name: idx_password_reset_tokens_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_tokens_expires ON public.password_reset_tokens USING btree (expires_at);


--
-- Name: idx_password_reset_tokens_used; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_tokens_used ON public.password_reset_tokens USING btree (used_at);


--
-- Name: idx_password_reset_tokens_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_tokens_user ON public.password_reset_tokens USING btree (user_id);


--
-- Name: idx_payment_proofs_order_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_payment_proofs_order_unique ON public.payment_proofs USING btree (order_id);


--
-- Name: idx_payment_proofs_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_proofs_status ON public.payment_proofs USING btree (status);


--
-- Name: idx_payment_proofs_user_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_proofs_user_created ON public.payment_proofs USING btree (user_id, submitted_at DESC);


--
-- Name: idx_preview_files_created_desc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_preview_files_created_desc ON public.preview_files USING btree (created_at DESC);


--
-- Name: idx_preview_files_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_preview_files_expires ON public.preview_files USING btree (expires_at);


--
-- Name: idx_preview_files_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_preview_files_session ON public.preview_files USING btree (session_id);


--
-- Name: idx_preview_files_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_preview_files_status ON public.preview_files USING btree (status);


--
-- Name: idx_preview_files_stored_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_preview_files_stored_name ON public.preview_files USING btree (stored_name);


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
-- Name: admin_profiles admin_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_profiles
    ADD CONSTRAINT admin_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: clients clients_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: coupon_usages coupon_usages_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE CASCADE;


--
-- Name: coupon_usages coupon_usages_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: coupon_usages coupon_usages_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE SET NULL;


--
-- Name: coupon_usages coupon_usages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: coupons coupons_applies_to_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_applies_to_plan_id_fkey FOREIGN KEY (applies_to_plan_id) REFERENCES public.plans(id) ON DELETE SET NULL;


--
-- Name: credit_usages credit_usages_credit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_usages
    ADD CONSTRAINT credit_usages_credit_id_fkey FOREIGN KEY (credit_id) REFERENCES public.credits(id) ON DELETE SET NULL;


--
-- Name: credit_usages credit_usages_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_usages
    ADD CONSTRAINT credit_usages_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;


--
-- Name: credit_usages credit_usages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_usages
    ADD CONSTRAINT credit_usages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: credits credits_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: credits credits_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE SET NULL;


--
-- Name: credits credits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


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
-- Name: mitra_profiles mitra_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mitra_profiles
    ADD CONSTRAINT mitra_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: orders orders_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE SET NULL;


--
-- Name: orders orders_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE RESTRICT;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payment_proofs payment_proofs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_proofs
    ADD CONSTRAINT payment_proofs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: payment_proofs payment_proofs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_proofs
    ADD CONSTRAINT payment_proofs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: preview_files preview_files_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preview_files
    ADD CONSTRAINT preview_files_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;


--
-- Name: preview_files preview_files_owner_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preview_files
    ADD CONSTRAINT preview_files_owner_user_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: preview_files preview_files_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preview_files
    ADD CONSTRAINT preview_files_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE SET NULL;


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
-- Name: sessions sessions_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict aaJElJjtQqZ3YCwUF8mKx72ajBStu9hfjfctfBuJzpe0cwh59vbdezVxpgQV5HU

