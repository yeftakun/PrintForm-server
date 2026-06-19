--
-- PostgreSQL database dump
--

\restrict eOF1k3CYzUZhUmezhfBDDI0eXfLwmLJ5a2IW6TW9QwMlafotiFlGVilzwfBBLg1

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
-- Name: installers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.installers (
    id character varying(64) NOT NULL,
    version character varying(64) NOT NULL,
    download_url text NOT NULL,
    label character varying(160),
    file_size_label character varying(32),
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.installers OWNER TO postgres;

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
1	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.register	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"role": "mitra", "email": "yeftakun34@gmail.com", "username": "yefta"}	2026-06-03 16:44:26.055411+08
2	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.login	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"identifier": "yefta"}	2026-06-03 16:44:47.896502+08
3	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.refresh	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"nextRefreshTokenId": "rt_ccc13035-64d4-498e-acbe-f22b6a3c4ba7", "previousRefreshTokenId": "rt_9329bfc9-f3c6-40c4-9835-bb20c8ccae77"}	2026-06-03 18:28:42.414446+08
4	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.logout	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"revokedCount": 1}	2026-06-03 20:29:25.259407+08
5	user	user_b507fe9b-d7c5-49d5-a493-1305909d41ec	auth.register	user	user_b507fe9b-d7c5-49d5-a493-1305909d41ec	{"role": "mitra", "email": null, "username": "yeftaasyel"}	2026-06-03 22:06:44.305321+08
6	user	user_b507fe9b-d7c5-49d5-a493-1305909d41ec	user.store_settings.updated	user	user_b507fe9b-d7c5-49d5-a493-1305909d41ec	{"hasKodeToko": true, "updatedStoreSettings": true}	2026-06-03 22:07:00.464698+08
7	user	user_b507fe9b-d7c5-49d5-a493-1305909d41ec	auth.refresh	user	user_b507fe9b-d7c5-49d5-a493-1305909d41ec	{"nextRefreshTokenId": "rt_58baf427-560d-4e3b-98ba-5d67f19afe35", "previousRefreshTokenId": "rt_f39e4afc-5e53-443b-9d6d-4b8285e9b1ab"}	2026-06-03 23:21:53.330119+08
8	user	user_b507fe9b-d7c5-49d5-a493-1305909d41ec	auth.logout	user	user_b507fe9b-d7c5-49d5-a493-1305909d41ec	{"revokedCount": 1}	2026-06-03 23:21:55.51779+08
9	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.login	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"identifier": "yefta"}	2026-06-05 15:39:24.487922+08
10	user	user_e39c94fb-573b-486a-ab1a-7fbf96514929	auth.login	user	user_e39c94fb-573b-486a-ab1a-7fbf96514929	{"identifier": "yefta2"}	2026-06-05 15:39:39.922623+08
11	user	user_e39c94fb-573b-486a-ab1a-7fbf96514929	billing.plan.updated	plan	plan_starter_monthly	{"code": "starter_monthly", "name": "Starter", "isActive": true, "planType": "subscription"}	2026-06-05 15:40:00.360053+08
12	user	user_e39c94fb-573b-486a-ab1a-7fbf96514929	billing.plan.updated	plan	plan_pro_monthly	{"code": "pro_monthly", "name": "Pro", "isActive": true, "planType": "subscription"}	2026-06-05 15:40:09.039495+08
13	user	user_e39c94fb-573b-486a-ab1a-7fbf96514929	billing.plan.updated	plan	plan_starter_monthly	{"code": "starter_monthly", "name": "Starter", "isActive": true, "planType": "subscription"}	2026-06-05 15:40:50.475031+08
14	client	\N	client.registered	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:20:35.363685+08
15	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:20:40.451769+08
16	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:20:45.432217+08
17	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.login	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"identifier": "yefta"}	2026-06-08 23:20:46.663152+08
18	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:20:50.447616+08
19	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	billing.order.created	order	ord_0e3cb5c0-26f2-4a31-aae4-4be3f86b0eda	{"planId": "plan_free", "status": "paid", "creditId": "cr_72e1af50-2c0e-4578-9c81-ea7a7cf69dc2", "quantity": 1, "totalIdr": 0, "couponCode": null}	2026-06-08 23:20:54.1591+08
20	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:20:55.481695+08
21	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:21:00.456684+08
22	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:21:05.413536+08
23	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:21:05.442345+08
24	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	user.store_settings.updated	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"hasKodeToko": true, "updatedStoreSettings": true}	2026-06-08 23:21:09.198004+08
25	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:21:10.441291+08
26	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:21:15.438593+08
27	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:21:20.446644+08
28	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:21:25.442778+08
29	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:21:26.582568+08
30	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.paired	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"identifier": "yefta", "handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "nextOwnerUserId": "user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec", "previousOwnerUserId": null}	2026-06-08 23:21:27.126056+08
31	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:21:27.15215+08
32	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:21:30.454005+08
33	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:21:35.635557+08
34	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:21:40.449303+08
35	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.logout	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"revokedCount": 1}	2026-06-08 23:21:44.299798+08
36	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:21:45.508882+08
37	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:21:50.902538+08
38	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:21:55.45175+08
39	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:22:00.545176+08
40	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:22:05.426151+08
41	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:22:10.694181+08
42	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.login	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"identifier": "yefta"}	2026-06-08 23:22:10.801424+08
43	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:22:15.457718+08
44	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	user.store_settings.updated	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"hasKodeToko": true, "updatedStoreSettings": true}	2026-06-08 23:22:18.238372+08
45	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:22:20.489832+08
46	system	\N	session.created	session	session_1780932142376_xobxik	{"alias": null, "ownerUserId": "user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec", "targetSource": "store-code", "selectedClientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "availabilitySource": "realtime-connected"}	2026-06-08 23:22:22.412896+08
47	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:22:25.464994+08
48	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:22:30.441029+08
49	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:22:35.44101+08
50	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:22:40.461032+08
51	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:22:45.455472+08
52	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:22:50.458897+08
53	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:22:55.467499+08
54	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:23:00.531682+08
55	system	\N	session.closed	session	session_1780932142376_xobxik	{"ownerUserId": "user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec", "removedJobs": 0, "removedFiles": 0}	2026-06-08 23:23:01.792003+08
56	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:23:05.425857+08
57	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-08 23:23:05.448668+08
58	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:43:00.633609+08
59	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:43:05.747322+08
60	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:43:07.700358+08
61	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.paired	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"identifier": "yefta", "handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "nextOwnerUserId": "user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec", "previousOwnerUserId": "user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec"}	2026-06-09 00:43:08.708512+08
62	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:43:08.776908+08
63	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:43:10.74967+08
64	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:43:15.745822+08
65	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:43:20.743951+08
66	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.logout	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"revokedCount": 1}	2026-06-09 00:43:20.784181+08
67	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:43:25.758807+08
68	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:43:30.876182+08
69	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:43:36.080319+08
70	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:43:41.003477+08
71	system	\N	session.created	session	session_1780937022785_eplbrq	{"alias": null, "ownerUserId": "user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec", "targetSource": "store-code", "selectedClientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "availabilitySource": "realtime-connected"}	2026-06-09 00:43:42.800575+08
72	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:43:45.741782+08
73	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:43:50.746639+08
74	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:43:55.739573+08
75	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:44:00.730284+08
76	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:44:06.013614+08
77	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:44:10.737628+08
78	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:44:15.734586+08
79	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:44:20.757096+08
80	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:44:25.741612+08
81	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:44:30.724491+08
82	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:44:35.818273+08
83	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:44:40.749796+08
84	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:44:45.758082+08
85	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:50:06.296732+08
86	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:50:10.739742+08
87	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:50:15.736734+08
88	system	\N	session.created	session	session_1780937417795_lmbhmu	{"alias": null, "ownerUserId": "user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec", "targetSource": "store-code", "selectedClientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "availabilitySource": "realtime-connected"}	2026-06-09 00:50:17.826302+08
89	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:50:20.741515+08
90	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:50:25.744219+08
91	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:50:30.72993+08
92	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:50:36.526439+08
93	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:50:40.748001+08
94	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:50:45.755874+08
95	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:50:50.741019+08
96	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:50:55.744559+08
97	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:51:00.724344+08
98	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:51:05.748493+08
99	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:51:10.74478+08
100	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:51:15.74278+08
101	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:51:20.812743+08
102	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:51:25.770112+08
103	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:51:30.716819+08
104	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:51:35.746509+08
105	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:51:40.801206+08
106	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:51:45.850834+08
107	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:51:50.757647+08
108	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:51:55.767753+08
109	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:52:00.741215+08
110	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:52:05.745941+08
111	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:52:10.739468+08
112	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:52:15.746365+08
113	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:52:20.805418+08
114	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:52:25.790231+08
115	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:52:30.758881+08
116	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:52:35.742431+08
117	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:52:40.765582+08
118	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:52:45.746271+08
119	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:52:50.741218+08
120	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:52:55.745801+08
121	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:53:00.738861+08
122	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:53:05.746612+08
123	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:53:10.923766+08
124	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:53:16.120162+08
125	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:53:20.767246+08
126	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:53:25.754954+08
127	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:53:30.74484+08
128	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:53:35.768958+08
129	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:53:40.742792+08
130	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 00:53:45.770662+08
131	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.refresh	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"nextRefreshTokenId": "rt_a8dd16c9-3ed8-4c3e-bd22-1108dade2707", "previousRefreshTokenId": "rt_e19388a6-f85f-4a13-ad9e-09214ee1a9f9"}	2026-06-09 01:03:45.426099+08
132	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.refresh	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"nextRefreshTokenId": "rt_4d102ce1-b854-4187-b941-278f98e9e344", "previousRefreshTokenId": "rt_a8dd16c9-3ed8-4c3e-bd22-1108dade2707"}	2026-06-09 01:03:46.163239+08
133	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:03:46.237501+08
134	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:03:50.769479+08
135	system	\N	session.created	session	session_1780938231304_3q1eqp	{"alias": null, "ownerUserId": "user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec", "targetSource": "store-code", "selectedClientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "availabilitySource": "realtime-connected"}	2026-06-09 01:03:51.379123+08
136	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:03:55.752215+08
137	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:04:00.810928+08
138	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:04:05.813669+08
139	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:04:10.771351+08
140	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:04:15.770095+08
141	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:04:20.759291+08
142	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:05:07.171822+08
143	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:05:10.779232+08
144	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:05:15.798268+08
145	system	\N	session.created	session	session_1780938320035_2rtuwg	{"alias": null, "ownerUserId": "user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec", "targetSource": "store-code", "selectedClientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "availabilitySource": "realtime-connected"}	2026-06-09 01:05:20.057172+08
146	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:05:21.299649+08
147	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:05:25.809149+08
148	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:05:30.931118+08
149	system	\N	session.closed	session	session_1780938320035_2rtuwg	{"ownerUserId": "user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec", "removedJobs": 0, "removedFiles": 0}	2026-06-09 01:05:34.800688+08
150	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:05:36.003638+08
151	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:05:40.761462+08
152	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:05:45.810238+08
153	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:05:50.758088+08
154	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:05:55.800745+08
155	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:06:00.764022+08
156	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:06:05.796354+08
157	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:06:11.251038+08
158	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:06:15.763504+08
159	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:06:46.077819+08
160	system	\N	session.created	session	session_1780938410225_uyk1iw	{"alias": null, "ownerUserId": "user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec", "targetSource": "store-code", "selectedClientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "availabilitySource": "realtime-connected"}	2026-06-09 01:06:50.261083+08
161	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:06:51.048029+08
162	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:06:55.780918+08
163	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:07:00.760101+08
164	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:07:06.545414+08
165	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:07:10.769075+08
166	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:07:15.771493+08
167	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:07:20.751427+08
168	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:07:25.758562+08
169	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:07:30.732385+08
170	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:07:30.759024+08
171	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:07:35.761185+08
172	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:07:40.766107+08
173	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:07:45.764837+08
174	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:07:50.758863+08
175	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:07:55.761685+08
176	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:08:00.740515+08
177	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:08:05.755534+08
178	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:08:10.763814+08
179	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:08:15.756626+08
180	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:08:20.761387+08
181	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:08:25.767674+08
182	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:08:30.716229+08
183	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:08:30.746726+08
184	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:08:35.750076+08
185	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:08:40.802181+08
186	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:08:45.771987+08
187	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:08:50.755353+08
188	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:08:55.836514+08
189	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:09:00.746701+08
190	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:09:05.794188+08
191	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:09:10.775262+08
192	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:09:15.757357+08
193	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:09:20.765401+08
194	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:09:25.758153+08
195	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:09:30.727991+08
196	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:09:30.762296+08
197	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:09:35.750725+08
198	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:09:40.758757+08
199	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:09:45.748893+08
200	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:09:50.749193+08
201	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:09:55.754533+08
202	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:10:00.725688+08
203	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:10:00.750322+08
204	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:10:05.765231+08
205	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:10:10.755609+08
206	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:10:15.760461+08
207	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:10:20.769062+08
208	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:10:25.761053+08
209	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:10:30.756223+08
210	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:10:35.75479+08
211	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:10:40.913547+08
212	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:10:45.767026+08
213	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:10:50.755165+08
214	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:10:55.89427+08
215	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:11:00.72204+08
216	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:11:00.749036+08
217	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:11:05.751622+08
218	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:11:10.762072+08
219	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:11:15.762873+08
220	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:11:20.768736+08
221	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:11:25.776103+08
222	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:11:30.721305+08
223	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:11:30.742252+08
224	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:11:35.754502+08
225	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:11:40.754691+08
226	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:11:45.753345+08
227	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:11:50.763132+08
228	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:11:55.763653+08
229	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:12:00.728291+08
230	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:12:00.757197+08
231	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:12:05.752166+08
232	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:12:10.759511+08
233	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:12:15.752155+08
234	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:12:24.151481+08
235	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:12:25.758427+08
236	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:12:30.738958+08
237	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:12:30.766162+08
238	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:12:35.772681+08
239	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:12:40.761737+08
240	system	\N	session.created	session	session_1780938762454_tm2mzg	{"alias": null, "ownerUserId": "user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec", "targetSource": "store-code", "selectedClientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "availabilitySource": "realtime-connected"}	2026-06-09 01:12:42.470822+08
241	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:12:45.765342+08
242	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:12:50.754215+08
243	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:12:55.758138+08
244	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:13:00.832447+08
245	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:13:05.761998+08
246	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:13:10.767076+08
247	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:13:15.75198+08
248	system	\N	session.closed	session	session_1780938762454_tm2mzg	{"ownerUserId": "user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec", "removedJobs": 0, "removedFiles": 0}	2026-06-09 01:13:22.098279+08
249	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:13:22.561395+08
250	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:13:25.785615+08
251	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-09 01:13:30.759118+08
252	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.login	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"identifier": "yefta"}	2026-06-17 15:09:59.655478+08
253	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.refresh	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"nextRefreshTokenId": "rt_fd281bcf-157e-4a08-9af4-3751b84a7e8e", "previousRefreshTokenId": "rt_7c29870b-f9ad-4236-a132-a863a7f054e4"}	2026-06-17 15:34:52.638715+08
254	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.logout	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"revokedCount": 1}	2026-06-17 15:34:54.95292+08
255	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:36:26.231242+08
256	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:36:31.227163+08
257	client	\N	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:36:31.710062+08
258	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.paired	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"identifier": "yefta", "handoverGuard": {"jobsReowned": 0, "jobsDetached": 0, "claimsReleased": 0, "sessionsReowned": 0, "sessionsDetached": 0}, "nextOwnerUserId": "user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec", "previousOwnerUserId": "user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec"}	2026-06-17 16:36:31.988574+08
259	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:36:32.033414+08
260	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:36:36.285905+08
261	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:36:41.278785+08
262	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:36:46.27742+08
263	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:36:51.300753+08
264	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:36:56.652636+08
265	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:37:01.713875+08
266	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.login	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"identifier": "yefta"}	2026-06-17 16:37:01.715571+08
267	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:37:06.28102+08
268	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:37:11.281571+08
269	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:37:16.290565+08
270	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:37:21.548245+08
271	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:37:26.319625+08
272	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:37:31.284891+08
273	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:37:36.281756+08
274	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:37:41.282028+08
275	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:37:46.29116+08
276	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	billing.order.created	order	ord_df389617-fd1a-496c-90c9-6fe264ff2b5a	{"planId": "plan_free", "status": "paid", "creditId": "cr_9ce9b745-31ec-4ed0-bb0b-cd862007bee8", "quantity": 1, "totalIdr": 0, "couponCode": null}	2026-06-17 16:37:51.129444+08
277	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:37:51.442609+08
278	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:37:56.327005+08
279	system	\N	session.created	session	session_1781685476967_zvlfra	{"alias": null, "ownerUserId": "user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec", "targetSource": "store-code", "selectedClientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "availabilitySource": "realtime-connected"}	2026-06-17 16:37:57.052837+08
280	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:38:01.310573+08
281	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:38:06.285824+08
282	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:38:11.298558+08
283	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:38:16.28041+08
284	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:38:21.585567+08
285	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:38:26.292992+08
286	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:38:31.292489+08
287	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:38:36.297661+08
288	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:38:41.297774+08
289	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:38:46.277335+08
290	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:38:51.274985+08
291	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:38:56.302086+08
292	system	\N	job.created	job	job_1781685537424_uiij04	{"sessionId": "session_1781685476967_zvlfra", "ownerUserId": "user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec", "originalName": "porsche penske and shiroko2.png"}	2026-06-17 16:38:57.74526+08
293	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:39:01.301942+08
294	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:39:06.291764+08
295	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:39:11.274791+08
296	system	\N	session.closed	session	session_1781685476967_zvlfra	{"ownerUserId": "user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec", "removedJobs": 0, "removedFiles": 1}	2026-06-17 16:39:11.526042+08
297	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:39:16.298986+08
298	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	client.updated	client	1e4e3e2f-046f-4395-8123-d73c2af8e9b7	{"clientId": "1e4e3e2f-046f-4395-8123-d73c2af8e9b7", "clientName": "YEFTA"}	2026-06-17 16:39:21.434785+08
299	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.logout	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"revokedCount": 1}	2026-06-19 15:10:05.348462+08
300	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.login	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"identifier": "yefta"}	2026-06-19 15:10:10.745928+08
301	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.logout	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"revokedCount": 1}	2026-06-19 15:11:05.396964+08
302	user	user_e39c94fb-573b-486a-ab1a-7fbf96514929	auth.login	user	user_e39c94fb-573b-486a-ab1a-7fbf96514929	{"identifier": "yefta2"}	2026-06-19 15:11:22.730468+08
303	user	user_e39c94fb-573b-486a-ab1a-7fbf96514929	auth.logout	user	user_e39c94fb-573b-486a-ab1a-7fbf96514929	{"revokedCount": 1}	2026-06-19 15:12:32.58974+08
304	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	auth.login	user	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	{"identifier": "yefta"}	2026-06-19 15:12:38.097694+08
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, name, printers, selected_printer, created_at, last_seen_at, status, owner_user_id) FROM stdin;
1e4e3e2f-046f-4395-8123-d73c2af8e9b7	YEFTA	["OneNote (Desktop)", "OneNote (Desktop) - Terproteksi", "OneNote (Desktop) - Protected", "Microsoft Print to PDF", "Fax", "Canon G1030 series"]	Canon G1030 series	2026-06-08 23:20:35.286+08	2026-06-17 16:39:21.454+08	offline	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec
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
cr_72e1af50-2c0e-4578-9c81-ea7a7cf69dc2	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	plan_free	ord_0e3cb5c0-26f2-4a31-aae4-4be3f86b0eda	free	10	0	2026-06-08 23:20:54.145+08	2026-06-15 23:20:54.145+08	active	2026-06-08 23:20:54.134214+08
cr_9ce9b745-31ec-4ed0-bb0b-cd862007bee8	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	plan_free	ord_df389617-fd1a-496c-90c9-6fe264ff2b5a	free	10	0	2026-06-17 16:37:51.115+08	2026-06-24 16:37:51.115+08	active	2026-06-17 16:37:51.103111+08
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, client_id, session_id, job_id, type, payload, created_at) FROM stdin;
\.


--
-- Data for Name: installers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.installers (id, version, download_url, label, file_size_label, notes, is_active, is_primary, created_at, updated_at) FROM stdin;
installer_1_3_1	1.3.1	https://github.com/yeftakun/PrintForm/releases/download/1.3.1/PrintOrder-Setup-1.3.1.exe	PrintOrder Installer v1.3.1	56MB	Windows installer	t	t	2026-06-19 15:09:06.743225+08	2026-06-19 15:09:06.743225+08
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, session_id, original_name, stored_path, size_bytes, status, alias, paper_size, copies, created_at, updated_at, owner_user_id, claimed_by_client_id, claimed_at, color_mode, orientation, page_range, content_scale, notes, estimated_price, file_status) FROM stdin;
job_1781685537424_uiij04	session_1781685476967_zvlfra	porsche penske and shiroko2.png	d:\\code\\PrintForm-server\\storage\\files\\4253d8f44749d0e4e5cf90cf1055c6bd	5697110	canceled	\N	A4	1	2026-06-17 16:38:57.424+08	2026-06-17 16:39:11.502+08	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	\N	\N	color	portrait	\N	112	\N	2000	not-available
\.


--
-- Data for Name: mitra_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mitra_profiles (user_id, kode_toko, alamat, pin_hash, konfigurasi_toko) FROM stdin;
user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	yefta	\N	\N	{"kontak": "", "layanan": {"modeWarna": "both", "hargaDasar": 0, "jenisKertas": ["A4", "F4"], "hargaModeWarna": {"bw": 0, "color": 0}, "modeWarnaPilihan": ["bw", "color"]}, "namaToko": "Yefta", "statusToko": "open", "jamOperasional": "Setiap hari 08:00 - 21:00", "waktuOperasional": [{"day": "sunday", "open": "08:00", "close": "21:00", "enabled": true}, {"day": "monday", "open": "08:00", "close": "21:00", "enabled": true}, {"day": "tuesday", "open": "08:00", "close": "21:00", "enabled": true}, {"day": "wednesday", "open": "08:00", "close": "21:00", "enabled": true}, {"day": "thursday", "open": "08:00", "close": "21:00", "enabled": true}, {"day": "friday", "open": "08:00", "close": "21:00", "enabled": true}, {"day": "saturday", "open": "08:00", "close": "21:00", "enabled": true}], "forceOpenOutsideOperationalHours": true}
user_b507fe9b-d7c5-49d5-a493-1305909d41ec	asyel-print	\N	\N	{"kontak": "", "layanan": {"modeWarna": "both", "hargaDasar": 0, "jenisKertas": ["A4", "F4"], "hargaModeWarna": {"bw": 0, "color": 0}, "modeWarnaPilihan": ["bw", "color"]}, "namaToko": "yeftaasyel", "statusToko": "open", "jamOperasional": "Setiap hari 08:00 - 21:00", "waktuOperasional": [{"day": "sunday", "open": "08:00", "close": "21:00", "enabled": true}, {"day": "monday", "open": "08:00", "close": "21:00", "enabled": true}, {"day": "tuesday", "open": "08:00", "close": "21:00", "enabled": true}, {"day": "wednesday", "open": "08:00", "close": "21:00", "enabled": true}, {"day": "thursday", "open": "08:00", "close": "21:00", "enabled": true}, {"day": "friday", "open": "08:00", "close": "21:00", "enabled": true}, {"day": "saturday", "open": "08:00", "close": "21:00", "enabled": true}], "forceOpenOutsideOperationalHours": false}
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, user_id, plan_id, quantity, subtotal_idr, discount_idr, total_idr, coupon_id, coupon_code, status, payment_instruction, payment_expires_at, activated_at, rejected_at, rejected_reason, created_at, updated_at) FROM stdin;
ord_0e3cb5c0-26f2-4a31-aae4-4be3f86b0eda	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	plan_free	1	0	0	0	\N	\N	paid	\N	\N	2026-06-08 23:20:54.141+08	\N	\N	2026-06-08 23:20:54.134214+08	2026-06-08 23:20:54.134214+08
ord_df389617-fd1a-496c-90c9-6fe264ff2b5a	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	plan_free	1	0	0	0	\N	\N	paid	\N	\N	2026-06-17 16:37:51.108+08	\N	\N	2026-06-17 16:37:51.103111+08	2026-06-17 16:37:51.103111+08
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
plan_credit_200	credit_200	Buy Credit	credit_pack	5000	200	4	200 kredit tugas, berlaku 4 bulan.	t	4	2026-05-28 18:05:39.246002+08	2026-05-28 18:05:39.246002+08
plan_pro_monthly	pro_monthly	Pro	subscription	10000	2500	1	2.500 tugas cetak per bulan.	t	3	2026-05-28 18:05:39.246002+08	2026-06-05 15:40:09.0263+08
plan_starter_monthly	starter_monthly	Starter	subscription	5000	1000	1	1.000 tugas cetak per bulan.	t	2	2026-05-28 18:05:39.246002+08	2026-06-05 15:40:50.468569+08
\.


--
-- Data for Name: preview_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.preview_files (id, stored_name, converted_name, original_name, mime_type, size_bytes, status, conversion_error, session_id, job_id, owner_user_id, created_at, last_seen_at, expires_at) FROM stdin;
d82fcc115d519a205b581de806df4334	d82fcc115d519a205b581de806df4334	d82fcc115d519a205b581de806df4334	Presentation2.pptx	application/pdf	42767	ready	\N	\N	\N	\N	2026-06-09 00:51:19.690007+08	2026-06-09 00:51:19.690007+08	\N
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token_hash, user_agent, ip_address, created_at, expires_at, revoked_at, replaced_by_token_id) FROM stdin;
rt_8c7fdd44-ca5d-4a83-9a5f-0a46514e088f	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	0f64dd422f6b914c20bf39701e132f60b723472dd191e77c36163f2a3095141a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.122.1 Chrome/142.0.7444.265 Electron/39.8.8 Safari/537.36	::1	2026-06-03 16:44:26.075043+08	2026-07-03 16:44:26.073+08	\N	\N
rt_9329bfc9-f3c6-40c4-9835-bb20c8ccae77	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	47ac1ee4f5a279f6091b76981d76bae158d92a96031aaa69e068a8d08a1638a2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	2026-06-03 16:44:47.892328+08	2026-07-03 16:44:47.891+08	2026-06-03 18:28:42.410614+08	rt_ccc13035-64d4-498e-acbe-f22b6a3c4ba7
rt_ccc13035-64d4-498e-acbe-f22b6a3c4ba7	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	40b78a3e46adb80b2a5c50f60f902ae6bfca9818276756454cd0661395dc245c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	2026-06-03 18:28:42.304786+08	2026-07-03 18:28:42.294+08	2026-06-03 20:29:25.225558+08	\N
rt_f39e4afc-5e53-443b-9d6d-4b8285e9b1ab	user_b507fe9b-d7c5-49d5-a493-1305909d41ec	7d2594e844dd4e99ec6ec1e87a0e48590af3bde5ba19fa75d0032032c7b84b7c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	2026-06-03 22:06:44.32998+08	2026-07-03 22:06:44.328+08	2026-06-03 23:21:53.323951+08	rt_58baf427-560d-4e3b-98ba-5d67f19afe35
rt_58baf427-560d-4e3b-98ba-5d67f19afe35	user_b507fe9b-d7c5-49d5-a493-1305909d41ec	f72b66e1f2860ac7863291c7a78ed50cc73d495d6703e65ffd2477067324f240	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	2026-06-03 23:21:53.216499+08	2026-07-03 23:21:53.212+08	2026-06-03 23:21:55.506011+08	\N
rt_db36d0d4-b150-469e-aa09-d2f196da44b1	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	f540736f5e09e1650e169c3d89af6facd8e00531bfb01aa9342f0c16f1a10a05	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	2026-06-05 15:39:24.403126+08	2026-07-05 15:39:24.401+08	\N	\N
rt_1fb714e2-a09a-4681-8716-d83aa09a0c56	user_e39c94fb-573b-486a-ab1a-7fbf96514929	4a45a634ebd24fd3144908af5433d2c71d2ea615b8954ad631442cd35b5820cb	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	2026-06-05 15:39:39.919194+08	2026-07-05 15:39:39.918+08	\N	\N
rt_e1fcb0d2-b1a6-410c-90c4-a103d5a54005	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	6417c2e2accc6d39e93d0d8fba77bea473a4e8ff5d4ea7e662d53a0e427862dd	\N	::1	2026-06-08 23:21:27.119377+08	2026-07-08 23:21:27.117+08	\N	\N
rt_ac360ddc-7308-47a7-8aed-855d905d9096	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	0d556ec179014efdee424b6ff5421927319e5ec03e6f6129c07155c3cd29c4ad	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	2026-06-08 23:20:46.56762+08	2026-07-08 23:20:46.565+08	2026-06-08 23:21:44.291527+08	\N
rt_d2c2fcd3-1f65-45aa-a6e4-f58879d4c467	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	c845c1156730c0c338a4e08f7f230ceab6ceffd6f952cb3f5ec3e2de566e623e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	2026-06-08 23:22:10.791171+08	2026-07-08 23:22:10.691+08	2026-06-09 00:43:20.766136+08	\N
rt_e19388a6-f85f-4a13-ad9e-09214ee1a9f9	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	f938de730858ea587ef425936df11c8b67afc7f56bf7353b313f894237d4e6f1	\N	::1	2026-06-09 00:43:08.693286+08	2026-07-09 00:43:08.691+08	2026-06-09 01:03:45.422689+08	rt_a8dd16c9-3ed8-4c3e-bd22-1108dade2707
rt_4d102ce1-b854-4187-b941-278f98e9e344	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	039dd4a262cc5bca1d1cf013340d92c06c6ce517bd92aba25f3c3d9cb2f714e7	\N	::1	2026-06-09 01:03:45.97939+08	2026-07-09 01:03:45.961+08	\N	\N
rt_a8dd16c9-3ed8-4c3e-bd22-1108dade2707	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	b28d8218e32705d6cf467f222c1255a030b2167a77967d4fdef80986c4ebfbf6	\N	::1	2026-06-09 01:03:45.416626+08	2026-07-09 01:03:45.414+08	2026-06-09 01:03:46.115161+08	rt_4d102ce1-b854-4187-b941-278f98e9e344
rt_7c29870b-f9ad-4236-a132-a863a7f054e4	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	d2ef11faa655a0e569deeb9b95be128b4f3a83d0456dd411f4c483c333d2401e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	2026-06-17 15:09:59.591591+08	2026-07-17 15:09:59.59+08	2026-06-17 15:34:52.625569+08	rt_fd281bcf-157e-4a08-9af4-3751b84a7e8e
rt_fd281bcf-157e-4a08-9af4-3751b84a7e8e	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	54c1faa87f44bb1cf65e6d61d6b4ece27d15f0aaca90e280531b93de27c90aca	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	2026-06-17 15:34:52.619619+08	2026-07-17 15:34:52.615+08	2026-06-17 15:34:54.942538+08	\N
rt_f3a56318-d82b-48e8-acdc-dacd8ea05cdb	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	07e9722f5e13d5858da481aa8884c1a23a425cd10e0e5e1d2274d8b2d42ea305	\N	::1	2026-06-17 16:36:31.928099+08	2026-07-17 16:36:31.924+08	\N	\N
rt_cddab9b3-0649-485e-9671-4bf8127332ab	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	1e8c35dbeaa5d8a867f5d0ad1befa52e96c6974eafd5eb5582b4bb6b70f7b386	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	2026-06-17 16:37:01.713306+08	2026-07-17 16:37:01.711+08	2026-06-19 15:10:05.312739+08	\N
rt_3bca26b4-9125-4eba-812a-5f0dec3c91cd	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	f8e7dd54795b8e9810f64e4ed25f3c100a46db71fb1bddf177dd2df5c98304d5	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	2026-06-19 15:10:10.644033+08	2026-07-19 15:10:10.642+08	2026-06-19 15:11:05.360509+08	\N
rt_1e4018f5-01c4-4ce9-aec3-d2c22a7b4a00	user_e39c94fb-573b-486a-ab1a-7fbf96514929	c1c0b47ec064baf6aa49cffd4db2dbdcd4d7a67959ac7375827d61811fbb2e0c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	2026-06-19 15:11:22.728484+08	2026-07-19 15:11:22.727+08	2026-06-19 15:12:32.573161+08	\N
rt_e03356fc-5c75-4a21-bb14-824bf4fe5eda	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	1c3cdabb0ff7a09c0a85abf85451c825a6ed1d9c0f163f07c5614ba9d19b2fed	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	2026-06-19 15:12:38.093167+08	2026-07-19 15:12:38.091+08	\N	\N
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, alias, created_at, last_seen_at, status, owner_user_id) FROM stdin;
session_1781685476967_zvlfra	\N	2026-06-17 16:37:56.967+08	2026-06-17 16:39:08.15+08	closed	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec
session_1780938762454_tm2mzg	\N	2026-06-09 01:12:42.454+08	2026-06-09 01:13:14.609+08	closed	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec
session_1780938410225_uyk1iw	\N	2026-06-09 01:06:50.225+08	2026-06-09 01:07:01.545+08	expired	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec
session_1780938320035_2rtuwg	\N	2026-06-09 01:05:20.035+08	2026-06-09 01:05:30.952+08	closed	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec
session_1780938231304_3q1eqp	\N	2026-06-09 01:03:51.304+08	2026-06-09 01:04:02.256+08	expired	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec
session_1780937417795_lmbhmu	\N	2026-06-09 00:50:17.795+08	2026-06-09 00:53:48.627+08	expired	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec
session_1780937022785_eplbrq	\N	2026-06-09 00:43:42.785+08	2026-06-09 00:44:43.636+08	expired	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec
session_1780932142376_xobxik	\N	2026-06-08 23:22:22.376+08	2026-06-08 23:22:53.125+08	closed	user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, role, created_at, username) FROM stdin;
user_e39c94fb-573b-486a-ab1a-7fbf96514929	yeftaasyel026@student.unsrat.ac.id	$2b$12$qTxV7UIvTD.9HX79Ja/HKuyVyx5IK42SwYpz5iaeJwPuIUzoXxByq	admin	2026-05-29 12:13:37.218672+08	yefta2
user_77a64fc2-2961-4cf9-bb10-15d76fbd60ec	yeftakun34@gmail.com	$2b$12$FbZ7ZMjQ.ZrgT04Gsjs4DedTAP275iLNXA7UZHeKmfwSrru7n6epS	mitra	2026-06-03 16:44:26.019362+08	yefta
user_b507fe9b-d7c5-49d5-a493-1305909d41ec	\N	$2b$12$LgIYEK7mKp9GPoSeGXPi9O7gYFYtF9HWLJswXm4qHFX/I7p2VGz/C	mitra	2026-06-03 22:06:44.266621+08	yeftaasyel
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 304, true);


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
-- Name: installers installers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installers
    ADD CONSTRAINT installers_pkey PRIMARY KEY (id);


--
-- Name: installers installers_version_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installers
    ADD CONSTRAINT installers_version_key UNIQUE (version);


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
-- Name: idx_installers_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_installers_active ON public.installers USING btree (is_active);


--
-- Name: idx_installers_primary_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_installers_primary_unique ON public.installers USING btree (is_primary) WHERE is_primary;


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

\unrestrict eOF1k3CYzUZhUmezhfBDDI0eXfLwmLJ5a2IW6TW9QwMlafotiFlGVilzwfBBLg1

