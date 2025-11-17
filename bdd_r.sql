--
-- PostgreSQL database dump
--

\restrict dgfdMammwEpXNVwMnt77hmUr5KOLNu4xwURCd6mpZQahlbg4n1thp0YIulSZagk

-- Dumped from database version 17.6 (Debian 17.6-1.pgdg13+1)
-- Dumped by pg_dump version 17.6

-- Started on 2025-11-16 14:00:35

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
-- TOC entry 3 (class 3079 OID 17488)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 3700 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 2 (class 3079 OID 17021)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3701 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 919 (class 1247 OID 17012)
-- Name: notification_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notification_type AS ENUM (
    'LIKE',
    'COMMENT',
    'FOLLOW',
    'MESSAGE'
);


ALTER TYPE public.notification_type OWNER TO postgres;

--
-- TOC entry 913 (class 1247 OID 16999)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- TOC entry 916 (class 1247 OID 17004)
-- Name: user_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_status AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'BLOCKED'
);


ALTER TYPE public.user_status OWNER TO postgres;

--
-- TOC entry 283 (class 1255 OID 17604)
-- Name: update_post_comment_count(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_post_comment_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO post_metrics (post_id, comments_count, updated_at)
    VALUES (NEW.post_id, 1, NOW())
    ON CONFLICT (post_id)
    DO UPDATE SET
      comments_count = post_metrics.comments_count + 1,
      updated_at = NOW();
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE post_metrics
    SET comments_count = GREATEST(comments_count - 1, 0),
        updated_at = NOW()
    WHERE post_id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_post_comment_count() OWNER TO postgres;

--
-- TOC entry 284 (class 1255 OID 17606)
-- Name: update_post_reaction_metrics(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_post_reaction_metrics() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.post_id IS NOT NULL) THEN
    UPDATE post_metrics
    SET likes_count = likes_count + 1,
        last_interaction = NOW(),
        updated_at = NOW()
    WHERE post_id = NEW.post_id;

  ELSIF (TG_OP = 'DELETE' AND OLD.post_id IS NOT NULL) THEN
    UPDATE post_metrics
    SET likes_count = GREATEST(likes_count - 1, 0),
        updated_at = NOW()
    WHERE post_id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_post_reaction_metrics() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 230 (class 1259 OID 17236)
-- Name: blocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blocks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    blocker_id uuid NOT NULL,
    blocked_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.blocks OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 17048)
-- Name: conversation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    is_group boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.conversation OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17056)
-- Name: conversation_participants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversation_participants (
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    joined_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.conversation_participants OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17199)
-- Name: email_verifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_verifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.email_verifications OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17170)
-- Name: follow; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follow (
    follower_id uuid NOT NULL,
    followed_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.follow OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17151)
-- Name: media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    post_id uuid,
    message_id uuid,
    url text NOT NULL,
    type character varying(20),
    width integer,
    height integer,
    CONSTRAINT media_type_check CHECK (((type)::text = ANY ((ARRAY['IMAGE'::character varying, 'VIDEO'::character varying, 'AUDIO'::character varying, 'GIF'::character varying])::text[])))
);


ALTER TABLE public.media OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17132)
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    text text,
    created_at timestamp without time zone DEFAULT now(),
    seen_at timestamp without time zone
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17186)
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type public.notification_type NOT NULL,
    ref_id uuid,
    created_at timestamp without time zone DEFAULT now(),
    is_seen boolean DEFAULT false
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 17072)
-- Name: post; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    author_id uuid NOT NULL,
    text character varying(2000),
    link_url text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_blocked boolean DEFAULT false,
    topic text,
    weather jsonb,
    shared_post_id uuid
);


ALTER TABLE public.post OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 17589)
-- Name: post_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_metrics (
    post_id uuid NOT NULL,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    views_count integer DEFAULT 0,
    last_interaction timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.post_metrics OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 17637)
-- Name: post_topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_topics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid,
    topic_id uuid
);


ALTER TABLE public.post_topics OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 17109)
-- Name: reaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reaction (
    user_id uuid NOT NULL,
    post_id uuid,
    comment_id uuid,
    created_at timestamp without time zone DEFAULT now(),
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    CONSTRAINT one_target CHECK ((((post_id IS NOT NULL) AND (comment_id IS NULL)) OR ((post_id IS NULL) AND (comment_id IS NOT NULL))))
);


ALTER TABLE public.reaction OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17278)
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reporter_id uuid NOT NULL,
    target_type character varying(20) NOT NULL,
    target_id uuid NOT NULL,
    reason text,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reports_target_type_check CHECK (((target_type)::text = ANY ((ARRAY['post'::character varying, 'comment'::character varying])::text[])))
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 17627)
-- Name: topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.topics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.topics OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17087)
-- Name: user_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_comments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    author_id uuid NOT NULL,
    post_id uuid NOT NULL,
    text character varying(280) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    parent_id uuid,
    updated_at date,
    author_avatar text
);


ALTER TABLE public.user_comments OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 17609)
-- Name: user_interactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_interactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    post_id uuid,
    interaction_type text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT user_interactions_interaction_type_check CHECK ((interaction_type = ANY (ARRAY['like'::text, 'comment'::text, 'view'::text])))
);


ALTER TABLE public.user_interactions OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 17619)
-- Name: user_interests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_interests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    topic_id uuid NOT NULL,
    weight real DEFAULT 1.0
);


ALTER TABLE public.user_interests OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 17032)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    username character varying(30) NOT NULL,
    displayname character varying(30) NOT NULL,
    bio character varying(160),
    profile_picture_url text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    role public.user_role DEFAULT 'USER'::public.user_role,
    status public.user_status DEFAULT 'ACTIVE'::public.user_status,
    city character varying(100),
    country_iso character(2)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3688 (class 0 OID 17236)
-- Dependencies: 230
-- Data for Name: blocks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blocks (id, blocker_id, blocked_id, created_at) FROM stdin;
f516d51c-8350-49fe-a0a7-0b60e53f9613	cf3d4890-be5e-4912-b65e-f84d14600734	898eb0ae-923c-4c0f-9c44-5ac48ca6df0e	2025-09-30 19:15:28.395525+00
f9a5706e-5bd4-4dd1-aeff-b24f46c7e33f	cf3d4890-be5e-4912-b65e-f84d14600734	5b9f365c-6c3a-4ffe-b27d-9f809722e313	2025-09-30 20:24:48.49808+00
35d84c38-38fa-4014-bdd3-269f3c6d2dc6	80195420-7e74-4a40-81b1-340ab3536f30	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	2025-11-04 22:32:36.40312+00
\.


--
-- TOC entry 3678 (class 0 OID 17048)
-- Dependencies: 220
-- Data for Name: conversation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversation (id, is_group, created_at) FROM stdin;
\.


--
-- TOC entry 3679 (class 0 OID 17056)
-- Dependencies: 221
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversation_participants (conversation_id, user_id, joined_at) FROM stdin;
\.


--
-- TOC entry 3687 (class 0 OID 17199)
-- Dependencies: 229
-- Data for Name: email_verifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_verifications (id, user_id, token, expires_at, used, created_at) FROM stdin;
b6b08b34-e2bc-4e92-a4ac-e519de1ec4c4	d1c68c25-e938-4437-ba77-477497a4bdd6	2d8b0f223042aa6f8985d1923b9c1126272652eb7e16ad7e74a418f29ff0d54f	2025-10-23 16:27:56.521	t	2025-10-22 19:27:56.737326
caea6cb6-7ed3-4937-9420-04c3cb766a99	a324b98b-0729-45ad-8294-6916dafaedfd	280afb9b3447f2d0298754198fb1101918e327a9f54180114831d8ac480e67d8	2025-09-30 19:12:50.315	t	2025-09-29 22:12:50.418464
a0a76e5f-199c-4378-98b5-089b9483f251	5b9f365c-6c3a-4ffe-b27d-9f809722e313	179c545f6c251191dde3d71a6fa3211b74f71dc76e6edc82f40d5e963836b7b3	2025-10-01 16:25:32.396	t	2025-09-30 19:25:32.312978
d710ce4b-22dc-43d5-ad1f-ba793f544ae9	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	7950ef710e26067ce612b2b6273af0bdb58e6eb04e4ab12d4951d6edc3093d15	2025-10-01 17:15:09.612	t	2025-09-30 20:15:12.819684
4d639cbb-4892-4155-94ab-cbfb08e0bf4d	81bd3780-5622-4f37-8cac-aa8d903f96e2	93886b0358312a4bb8b641b6b972d53784e0941eb39f9e2fe6a366cd45cc9868	2025-10-14 17:26:59.414	t	2025-10-13 20:26:58.289116
\.


--
-- TOC entry 3685 (class 0 OID 17170)
-- Dependencies: 227
-- Data for Name: follow; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.follow (follower_id, followed_id, created_at) FROM stdin;
be9383b6-847b-4894-a2ef-e74c40654076	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	2025-10-14 10:26:03.289087
be9383b6-847b-4894-a2ef-e74c40654076	81bd3780-5622-4f37-8cac-aa8d903f96e2	2025-10-14 12:16:02.848131
cf3d4890-be5e-4912-b65e-f84d14600734	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	2025-10-21 15:52:08.460687
a324b98b-0729-45ad-8294-6916dafaedfd	5b9f365c-6c3a-4ffe-b27d-9f809722e313	2025-10-22 14:03:06.525932
a324b98b-0729-45ad-8294-6916dafaedfd	898eb0ae-923c-4c0f-9c44-5ac48ca6df0e	2025-10-22 14:04:53.085321
a324b98b-0729-45ad-8294-6916dafaedfd	81bd3780-5622-4f37-8cac-aa8d903f96e2	2025-10-22 14:05:01.253639
a324b98b-0729-45ad-8294-6916dafaedfd	be9383b6-847b-4894-a2ef-e74c40654076	2025-10-22 14:05:12.499736
a324b98b-0729-45ad-8294-6916dafaedfd	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	2025-10-22 14:06:02.747411
d1c68c25-e938-4437-ba77-477497a4bdd6	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	2025-10-22 22:01:48.093617
35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	898eb0ae-923c-4c0f-9c44-5ac48ca6df0e	2025-10-30 14:03:22.10063
80195420-7e74-4a40-81b1-340ab3536f30	5b9f365c-6c3a-4ffe-b27d-9f809722e313	2025-11-04 21:13:13.352491
a324b98b-0729-45ad-8294-6916dafaedfd	aaecf944-3435-4a2c-b92d-e364b26b3b2e	2025-11-04 21:13:22.981603
35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	5b9f365c-6c3a-4ffe-b27d-9f809722e313	2025-11-04 22:38:17.814289
5b9f365c-6c3a-4ffe-b27d-9f809722e313	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	2025-11-04 22:38:58.334067
5b9f365c-6c3a-4ffe-b27d-9f809722e313	80195420-7e74-4a40-81b1-340ab3536f30	2025-11-16 02:19:14.879735
\.


--
-- TOC entry 3684 (class 0 OID 17151)
-- Dependencies: 226
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media (id, post_id, message_id, url, type, width, height) FROM stdin;
c5db909e-2466-417c-9c6c-60766e8ffb73	b7277554-3659-4a7c-939e-f60bf1bf0003	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1760054264/TpFinal/posts/jt8kw0csodwqralrfqvq.png	IMAGE	\N	\N
4d108756-cdbe-4cd1-a878-9cde887256cd	59c4bdd9-2e28-4bd2-800c-8e8d25bccf9d	\N	https://res.cloudinary.com/dtybvnx2h/video/upload/v1760105840/TpFinal/posts/qewlusrgtekjlpsysfmm.mp4	VIDEO	\N	\N
585959bb-ea29-409e-9f71-406e02b0cf64	deadbfb7-bba2-4561-9e97-519449449ea5	\N	https://res.cloudinary.com/dtybvnx2h/video/upload/v1760107168/TpFinal/posts/depnke4abwtli2wjhgkd.mp3	VIDEO	\N	\N
8a6fb1a5-88ef-4649-a212-ec5df175694b	\N	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1760110608/TpFinal/posts/lqrslmu2dkf6d5ek8zzy.gif	GIF	\N	\N
f4432cbe-4391-4151-a95b-6816ef9dc3c2	\N	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1760110609/TpFinal/posts/rsjkjdjkjwfsyhykfumc.gif	GIF	\N	\N
5e0f4827-3128-46ee-ad7b-80d6ccab2929	\N	\N	https://res.cloudinary.com/dtybvnx2h/video/upload/v1760110611/TpFinal/posts/ozqoppz3wwpplure7zt6.mp4	VIDEO	\N	\N
2d826239-6337-452b-af3a-fbae7bd148e5	53544898-9d91-4a2e-9004-8d0e2d04717f	\N	https://res.cloudinary.com/dtybvnx2h/video/upload/v1760110872/TpFinal/posts/nyospzs0wbgbxkb0nsum.mp3	VIDEO	\N	\N
14ec134b-520f-4a21-8ee8-09fa74476810	53544898-9d91-4a2e-9004-8d0e2d04717f	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1760110874/TpFinal/posts/uybsaub8vxudszreg62w.gif	GIF	\N	\N
aa3cc08e-36d4-4660-9c3e-52ec78f4966d	53544898-9d91-4a2e-9004-8d0e2d04717f	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1760110875/TpFinal/posts/fwg7x5oo5kfklw8xqviu.png	IMAGE	\N	\N
b64a9ad4-49c5-48fb-8f51-57a3da233353	53544898-9d91-4a2e-9004-8d0e2d04717f	\N	https://res.cloudinary.com/dtybvnx2h/video/upload/v1760110877/TpFinal/posts/cf2dpizrrj88omssg6ey.mp4	VIDEO	\N	\N
ca495429-9afd-434d-a5b1-6bf489098878	\N	\N	https://res.cloudinary.com/dtybvnx2h/video/upload/v1760112419/TpFinal/posts/m5uujlg81dosi5w6h3mj.mp4	VIDEO	\N	\N
277a44a0-89c3-4557-b8bd-fe730ef355c0	4cf7e9d5-ce17-4022-a52f-4e4467bcdaf4	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1760406363/TpFinal/posts/mezl382xhgl9fcouje8k.png	IMAGE	\N	\N
6b164f4c-10c2-47d9-9e9d-690e11ee1b5f	fa6a369a-f138-4cf9-8398-6a10a57f6433	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1760450092/TpFinal/posts/zqomaquvu9qklv68bnid.jpg	IMAGE	\N	\N
79c27c5f-d8d9-434a-bfdc-67ca6642764d	fa6a369a-f138-4cf9-8398-6a10a57f6433	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1760450094/TpFinal/posts/t0av3kcwvzj4rshuhwf1.png	IMAGE	\N	\N
7d9662af-01ee-442f-b0ca-45a4fb83edc8	73ff3cf5-bfab-441d-8969-099cdef743c4	\N	https://res.cloudinary.com/dtybvnx2h/video/upload/v1760480336/TpFinal/posts/c7y0felwfnjokinzlvpv.mp4	VIDEO	\N	\N
806f601a-a31a-45d0-a0b9-3a8b4c07fbc5	79e2032b-cd84-4fa3-9e80-6ee324e6fed3	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1760982565/TpFinal/posts/zrdy84iwlocz1qxfc8cw.jpg	IMAGE	\N	\N
ec2d0d44-e1f7-43ba-b9f7-7722335eac33	364cae1f-6e05-4c37-8022-8e4d4ac4b293	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1761720584/TpFinal/posts/ykmn5wnbnjeelswj629y.png	IMAGE	\N	\N
0bd53242-9aa4-411f-89da-e03e4644ae65	254ec008-8c9a-4b54-a87d-ef5cee1d82b0	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1762135242/TpFinal/posts/qrzfajeny8itwi06gjnq.jpg	IMAGE	\N	\N
16c475d0-5692-419c-b122-c2226deb6f64	329cc8f9-ba1e-4a08-95d6-3936422edcc6	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1762291423/TpFinal/posts/fzs4xhd57i01kerjgwzm.png	IMAGE	\N	\N
c1bd39c2-1acc-45b9-b0f2-21c99aad11e3	b4ebef1c-61b9-4cb7-b3a7-b1cd366eab9d	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1762294809/TpFinal/posts/atr2vpfnt12rauyzfmwt.jpg	IMAGE	\N	\N
\.


--
-- TOC entry 3683 (class 0 OID 17132)
-- Dependencies: 225
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, conversation_id, sender_id, text, created_at, seen_at) FROM stdin;
\.


--
-- TOC entry 3686 (class 0 OID 17186)
-- Dependencies: 228
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification (id, user_id, type, ref_id, created_at, is_seen) FROM stdin;
80246625-2e0a-445d-a5c9-fcfdc8d5f176	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	FOLLOW	be9383b6-847b-4894-a2ef-e74c40654076	2025-10-14 10:26:03.289087	f
1e1ae2d7-c0fc-4c49-96e1-dc0423fc1035	81bd3780-5622-4f37-8cac-aa8d903f96e2	FOLLOW	be9383b6-847b-4894-a2ef-e74c40654076	2025-10-14 12:16:02.848131	f
ee44b786-6587-4975-a09a-3769df7f0ea9	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	FOLLOW	cf3d4890-be5e-4912-b65e-f84d14600734	2025-10-21 15:46:25.140071	f
4ed1bf41-6598-404a-925c-ffcf383ab3b8	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	FOLLOW	cf3d4890-be5e-4912-b65e-f84d14600734	2025-10-21 15:52:08.460687	f
77cc7e23-fd63-4809-8fe3-1d148f2e9b73	5b9f365c-6c3a-4ffe-b27d-9f809722e313	FOLLOW	a324b98b-0729-45ad-8294-6916dafaedfd	2025-10-22 14:03:06.525932	f
379ccd9f-5ff4-448e-908e-fb4dffac72e6	898eb0ae-923c-4c0f-9c44-5ac48ca6df0e	FOLLOW	a324b98b-0729-45ad-8294-6916dafaedfd	2025-10-22 14:04:53.085321	f
c2b0cc9a-00ba-4c54-b223-ba3db5c9ec20	81bd3780-5622-4f37-8cac-aa8d903f96e2	FOLLOW	a324b98b-0729-45ad-8294-6916dafaedfd	2025-10-22 14:05:01.253639	f
94a105df-028b-4f3a-9341-073f7419b689	be9383b6-847b-4894-a2ef-e74c40654076	FOLLOW	a324b98b-0729-45ad-8294-6916dafaedfd	2025-10-22 14:05:12.499736	f
901c30aa-8fd2-4e90-bbc3-af6941a931b9	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	FOLLOW	a324b98b-0729-45ad-8294-6916dafaedfd	2025-10-22 14:06:02.747411	f
36446337-8e02-4063-9696-335d73639ade	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	FOLLOW	d1c68c25-e938-4437-ba77-477497a4bdd6	2025-10-22 22:01:48.093617	f
539bb1ad-d9b0-44fe-98d2-9fbd4fccc1a8	898eb0ae-923c-4c0f-9c44-5ac48ca6df0e	FOLLOW	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	2025-10-30 14:03:22.10063	f
6f218449-ea60-441b-9ede-823f322b76d5	5b9f365c-6c3a-4ffe-b27d-9f809722e313	FOLLOW	80195420-7e74-4a40-81b1-340ab3536f30	2025-11-04 21:13:13.352491	f
db3e46b3-dc2c-44c1-9405-d168ab070f1a	aaecf944-3435-4a2c-b92d-e364b26b3b2e	FOLLOW	a324b98b-0729-45ad-8294-6916dafaedfd	2025-11-04 21:13:22.981603	f
41ad1aa4-ba94-40e4-94e1-756f85e14c31	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	FOLLOW	5b9f365c-6c3a-4ffe-b27d-9f809722e313	2025-11-04 22:38:07.283817	f
716116e1-1bf0-4fb0-a0fd-b713ea13c73c	5b9f365c-6c3a-4ffe-b27d-9f809722e313	FOLLOW	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	2025-11-04 22:38:17.814289	f
6ae454fa-de96-4943-af40-035e93821d11	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	FOLLOW	5b9f365c-6c3a-4ffe-b27d-9f809722e313	2025-11-04 22:38:53.021084	f
fa523f93-6120-4c0d-9abc-b46aae91ed4a	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	FOLLOW	5b9f365c-6c3a-4ffe-b27d-9f809722e313	2025-11-04 22:38:58.334067	f
a0b41219-f7cc-4a84-9fc7-b38c8082adb7	80195420-7e74-4a40-81b1-340ab3536f30	FOLLOW	5b9f365c-6c3a-4ffe-b27d-9f809722e313	2025-11-16 02:19:14.879735	f
\.


--
-- TOC entry 3680 (class 0 OID 17072)
-- Dependencies: 222
-- Data for Name: post; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post (id, author_id, text, link_url, created_at, updated_at, is_blocked, topic, weather, shared_post_id) FROM stdin;
ddd7aaa6-a590-48b4-8176-e42c1147327a	a324b98b-0729-45ad-8294-6916dafaedfd	Este es un post para testear comentarios	\N	2025-10-07 15:40:39.251995	2025-10-07 15:40:39.251995	f	\N	\N	\N
80914705-57e3-4808-9ce0-410e81f216a1	5b9f365c-6c3a-4ffe-b27d-9f809722e313	Descripcion del post	\N	2025-10-09 23:44:47.653455	2025-10-09 23:44:47.653455	f	\N	\N	\N
b7277554-3659-4a7c-939e-f60bf1bf0003	5b9f365c-6c3a-4ffe-b27d-9f809722e313	Post con imagen	\N	2025-10-09 23:57:44.958471	2025-10-09 23:57:44.958471	f	\N	\N	\N
59c4bdd9-2e28-4bd2-800c-8e8d25bccf9d	5b9f365c-6c3a-4ffe-b27d-9f809722e313	Post con video (edit: este salio bien 😼👍)	\N	2025-10-10 14:17:21.638433	2025-10-10 14:36:34.760989	f	\N	\N	\N
53544898-9d91-4a2e-9004-8d0e2d04717f	5b9f365c-6c3a-4ffe-b27d-9f809722e313	Post con multiples archivos	\N	2025-10-10 15:41:19.234626	2025-10-10 15:41:19.234626	f	\N	\N	\N
4cf7e9d5-ce17-4022-a52f-4e4467bcdaf4	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	hola este es otro post parte 453782 editado	\N	2025-10-14 01:46:01.853458	2025-10-14 06:34:56.693728	f	\N	\N	\N
9c4ccdc1-37dc-4a93-b65d-5374c20c8d80	be9383b6-847b-4894-a2ef-e74c40654076	Otra prueba de posteo 12	\N	2025-10-14 10:47:09.287913	2025-10-14 10:54:34.970218	f	\N	\N	\N
fa6a369a-f138-4cf9-8398-6a10a57f6433	cf3d4890-be5e-4912-b65e-f84d14600734		\N	2025-10-14 13:54:50.943792	2025-10-14 13:54:50.943792	f	\N	\N	\N
deadbfb7-bba2-4561-9e97-519449449ea5	5b9f365c-6c3a-4ffe-b27d-9f809722e313	Este es un post con musica 	\N	2025-10-10 14:39:29.504655	2025-10-14 14:20:36.474449	f	\N	\N	\N
65f6bba0-c423-4587-890f-6a5dce3c6543	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	Nuevo post reporte	\N	2025-10-14 17:06:01	2025-10-14 17:29:06	t	\N	\N	\N
d0c2c9b6-7413-4995-908a-bf7bc27bf38c	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	Post para reportar	\N	2025-10-14 21:00:34.568761	2025-10-14 21:00:34.568761	t	\N	\N	\N
73ff3cf5-bfab-441d-8969-099cdef743c4	80195420-7e74-4a40-81b1-340ab3536f30	Este es un video	\N	2025-10-14 22:18:31.430793	2025-10-14 22:18:31.430793	t	\N	\N	\N
e6bc3859-dbd2-420e-b8b8-4091f05fdb89	5b9f365c-6c3a-4ffe-b27d-9f809722e313	Nuevo post	\N	2025-10-20 17:28:55.593985	2025-10-20 17:28:55.593985	f	\N	\N	\N
79e2032b-cd84-4fa3-9e80-6ee324e6fed3	5b9f365c-6c3a-4ffe-b27d-9f809722e313	Post desde el feed	\N	2025-10-20 17:49:24.568015	2025-10-20 17:49:24.568015	f	\N	\N	\N
11818ca9-749b-43df-9cac-593ba946e4ce	a324b98b-0729-45ad-8294-6916dafaedfd	Hola manola rata sin cola, me encanta taylor swift	\N	2025-10-23 17:33:35.333296	2025-10-23 17:33:35.333296	f	\N	\N	\N
84a824df-2214-46b7-ae13-a33c76f2b005	a324b98b-0729-45ad-8294-6916dafaedfd	Hola mundo, me encanta la música y Taylor Swift is the best	\N	2025-10-23 17:44:45.024604	2025-10-23 17:44:45.024604	f	\N	\N	\N
10267df2-83af-4062-b851-59f6119ab6db	a324b98b-0729-45ad-8294-6916dafaedfd	Hola mundo, me encanta la música y Taylor Swift is the best	\N	2025-10-23 18:24:32.780401	2025-10-23 18:24:32.780401	f	\N	\N	\N
056393ad-35fb-4b34-a8b2-15644167bb4e	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	Hola este es un post editado	\N	2025-10-13 18:53:49.127505	2025-10-31 15:15:54.858932	f	\N	\N	\N
364cae1f-6e05-4c37-8022-8e4d4ac4b293	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	Este es otro post de prueba editado	\N	2025-10-29 06:49:42.351334	2025-10-31 15:16:08.765351	f	\N	\N	\N
790ee7ec-7d43-454a-8897-945dabd66e12	a324b98b-0729-45ad-8294-6916dafaedfd	Hola a todos, me encanta taylor Swift, soy fan de la música	\N	2025-10-23 17:40:38.671888	2025-10-23 17:40:38.671888	t	\N	\N	\N
929e8d51-0fc8-42bd-9ccb-08b171ebd0ca	b2e631ab-46cf-4cd8-9fb0-37169d2eefb0	post con clima	\N	2025-10-31 15:38:59.708001	2025-10-31 15:38:59.708001	f	\N	{"lat": -38.9317, "lon": -67.9787, "daily": [{"dt": 1761926400, "pop": 0, "uvi": 6.78, "temp": {"day": 21.04, "eve": 21.32, "max": 22.63, "min": 14.24, "morn": 15.29, "night": 16.19}, "clouds": 0, "sunset": 1761952033, "moonset": 1761892740, "summary": "Expect a day of partly cloudy with clear spells", "sunrise": 1761902621, "weather": [{"id": 800, "icon": "01d", "main": "Clear", "description": "clear sky"}], "humidity": 30, "moonrise": 1761932160, "pressure": 1010, "wind_deg": 222, "dew_point": 2.82, "wind_gust": 15.5, "feels_like": {"day": 19.98, "eve": 19.9, "morn": 13.84, "night": 14.65}, "moon_phase": 0.32, "wind_speed": 12.7}, {"dt": 1762012800, "pop": 0, "uvi": 8.74, "temp": {"day": 22.24, "eve": 26.71, "max": 27.14, "min": 11.09, "morn": 11.2, "night": 21.03}, "clouds": 5, "sunset": 1762038500, "moonset": 1761980640, "summary": "Expect a day of partly cloudy with clear spells", "sunrise": 1761988951, "weather": [{"id": 800, "icon": "01d", "main": "Clear", "description": "clear sky"}], "humidity": 19, "moonrise": 1762022760, "pressure": 1012, "wind_deg": 237, "dew_point": -2.8, "wind_gust": 14.57, "feels_like": {"day": 21.02, "eve": 25.7, "morn": 9.73, "night": 19.68}, "moon_phase": 0.35, "wind_speed": 9.26}, {"dt": 1762099200, "pop": 0, "uvi": 8.92, "temp": {"day": 24.33, "eve": 27.16, "max": 27.36, "min": 14.52, "morn": 14.84, "night": 22.19}, "clouds": 100, "sunset": 1762124968, "moonset": 1762068540, "summary": "Expect a day of partly cloudy with clear spells", "sunrise": 1762075283, "weather": [{"id": 804, "icon": "04d", "main": "Clouds", "description": "overcast clouds"}], "humidity": 18, "moonrise": 1762113480, "pressure": 1011, "wind_deg": 242, "dew_point": -1.54, "wind_gust": 10.91, "feels_like": {"day": 23.29, "eve": 26.03, "morn": 13.22, "night": 20.99}, "moon_phase": 0.39, "wind_speed": 6.05}], "current": {"dt": 1761925110, "temp": 21.04, "weather": [{"id": 800, "icon": "01d", "main": "Clear", "description": "clear sky"}], "humidity": 30, "feels_like": 19.98, "wind_speed": 3.6}, "location": {"city": "Cipolletti", "state": "Río Negro Province", "country": "AR"}, "timezone": "America/Argentina/Salta"}	\N
e73c86ca-8f6d-4b06-8629-5c70189418be	b2e631ab-46cf-4cd8-9fb0-37169d2eefb0	...	\N	2025-10-31 22:30:16.07808	2025-10-31 22:30:16.07808	f	\N	{"lat": -38.9317, "lon": -67.9787, "daily": [{"dt": 1761926400, "pop": 0, "uvi": 8.19, "temp": {"day": 21.05, "eve": 21.94, "max": 23.74, "min": 14.24, "morn": 15.29, "night": 18.56}, "clouds": 100, "sunset": 1761952033, "moonset": 1761892740, "summary": "You can expect partly cloudy in the morning, with clearing in the afternoon", "sunrise": 1761902621, "weather": [{"id": 804, "icon": "04d", "main": "Clouds", "description": "overcast clouds"}], "humidity": 20, "moonrise": 1761932160, "pressure": 1010, "wind_deg": 220, "dew_point": -2.59, "wind_gust": 15.5, "feels_like": {"day": 19.73, "eve": 20.63, "morn": 13.84, "night": 17.15}, "moon_phase": 0.32, "wind_speed": 11.88}, {"dt": 1762012800, "pop": 0, "uvi": 8.9, "temp": {"day": 22.29, "eve": 26.35, "max": 27.01, "min": 11.28, "morn": 11.5, "night": 20.89}, "clouds": 14, "sunset": 1762038500, "moonset": 1761980640, "summary": "Expect a day of partly cloudy with clear spells", "sunrise": 1761988951, "weather": [{"id": 801, "icon": "02d", "main": "Clouds", "description": "few clouds"}], "humidity": 18, "moonrise": 1762022760, "pressure": 1012, "wind_deg": 238, "dew_point": -2.93, "wind_gust": 14.24, "feels_like": {"day": 21.04, "eve": 26.35, "morn": 10.01, "night": 19.5}, "moon_phase": 0.35, "wind_speed": 9.08}, {"dt": 1762099200, "pop": 0, "uvi": 9, "temp": {"day": 24.35, "eve": 27.31, "max": 27.55, "min": 14.6, "morn": 14.93, "night": 21.73}, "clouds": 97, "sunset": 1762124968, "moonset": 1762068540, "summary": "Expect a day of partly cloudy with clear spells", "sunrise": 1762075283, "weather": [{"id": 804, "icon": "04d", "main": "Clouds", "description": "overcast clouds"}], "humidity": 18, "moonrise": 1762113480, "pressure": 1011, "wind_deg": 240, "dew_point": -1.49, "wind_gust": 8.42, "feels_like": {"day": 23.31, "eve": 26.13, "morn": 13.31, "night": 20.51}, "moon_phase": 0.39, "wind_speed": 4.62}], "current": {"dt": 1761949807, "temp": 22.04, "weather": [{"id": 800, "icon": "01d", "main": "Clear", "description": "clear sky"}], "humidity": 18, "feels_like": 20.77, "wind_speed": 5.14}, "location": {"city": "Cipolletti", "state": "Río Negro Province", "country": "AR"}}	\N
05a9108c-5bf1-43e8-a82f-47d96ec93227	b2e631ab-46cf-4cd8-9fb0-37169d2eefb0	Post Clima - 15° Broken clouds	\N	2025-10-31 23:23:58.016535	2025-10-31 23:23:58.016535	f	\N	{"lat": 25.9885, "lon": 107.8705, "daily": [{"dt": 1761969600, "pop": 0.2, "uvi": 6.56, "rain": 0.2, "temp": {"day": 20.28, "eve": 16.89, "max": 21.68, "min": 14.72, "morn": 14.9, "night": 14.82}, "clouds": 88, "sunset": 1761991629, "moonset": 1761934080, "summary": "You can expect partly cloudy in the morning, with rain in the afternoon", "sunrise": 1761951416, "weather": [{"id": 500, "icon": "10d", "main": "Rain", "description": "light rain"}], "humidity": 54, "moonrise": 1761981120, "pressure": 1021, "wind_deg": 334, "dew_point": 9.4, "wind_gust": 4.68, "feels_like": {"day": 19.77, "eve": 16.54, "morn": 14.64, "night": 14.58}, "moon_phase": 0.33, "wind_speed": 2.49}, {"dt": 1762056000, "pop": 1, "uvi": 1, "rain": 21.22, "temp": {"day": 14.01, "eve": 13.67, "max": 14.28, "min": 12.76, "morn": 13.24, "night": 12.76}, "clouds": 100, "sunset": 1762077988, "moonset": 1762024140, "summary": "Expect a day of partly cloudy with rain", "sunrise": 1762037855, "weather": [{"id": 502, "icon": "10d", "main": "Rain", "description": "heavy intensity rain"}], "humidity": 94, "moonrise": 1762069560, "pressure": 1024, "wind_deg": 341, "dew_point": 11.63, "wind_gust": 4.42, "feels_like": {"day": 13.92, "eve": 13.6, "morn": 13.15, "night": 12.62}, "moon_phase": 0.37, "wind_speed": 2.2}, {"dt": 1762142400, "pop": 1, "uvi": 0.6, "rain": 25.59, "temp": {"day": 12.62, "eve": 12.03, "max": 12.74, "min": 11.78, "morn": 12.09, "night": 11.78}, "clouds": 100, "sunset": 1762164349, "moonset": 1762114260, "summary": "There will be rain today", "sunrise": 1762124295, "weather": [{"id": 501, "icon": "10d", "main": "Rain", "description": "moderate rain"}], "humidity": 95, "moonrise": 1762158000, "pressure": 1025, "wind_deg": 342, "dew_point": 10.31, "wind_gust": 4.12, "feels_like": {"day": 12.42, "eve": 11.85, "morn": 11.84, "night": 11.57}, "moon_phase": 0.41, "wind_speed": 2.21}], "current": {"dt": 1761952996, "temp": 15.03, "weather": [{"id": 803, "icon": "04d", "main": "Clouds", "description": "broken clouds"}], "humidity": 83, "feels_like": 14.76, "wind_speed": 1.39}, "location": {"city": "Sandu", "state": "Guizhou", "country": "CN"}}	\N
690e292a-4edc-4bc5-824d-e6c4da4d2025	b2e631ab-46cf-4cd8-9fb0-37169d2eefb0	Post Clima - 11° Shower rain	\N	2025-10-31 23:27:12.528083	2025-10-31 23:27:12.528083	f	\N	{"lat": 40.8222, "lon": 140.7471, "daily": [{"dt": 1761962400, "pop": 1, "uvi": 0.78, "rain": 77.02, "temp": {"day": 11.1, "eve": 12.91, "max": 13.6, "min": 10.85, "morn": 12.76, "night": 11.62}, "clouds": 90, "sunset": 1761982444, "moonset": 1761924660, "summary": "You can expect rain in the morning, with partly cloudy in the afternoon", "sunrise": 1761944820, "weather": [{"id": 502, "icon": "10d", "main": "Rain", "description": "heavy intensity rain"}], "humidity": 94, "moonrise": 1761973860, "pressure": 994, "wind_deg": 346, "dew_point": 10.17, "wind_gust": 17.23, "feels_like": {"day": 10.72, "eve": 12.4, "morn": 12.55, "night": 11.06}, "moon_phase": 0.33, "wind_speed": 13.83}, {"dt": 1762048800, "pop": 1, "uvi": 1.87, "rain": 4.43, "temp": {"day": 14.02, "eve": 10.53, "max": 14.02, "min": 9.97, "morn": 12.5, "night": 10.4}, "clouds": 72, "sunset": 1762068772, "moonset": 1762015380, "summary": "Expect a day of partly cloudy with rain", "sunrise": 1762031291, "weather": [{"id": 500, "icon": "10d", "main": "Rain", "description": "light rain"}], "humidity": 66, "moonrise": 1762061640, "pressure": 1007, "wind_deg": 248, "dew_point": 7.25, "wind_gust": 19.59, "feels_like": {"day": 13.2, "eve": 9.73, "morn": 11.74, "night": 9.61}, "moon_phase": 0.37, "wind_speed": 11.94}, {"dt": 1762135200, "pop": 1, "uvi": 0.5, "rain": 10.1, "temp": {"day": 9.34, "eve": 9.7, "max": 10.37, "min": 6.94, "morn": 9.19, "night": 6.94}, "clouds": 100, "sunset": 1762155101, "moonset": 1762106160, "summary": "Expect a day of partly cloudy with rain", "sunrise": 1762117762, "weather": [{"id": 501, "icon": "10d", "main": "Rain", "description": "moderate rain"}], "humidity": 88, "moonrise": 1762149480, "pressure": 1014, "wind_deg": 23, "dew_point": 6.9, "wind_gust": 7.92, "feels_like": {"day": 6.44, "eve": 7.2, "morn": 9.19, "night": 6.1}, "moon_phase": 0.41, "wind_speed": 6.64}], "current": {"dt": 1761953203, "temp": 10.85, "weather": [{"id": 521, "icon": "09d", "main": "Rain", "description": "shower rain"}, {"id": 701, "icon": "50d", "main": "Mist", "description": "mist"}], "humidity": 96, "feels_like": 10.5, "wind_speed": 5.36}, "location": {"city": "Aomori", "state": null, "country": "JP"}}	\N
a904ff11-3ed3-4673-ba7b-ed60772a8ee0	be9383b6-847b-4894-a2ef-e74c40654076	This is a post	\N	2025-11-03 00:15:21.246724	2025-11-03 00:15:21.246724	f	\N	\N	\N
13123f5f-35d4-44ea-b650-cd988e3b3c35	be9383b6-847b-4894-a2ef-e74c40654076	Just finished watching that new sci-fi series. Totally mind-blowing! Can't wait for season two.\r\n	\N	2025-11-03 01:58:57.797895	2025-11-03 01:58:57.797895	f	\N	\N	\N
7f8cd7dc-1319-4117-b35b-28b69cddadf1	5b9f365c-6c3a-4ffe-b27d-9f809722e313	25°- Clear Sky	\N	2025-11-03 19:25:10.879623	2025-11-03 19:25:10.879623	f	\N	{"lat": -38.9523, "lon": -68.227, "daily": [{"dt": 1762185600, "pop": 0, "uvi": 5.29, "temp": {"day": 24.12, "eve": 25.14, "max": 25.21, "min": 16.63, "morn": 16.63, "night": 19.79}, "clouds": 60, "sunset": 1762211498, "moonset": 1762156500, "summary": "Expect a day of partly cloudy with clear spells", "sunrise": 1762161674, "weather": [{"id": 803, "icon": "04d", "main": "Clouds", "description": "broken clouds"}], "humidity": 27, "moonrise": 1762204440, "pressure": 1008, "wind_deg": 209, "dew_point": 3.97, "wind_gust": 11.46, "feels_like": {"day": 23.29, "eve": 24.36, "morn": 15, "night": 18.87}, "moon_phase": 0.42, "wind_speed": 6.99}, {"dt": 1762272000, "pop": 0, "uvi": 9.18, "temp": {"day": 25.13, "eve": 22.28, "max": 26.41, "min": 15.87, "morn": 16.45, "night": 15.87}, "clouds": 32, "sunset": 1762297966, "moonset": 1762244580, "summary": "You can expect partly cloudy in the morning, with clearing in the afternoon", "sunrise": 1762248009, "weather": [{"id": 802, "icon": "03d", "main": "Clouds", "description": "scattered clouds"}], "humidity": 23, "moonrise": 1762295580, "pressure": 1014, "wind_deg": 122, "dew_point": 2.8, "wind_gust": 17.04, "feels_like": {"day": 24.3, "eve": 21.37, "morn": 15.33, "night": 14.71}, "moon_phase": 0.46, "wind_speed": 12.04}, {"dt": 1762358400, "pop": 1, "uvi": 9.54, "rain": 10.05, "temp": {"day": 22.54, "eve": 16.15, "max": 25.49, "min": 11.17, "morn": 11.17, "night": 15.44}, "clouds": 11, "sunset": 1762384435, "moonset": 1762332960, "summary": "Expect a day of partly cloudy with rain", "sunrise": 1762334345, "weather": [{"id": 502, "icon": "10d", "main": "Rain", "description": "heavy intensity rain"}], "humidity": 33, "moonrise": 1762386840, "pressure": 1019, "wind_deg": 98, "dew_point": 5.37, "wind_gust": 12.16, "feels_like": {"day": 21.71, "eve": 16.04, "morn": 9.6, "night": 15.18}, "moon_phase": 0.5, "wind_speed": 8.87}], "current": {"dt": 1762197896, "temp": 24.95, "weather": [{"id": 800, "icon": "01d", "main": "Clear", "description": "clear sky"}], "humidity": 29, "feels_like": 24.26, "wind_speed": 2.57}, "location": {"city": "Plottier", "state": "Neuquén Province", "country": "AR"}}	\N
254ec008-8c9a-4b54-a87d-ef5cee1d82b0	be9383b6-847b-4894-a2ef-e74c40654076	Je viens de rentrer de Paris. Les croissants étaient incroyables et les couchers de soleil encore plus beaux.\r\n	\N	2025-11-03 02:00:39.548586	2025-11-03 02:00:39.548586	f	\N	\N	\N
4bed7a36-3456-4766-a3db-0012c6300a38	80195420-7e74-4a40-81b1-340ab3536f30	holaaa (desde liveshare :D)	\N	2025-11-04 21:43:42.054017	2025-11-04 21:43:42.054017	f	\N	\N	\N
b94a8d0e-1635-4fcf-ac04-8337a773d7a4	d1c68c25-e938-4437-ba77-477497a4bdd6	Este es otro post	\N	2025-11-04 14:26:13.939068	2025-11-04 14:26:13.939068	t	\N	\N	\N
42903cdc-5986-46e2-a904-8ebd736ea1ea	80195420-7e74-4a40-81b1-340ab3536f30	\N	\N	2025-11-04 18:24:54.261631	2025-11-04 18:24:54.261631	f	\N	\N	59c4bdd9-2e28-4bd2-800c-8e8d25bccf9d
761e0a27-18d4-49cd-a22c-896767fb44ea	80195420-7e74-4a40-81b1-340ab3536f30	\N	\N	2025-11-04 18:25:02.67505	2025-11-04 18:25:02.67505	f	\N	\N	fa6a369a-f138-4cf9-8398-6a10a57f6433
329cc8f9-ba1e-4a08-95d6-3936422edcc6	80195420-7e74-4a40-81b1-340ab3536f30	Wiwiwiw hace calor 3: </3 ghjglghlflfkjgkj	\N	2025-11-04 21:23:41.861723	2025-11-04 21:24:39.578321	f	\N	{"lat": -38.9317, "lon": -67.9787, "daily": [{"dt": 1762272000, "pop": 0, "uvi": 9.37, "temp": {"day": 25.8, "eve": 23.85, "max": 25.8, "min": 16.58, "morn": 16.79, "night": 16.58}, "clouds": 87, "sunset": 1762297904, "moonset": 1762244520, "summary": "There will be partly cloudy today", "sunrise": 1762247952, "weather": [{"id": 804, "icon": "04d", "main": "Clouds", "description": "overcast clouds"}], "humidity": 17, "moonrise": 1762295520, "pressure": 1014, "wind_deg": 241, "dew_point": -0.92, "wind_gust": 16.35, "feels_like": {"day": 24.88, "eve": 23, "morn": 15.62, "night": 14.87}, "moon_phase": 0.46, "wind_speed": 10.89}, {"dt": 1762358400, "pop": 1, "uvi": 9.52, "rain": 1.05, "temp": {"day": 23.13, "eve": 25.21, "max": 26.25, "min": 10.92, "morn": 10.92, "night": 17.56}, "clouds": 8, "sunset": 1762384373, "moonset": 1762332900, "summary": "Expect a day of partly cloudy with rain", "sunrise": 1762334288, "weather": [{"id": 500, "icon": "10d", "main": "Rain", "description": "light rain"}], "humidity": 22, "moonrise": 1762386780, "pressure": 1020, "wind_deg": 86, "dew_point": 0.36, "wind_gust": 13.17, "feels_like": {"day": 22.07, "eve": 24.33, "morn": 9.19, "night": 16.91}, "moon_phase": 0.5, "wind_speed": 7.83}, {"dt": 1762444800, "pop": 1, "uvi": 7.71, "rain": 6.21, "temp": {"day": 21.07, "eve": 22.64, "max": 23.58, "min": 14.48, "morn": 14.79, "night": 16.71}, "clouds": 70, "sunset": 1762470841, "moonset": 1762421640, "summary": "Expect a day of partly cloudy with rain", "sunrise": 1762420626, "weather": [{"id": 501, "icon": "10d", "main": "Rain", "description": "moderate rain"}], "humidity": 54, "moonrise": 1762478040, "pressure": 1011, "wind_deg": 331, "dew_point": 11.3, "wind_gust": 12.95, "feels_like": {"day": 20.64, "eve": 22.03, "morn": 13.76, "night": 16.16}, "moon_phase": 0.54, "wind_speed": 10.46}], "current": {"dt": 1762291370, "temp": 24.04, "weather": [{"id": 803, "icon": "04d", "main": "Clouds", "description": "broken clouds"}], "humidity": 29, "feels_like": 23.26, "wind_speed": 6.17}, "location": {"city": "Cipolletti", "state": "Río Negro Province", "country": "AR"}}	\N
e27ee515-df63-4623-96e8-075eb74126e6	5b9f365c-6c3a-4ffe-b27d-9f809722e313	\N	\N	2025-11-04 19:02:13.668123	2025-11-04 19:02:13.668123	f	\N	\N	4525fac0-ef0b-49a4-8e71-d92106c0700e
559532e0-4f5f-4bb6-ad9a-64f67f5fd444	5b9f365c-6c3a-4ffe-b27d-9f809722e313	Holaaa	\N	2025-11-03 19:25:56.727358	2025-11-03 19:25:56.727358	t	\N	{"lat": -38.9523, "lon": -68.227, "daily": [{"dt": 1762185600, "pop": 0, "uvi": 5.29, "temp": {"day": 24.12, "eve": 25.14, "max": 25.21, "min": 16.63, "morn": 16.63, "night": 19.79}, "clouds": 60, "sunset": 1762211498, "moonset": 1762156500, "summary": "Expect a day of partly cloudy with clear spells", "sunrise": 1762161674, "weather": [{"id": 803, "icon": "04d", "main": "Clouds", "description": "broken clouds"}], "humidity": 27, "moonrise": 1762204440, "pressure": 1008, "wind_deg": 209, "dew_point": 3.97, "wind_gust": 11.46, "feels_like": {"day": 23.29, "eve": 24.36, "morn": 15, "night": 18.87}, "moon_phase": 0.42, "wind_speed": 6.99}, {"dt": 1762272000, "pop": 0, "uvi": 9.18, "temp": {"day": 25.13, "eve": 22.28, "max": 26.41, "min": 15.87, "morn": 16.45, "night": 15.87}, "clouds": 32, "sunset": 1762297966, "moonset": 1762244580, "summary": "You can expect partly cloudy in the morning, with clearing in the afternoon", "sunrise": 1762248009, "weather": [{"id": 802, "icon": "03d", "main": "Clouds", "description": "scattered clouds"}], "humidity": 23, "moonrise": 1762295580, "pressure": 1014, "wind_deg": 122, "dew_point": 2.8, "wind_gust": 17.04, "feels_like": {"day": 24.3, "eve": 21.37, "morn": 15.33, "night": 14.71}, "moon_phase": 0.46, "wind_speed": 12.04}, {"dt": 1762358400, "pop": 1, "uvi": 9.54, "rain": 10.05, "temp": {"day": 22.54, "eve": 16.15, "max": 25.49, "min": 11.17, "morn": 11.17, "night": 15.44}, "clouds": 11, "sunset": 1762384435, "moonset": 1762332960, "summary": "Expect a day of partly cloudy with rain", "sunrise": 1762334345, "weather": [{"id": 502, "icon": "10d", "main": "Rain", "description": "heavy intensity rain"}], "humidity": 33, "moonrise": 1762386840, "pressure": 1019, "wind_deg": 98, "dew_point": 5.37, "wind_gust": 12.16, "feels_like": {"day": 21.71, "eve": 16.04, "morn": 9.6, "night": 15.18}, "moon_phase": 0.5, "wind_speed": 8.87}], "current": {"dt": 1762197896, "temp": 24.95, "weather": [{"id": 800, "icon": "01d", "main": "Clear", "description": "clear sky"}], "humidity": 29, "feels_like": 24.26, "wind_speed": 2.57}, "location": {"city": "Plottier", "state": "Neuquén Province", "country": "AR"}}	\N
4525fac0-ef0b-49a4-8e71-d92106c0700e	5b9f365c-6c3a-4ffe-b27d-9f809722e313	Holaaaa\n	\N	2025-11-03 21:46:16.936541	2025-11-04 19:01:29.220629	t	\N	{"lat": -38.9523, "lon": -68.227, "daily": [{"dt": 1762185600, "pop": 0, "uvi": 5.29, "temp": {"day": 23.57, "eve": 25.95, "max": 25.95, "min": 16.63, "morn": 16.63, "night": 21.02}, "clouds": 100, "sunset": 1762211498, "moonset": 1762156500, "summary": "Expect a day of partly cloudy with clear spells", "sunrise": 1762161674, "weather": [{"id": 804, "icon": "04d", "main": "Clouds", "description": "overcast clouds"}], "humidity": 27, "moonrise": 1762204440, "pressure": 1009, "wind_deg": 209, "dew_point": 3.29, "wind_gust": 11.46, "feels_like": {"day": 22.69, "eve": 25.95, "morn": 15, "night": 20.14}, "moon_phase": 0.42, "wind_speed": 6.99}, {"dt": 1762272000, "pop": 0, "uvi": 9.18, "temp": {"day": 25.13, "eve": 22.28, "max": 26.41, "min": 15.87, "morn": 16.45, "night": 15.87}, "clouds": 32, "sunset": 1762297966, "moonset": 1762244580, "summary": "You can expect partly cloudy in the morning, with clearing in the afternoon", "sunrise": 1762248009, "weather": [{"id": 802, "icon": "03d", "main": "Clouds", "description": "scattered clouds"}], "humidity": 23, "moonrise": 1762295580, "pressure": 1014, "wind_deg": 122, "dew_point": 2.8, "wind_gust": 17.04, "feels_like": {"day": 24.3, "eve": 21.37, "morn": 15.33, "night": 14.71}, "moon_phase": 0.46, "wind_speed": 12.04}, {"dt": 1762358400, "pop": 1, "uvi": 9.54, "rain": 10.05, "temp": {"day": 22.54, "eve": 16.15, "max": 25.49, "min": 11.17, "morn": 11.17, "night": 15.44}, "clouds": 11, "sunset": 1762384435, "moonset": 1762332960, "summary": "Expect a day of partly cloudy with rain", "sunrise": 1762334345, "weather": [{"id": 502, "icon": "10d", "main": "Rain", "description": "heavy intensity rain"}], "humidity": 33, "moonrise": 1762386840, "pressure": 1019, "wind_deg": 98, "dew_point": 5.37, "wind_gust": 12.16, "feels_like": {"day": 21.71, "eve": 16.04, "morn": 9.6, "night": 15.18}, "moon_phase": 0.5, "wind_speed": 8.87}], "current": {"dt": 1762206342, "temp": 25.95, "weather": [{"id": 800, "icon": "01d", "main": "Clear", "description": "clear sky"}], "humidity": 25, "feels_like": 25.95, "wind_speed": 3.6}, "location": {"city": "Plottier", "state": "Neuquén Province", "country": "AR"}}	\N
b4ebef1c-61b9-4cb7-b3a7-b1cd366eab9d	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	Hola este es un post con imagen	\N	2025-11-04 22:20:07.575245	2025-11-04 22:20:07.575245	f	\N	\N	\N
d4e211f8-17d7-4e29-aa99-7c6e7f77b94d	5b9f365c-6c3a-4ffe-b27d-9f809722e313	\N	\N	2025-11-04 22:29:46.195336	2025-11-04 22:29:46.195336	f	\N	\N	b4ebef1c-61b9-4cb7-b3a7-b1cd366eab9d
3ba3939a-9e27-485e-adeb-6db97411d69c	5b9f365c-6c3a-4ffe-b27d-9f809722e313	el clima (26° scattered clouds)	\N	2025-11-04 19:52:52.539035	2025-11-04 19:52:52.539035	f	\N	{"lat": -38.9523, "lon": -68.227, "daily": [{"dt": 1762272000, "pop": 0, "uvi": 9.36, "temp": {"day": 25.76, "eve": 25.09, "max": 26.21, "min": 16.38, "morn": 16.55, "night": 16.74}, "clouds": 58, "sunset": 1762297966, "moonset": 1762244580, "summary": "You can expect partly cloudy in the morning, with clearing in the afternoon", "sunrise": 1762248009, "weather": [{"id": 803, "icon": "04d", "main": "Clouds", "description": "broken clouds"}], "humidity": 18, "moonrise": 1762295580, "pressure": 1014, "wind_deg": 233, "dew_point": -0.29, "wind_gust": 16.41, "feels_like": {"day": 24.86, "eve": 24.18, "morn": 15.44, "night": 15.04}, "moon_phase": 0.46, "wind_speed": 11.66}, {"dt": 1762358400, "pop": 1, "uvi": 9.18, "rain": 3.99, "temp": {"day": 23.07, "eve": 24.63, "max": 26.25, "min": 11.47, "morn": 11.47, "night": 16.25}, "clouds": 12, "sunset": 1762384435, "moonset": 1762332960, "summary": "Expect a day of partly cloudy with rain", "sunrise": 1762334345, "weather": [{"id": 501, "icon": "10d", "main": "Rain", "description": "moderate rain"}], "humidity": 24, "moonrise": 1762386840, "pressure": 1020, "wind_deg": 21, "dew_point": 1.34, "wind_gust": 13.1, "feels_like": {"day": 22.06, "eve": 23.8, "morn": 9.74, "night": 15.81}, "moon_phase": 0.5, "wind_speed": 7.98}, {"dt": 1762444800, "pop": 1, "uvi": 9.5, "rain": 3.45, "temp": {"day": 23.58, "eve": 21.92, "max": 24.75, "min": 14.19, "morn": 14.49, "night": 17.13}, "clouds": 17, "sunset": 1762470903, "moonset": 1762421700, "summary": "Expect a day of partly cloudy with rain", "sunrise": 1762420683, "weather": [{"id": 501, "icon": "10d", "main": "Rain", "description": "moderate rain"}], "humidity": 45, "moonrise": 1762478100, "pressure": 1010, "wind_deg": 1, "dew_point": 10.82, "wind_gust": 11.31, "feels_like": {"day": 23.17, "eve": 21.42, "morn": 13.43, "night": 16.54}, "moon_phase": 0.54, "wind_speed": 8.82}], "current": {"dt": 1762285900, "temp": 25.95, "weather": [{"id": 802, "icon": "03d", "main": "Clouds", "description": "scattered clouds"}], "humidity": 22, "feels_like": 25.95, "wind_speed": 3.6}, "location": {"city": "Plottier", "state": "Neuquén Province", "country": "AR"}}	\N
63fa0b28-286d-44ed-a45d-7b3b560ee119	d1c68c25-e938-4437-ba77-477497a4bdd6	Este es otro post para probar	\N	2025-11-07 22:59:50.32555	2025-11-07 22:59:50.32555	f	\N	\N	\N
a0379596-07ad-4a7d-96ac-4295c2ac7ece	5b9f365c-6c3a-4ffe-b27d-9f809722e313	Holaaa	\N	2025-11-07 23:08:57.730982	2025-11-07 23:08:57.730982	f	\N	\N	\N
73638e29-3797-48c4-84ce-07d977085f84	d1c68c25-e938-4437-ba77-477497a4bdd6	\N	\N	2025-11-04 13:58:58.346831	2025-11-04 13:58:58.346831	f	\N	\N	254ec008-8c9a-4b54-a87d-ef5cee1d82b0
136d62d8-7454-46b6-b0b7-e17150b20aa5	80195420-7e74-4a40-81b1-340ab3536f30	\N	\N	2025-11-04 18:24:17.685509	2025-11-04 18:24:17.685509	f	\N	\N	254ec008-8c9a-4b54-a87d-ef5cee1d82b0
ab987ebc-43a4-453e-bccc-0de54c2d606f	d1c68c25-e938-4437-ba77-477497a4bdd6	Hola otro post hay que limpiar la base de datos después	\N	2025-11-07 23:09:57.442842	2025-11-07 23:09:57.442842	f	\N	\N	\N
\.


--
-- TOC entry 3690 (class 0 OID 17589)
-- Dependencies: 232
-- Data for Name: post_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_metrics (post_id, likes_count, comments_count, views_count, last_interaction, updated_at) FROM stdin;
80914705-57e3-4808-9ce0-410e81f216a1	0	3	0	2025-10-22 17:08:54.813499	2025-10-22 17:20:50.620152
deadbfb7-bba2-4561-9e97-519449449ea5	0	1	0	2025-10-22 17:22:03.540412	2025-10-22 17:22:03.540412
ddd7aaa6-a590-48b4-8176-e42c1147327a	1	0	0	2025-10-23 17:31:34.931154	2025-10-23 17:31:34.931154
84a824df-2214-46b7-ae13-a33c76f2b005	0	2	0	2025-10-23 18:32:37.403593	2025-10-23 18:34:58.881075
364cae1f-6e05-4c37-8022-8e4d4ac4b293	0	2	0	2025-10-29 07:21:31.198357	2025-10-29 07:31:58.04995
254ec008-8c9a-4b54-a87d-ef5cee1d82b0	0	1	0	2025-11-04 22:11:59.012254	2025-11-04 22:11:59.012254
b4ebef1c-61b9-4cb7-b3a7-b1cd366eab9d	2	2	0	2025-11-04 22:28:34.424293	2025-11-04 22:28:34.424293
\.


--
-- TOC entry 3694 (class 0 OID 17637)
-- Dependencies: 236
-- Data for Name: post_topics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_topics (id, post_id, topic_id) FROM stdin;
346f0c4d-e494-4c9d-ab22-b6669d31a3dc	10267df2-83af-4062-b851-59f6119ab6db	a6fc2ea5-ee46-45c6-ae7f-a3c2baefaa92
469a44f3-0387-4445-9e8a-172f5342fd3b	10267df2-83af-4062-b851-59f6119ab6db	d536a9b2-9466-4c4a-860a-c4ab62377615
\.


--
-- TOC entry 3682 (class 0 OID 17109)
-- Dependencies: 224
-- Data for Name: reaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reaction (user_id, post_id, comment_id, created_at, id) FROM stdin;
35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	4cf7e9d5-ce17-4022-a52f-4e4467bcdaf4	\N	2025-10-14 01:47:17.102966	decf7eda-3eb9-4dcc-a9a3-73b7d01aa949
be9383b6-847b-4894-a2ef-e74c40654076	4cf7e9d5-ce17-4022-a52f-4e4467bcdaf4	\N	2025-10-14 10:40:12.305391	0cbe3913-e85b-4bb1-a263-0da6d812cf30
5b9f365c-6c3a-4ffe-b27d-9f809722e313	4cf7e9d5-ce17-4022-a52f-4e4467bcdaf4	\N	2025-10-14 14:45:42.864325	32792bc6-f140-444d-a00f-d7aeae5d438e
80195420-7e74-4a40-81b1-340ab3536f30	\N	9e12dbb2-0a16-4403-8f89-e4f3384a14cf	2025-10-14 21:23:40.460125	881d2b3a-a703-450c-abc3-be8b955f125e
cf3d4890-be5e-4912-b65e-f84d14600734	\N	c3e84027-3f37-4cc3-b55c-6bb6b42c267f	2025-10-14 21:24:39.899707	68a2ed3d-3fa7-493f-8ee9-28b266e252cd
a324b98b-0729-45ad-8294-6916dafaedfd	fa6a369a-f138-4cf9-8398-6a10a57f6433	\N	2025-10-14 22:17:41.531368	3243f3c1-d5d7-4924-be5b-19ee33b7b888
a324b98b-0729-45ad-8294-6916dafaedfd	9c4ccdc1-37dc-4a93-b65d-5374c20c8d80	\N	2025-10-16 14:08:05.97795	7bfe0f45-d6b2-4280-a394-da8473f4b7a8
5b9f365c-6c3a-4ffe-b27d-9f809722e313	056393ad-35fb-4b34-a8b2-15644167bb4e	\N	2025-10-20 17:27:16.901046	3f3ee35e-b470-4b75-9651-fea954b0a4e7
a324b98b-0729-45ad-8294-6916dafaedfd	\N	bc82216e-516f-44d5-a420-4b9fa66d0e06	2025-10-20 18:53:52.228328	62fca5ae-481a-4431-af62-0a4527021201
cf3d4890-be5e-4912-b65e-f84d14600734	79e2032b-cd84-4fa3-9e80-6ee324e6fed3	\N	2025-10-20 19:22:11.61791	c20b234a-ea03-4686-9a11-cbcefc7a9029
a324b98b-0729-45ad-8294-6916dafaedfd	80914705-57e3-4808-9ce0-410e81f216a1	\N	2025-10-22 16:32:38.706184	e3134686-90f6-4e55-8694-173fd17b3fcb
a324b98b-0729-45ad-8294-6916dafaedfd	deadbfb7-bba2-4561-9e97-519449449ea5	\N	2025-10-22 17:21:25.940673	9a85f6bf-6d6d-449a-aff8-62517720a05d
d1c68c25-e938-4437-ba77-477497a4bdd6	79e2032b-cd84-4fa3-9e80-6ee324e6fed3	\N	2025-10-22 19:34:29.135821	107e7008-8947-4c5b-a4ea-b2da32c8fb4f
d1c68c25-e938-4437-ba77-477497a4bdd6	fa6a369a-f138-4cf9-8398-6a10a57f6433	\N	2025-10-22 19:34:36.349874	23e9a18c-afd4-4f5e-9d5c-f284511bd66d
d1c68c25-e938-4437-ba77-477497a4bdd6	4cf7e9d5-ce17-4022-a52f-4e4467bcdaf4	\N	2025-10-22 19:34:39.900343	aec3219c-00fd-4509-a059-37638b48a9db
a324b98b-0729-45ad-8294-6916dafaedfd	ddd7aaa6-a590-48b4-8176-e42c1147327a	\N	2025-10-23 17:31:34.931154	240d6fd5-6417-4e05-8979-529cade2d111
a324b98b-0729-45ad-8294-6916dafaedfd	10267df2-83af-4062-b851-59f6119ab6db	\N	2025-10-23 18:28:47.574785	9ddeffb3-1266-40b8-b03e-a3196bb9102a
a324b98b-0729-45ad-8294-6916dafaedfd	84a824df-2214-46b7-ae13-a33c76f2b005	\N	2025-10-23 18:32:15.646746	c86ee0eb-80ea-4f03-bd93-328c02847ed7
a324b98b-0729-45ad-8294-6916dafaedfd	790ee7ec-7d43-454a-8897-945dabd66e12	\N	2025-10-23 18:32:18.443307	1d7556cc-2ad7-480f-beb5-5109fd39f8a5
35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	d0c2c9b6-7413-4995-908a-bf7bc27bf38c	\N	2025-10-29 06:49:12.638684	c1c5f4a5-4358-4879-a292-383f3eb54c13
be9383b6-847b-4894-a2ef-e74c40654076	254ec008-8c9a-4b54-a87d-ef5cee1d82b0	\N	2025-11-03 05:12:38.969031	083daa6a-1815-41d2-9a99-c15c1d867be8
be9383b6-847b-4894-a2ef-e74c40654076	13123f5f-35d4-44ea-b650-cd988e3b3c35	\N	2025-11-03 05:12:52.318766	c1718bc8-df42-4a9d-b079-75c7dc69da1d
a324b98b-0729-45ad-8294-6916dafaedfd	254ec008-8c9a-4b54-a87d-ef5cee1d82b0	\N	2025-11-04 20:34:06.897089	42d1f0c6-df71-481e-8bc1-61add158c3e2
35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	b4ebef1c-61b9-4cb7-b3a7-b1cd366eab9d	\N	2025-11-04 22:25:52.237986	f8df0486-ae86-471b-98d4-1497b8ad61b7
35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	fa6a369a-f138-4cf9-8398-6a10a57f6433	\N	2025-11-04 22:25:59.715288	12ebb154-3954-42db-8f01-4614fa073187
5b9f365c-6c3a-4ffe-b27d-9f809722e313	b4ebef1c-61b9-4cb7-b3a7-b1cd366eab9d	\N	2025-11-04 22:28:34.424293	4bbdf158-c3aa-4062-853c-e288da2227a3
\.


--
-- TOC entry 3689 (class 0 OID 17278)
-- Dependencies: 231
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (id, reporter_id, target_type, target_id, reason, status, created_at) FROM stdin;
8bf111b9-8c60-4c81-b0e2-8a04d3e20c83	be9383b6-847b-4894-a2ef-e74c40654076	post	4cf7e9d5-ce17-4022-a52f-4e4467bcdaf4	aaaaa	blocked	2025-10-14 08:49:45
b10100e4-4a7f-43a0-82cb-d5e69df985c2	5b9f365c-6c3a-4ffe-b27d-9f809722e313	post	fa6a369a-f138-4cf9-8398-6a10a57f6433	Spam	dismissed	2025-10-14 18:09:35.203644
bef00941-bf15-443f-a834-bb9ac9135c15	80195420-7e74-4a40-81b1-340ab3536f30	post	65f6bba0-c423-4587-890f-6a5dce3c6543	Spam	blocked	2025-10-14 20:28:28.092405
f2cbdec5-05d7-4757-9f9d-9dd5c2bdc09f	80195420-7e74-4a40-81b1-340ab3536f30	post	65f6bba0-c423-4587-890f-6a5dce3c6543	Spam	blocked	2025-10-14 17:44:47
51b1449d-2a2b-4d78-8a95-ea75a3d85797	a324b98b-0729-45ad-8294-6916dafaedfd	post	80914705-57e3-4808-9ce0-410e81f216a1	Spam	blocked	2025-10-14 14:30:48
4dcd5ffa-9672-46a3-94ca-443d80c47d33	5b9f365c-6c3a-4ffe-b27d-9f809722e313	post	65f6bba0-c423-4587-890f-6a5dce3c6543	Spam	blocked	2025-10-14 17:12:07
a538b961-9709-419c-8b58-1a3d543dee1a	5b9f365c-6c3a-4ffe-b27d-9f809722e313	post	65f6bba0-c423-4587-890f-6a5dce3c6543	Spam	blocked	2025-10-14 17:12:56
d65ef715-0b90-431c-934f-56c57a44a11d	a324b98b-0729-45ad-8294-6916dafaedfd	post	80914705-57e3-4808-9ce0-410e81f216a1	Spam	blocked	2025-10-14 14:46:55
3b1a220b-3e00-43d1-a0a0-c64d6bb2f72b	80195420-7e74-4a40-81b1-340ab3536f30	post	65f6bba0-c423-4587-890f-6a5dce3c6543	Spam	blocked	2025-10-14 21:03:00.307152
c983de93-77c2-4b58-996f-08f899c6622d	80195420-7e74-4a40-81b1-340ab3536f30	post	d0c2c9b6-7413-4995-908a-bf7bc27bf38c	Acoso o bullying	blocked	2025-10-14 21:06:13.215655
e642e339-04b5-45a2-b5ee-04549f91a6bf	5b9f365c-6c3a-4ffe-b27d-9f809722e313	post	73ff3cf5-bfab-441d-8969-099cdef743c4	jijijji\n	blocked	2025-10-14 22:21:25.611797
fac71b36-a9b6-4d25-a83c-ebd1b2e0eb4d	5b9f365c-6c3a-4ffe-b27d-9f809722e313	post	fa6a369a-f138-4cf9-8398-6a10a57f6433	aaaa	dismissed	2025-10-14 22:23:47.078851
9b482a79-2369-4316-8f74-6db20bd0ddea	5b9f365c-6c3a-4ffe-b27d-9f809722e313	post	73ff3cf5-bfab-441d-8969-099cdef743c4	Spam	dismissed	2025-10-14 22:21:02.972583
e867c593-6f2a-42f6-8b15-708791c18a42	81bd3780-5622-4f37-8cac-aa8d903f96e2	post	73638e29-3797-48c4-84ce-07d977085f84	Spam	blocked	2025-11-04 17:23:28.914493
72e8f2d8-ce51-4c24-8f5a-7247a52f6960	81bd3780-5622-4f37-8cac-aa8d903f96e2	post	b94a8d0e-1635-4fcf-ac04-8337a773d7a4	Spam	blocked	2025-11-04 17:23:08.247762
5fd43b4b-8a37-4cbb-9da8-5b4d516f8537	5b9f365c-6c3a-4ffe-b27d-9f809722e313	post	254ec008-8c9a-4b54-a87d-ef5cee1d82b0	asdasdas	dismissed	2025-11-04 18:10:02.377883
e1469811-b1e4-4a02-b61d-a405f289132a	81bd3780-5622-4f37-8cac-aa8d903f96e2	post	790ee7ec-7d43-454a-8897-945dabd66e12	Spam	blocked	2025-11-04 17:42:05.76156
72c32570-d3d4-437f-a391-7a469b0a9768	80195420-7e74-4a40-81b1-340ab3536f30	post	254ec008-8c9a-4b54-a87d-ef5cee1d82b0	D:	blocked	2025-11-04 18:49:38.528208
bb592083-0f9f-4b00-ba1d-6a64840f344b	80195420-7e74-4a40-81b1-340ab3536f30	post	559532e0-4f5f-4bb6-ad9a-64f67f5fd444	duplicado	blocked	2025-11-04 19:02:04.296072
214106c6-c7be-412e-976c-28c9c1a0bd81	80195420-7e74-4a40-81b1-340ab3536f30	post	4525fac0-ef0b-49a4-8e71-d92106c0700e	Duplicado	blocked	2025-11-04 19:06:30.386023
39916f2f-e611-45ab-a902-1a08159f9019	5b9f365c-6c3a-4ffe-b27d-9f809722e313	post	254ec008-8c9a-4b54-a87d-ef5cee1d82b0	Fr*nch	dismissed	2025-11-04 18:10:11.354406
4ab61eff-ffc2-432b-9d84-0e160d5399e2	80195420-7e74-4a40-81b1-340ab3536f30	post	3ba3939a-9e27-485e-adeb-6db97411d69c	.	pending	2025-11-04 20:08:51.643934
f29403b3-61d3-4492-810d-ab9ef6e0d07f	80195420-7e74-4a40-81b1-340ab3536f30	post	254ec008-8c9a-4b54-a87d-ef5cee1d82b0	Spam	dismissed	2025-11-04 21:04:57.912215
1d4cf7cd-aeb6-497b-a980-b2b23cd9877a	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	post	329cc8f9-ba1e-4a08-95d6-3936422edcc6	Spam	dismissed	2025-11-04 22:34:55.435902
\.


--
-- TOC entry 3693 (class 0 OID 17627)
-- Dependencies: 235
-- Data for Name: topics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.topics (id, name) FROM stdin;
d043f96a-a26d-4c86-9d0e-bda58e69428b	deportes
28d55756-3383-4f0b-a96b-74df5ace07ee	tecnología
e1e42703-7dee-4890-a2ee-c17b6c6832a0	política
a6fc2ea5-ee46-45c6-ae7f-a3c2baefaa92	música
d3561d4a-72fb-4b3f-a77b-5ce9763c4eab	moda
d536a9b2-9466-4c4a-860a-c4ab62377615	arte
661c3343-f476-4ac2-a1b8-88f4654e3018	viajes
fa0871f0-71af-4940-a6e3-6c4c19b67a30	juegos
62b75dd9-ae88-4bc2-9d91-14e25de9059e	gaming
5d24b3e2-87fb-4819-a538-906b147ee77b	programación
05ad169c-80d7-4db1-a88e-37e3b1990f9f	educación
add5e8ba-2a5c-4dc6-8a75-b93ac4e3d663	salud
2a7928ba-2337-485b-a9ef-62abe1d062ea	comida
aaae5dd3-e24c-403a-b12b-4b6562480814	fitness
\.


--
-- TOC entry 3681 (class 0 OID 17087)
-- Dependencies: 223
-- Data for Name: user_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_comments (id, author_id, post_id, text, created_at, parent_id, updated_at, author_avatar) FROM stdin;
705a709b-1316-4a03-a554-c8242d378628	a324b98b-0729-45ad-8294-6916dafaedfd	ddd7aaa6-a590-48b4-8176-e42c1147327a	hola	2025-10-22 17:06:20.797296	\N	\N	\N
09c0632e-4421-4268-a47b-06d67475d10a	a324b98b-0729-45ad-8294-6916dafaedfd	80914705-57e3-4808-9ce0-410e81f216a1	Hola? Creo que me da error 500	2025-10-22 17:17:22.241342	\N	\N	\N
9e3f7eca-e5a1-448f-9991-6ee496c38e11	a324b98b-0729-45ad-8294-6916dafaedfd	deadbfb7-bba2-4561-9e97-519449449ea5	WOW QUIERO VER SI EL FEED PERSONALIZADO ANDA WOW	2025-10-22 17:22:03.540412	\N	\N	\N
bc82216e-516f-44d5-a420-4b9fa66d0e06	a324b98b-0729-45ad-8294-6916dafaedfd	ddd7aaa6-a590-48b4-8176-e42c1147327a	rabiosaaaaaa	2025-10-14 01:42:48.801177	\N	2025-10-22	\N
b68b8048-c61c-44e7-9466-26079611084c	a324b98b-0729-45ad-8294-6916dafaedfd	84a824df-2214-46b7-ae13-a33c76f2b005	it works?	2025-10-23 18:34:58.881075	\N	\N	\N
cc1459c5-ea81-4bcc-bb9d-e963937dfa66	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	364cae1f-6e05-4c37-8022-8e4d4ac4b293	hi\n	2025-10-29 07:31:58.04995	\N	\N	\N
239a0214-9066-4318-9b06-4c6ab539b3cf	5b9f365c-6c3a-4ffe-b27d-9f809722e313	b4ebef1c-61b9-4cb7-b3a7-b1cd366eab9d	Holaaaa\n	2025-11-04 22:25:39.615965	\N	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1762291903/TpFinal/user/profilePicture/5b9f365c-6c3a-4ffe-b27d-9f809722e313-1762291898388.png
2ecce863-9b9c-47bf-9a92-196095280749	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	056393ad-35fb-4b34-a8b2-15644167bb4e	hola este es un comentario\n\n	2025-10-13 18:54:30.868589	\N	\N	\N
44df89cd-809a-41af-99b4-a5ad50739835	a324b98b-0729-45ad-8294-6916dafaedfd	ddd7aaa6-a590-48b4-8176-e42c1147327a	lola la rata con cola	2025-10-14 01:54:34.315746	\N	\N	\N
38ece3f6-1549-482f-97be-32b718f44504	a324b98b-0729-45ad-8294-6916dafaedfd	ddd7aaa6-a590-48b4-8176-e42c1147327a	aber	2025-10-14 01:57:07.882722	\N	\N	\N
ff4f1d22-eb90-4dd6-b4b2-accfe55ded4f	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	4cf7e9d5-ce17-4022-a52f-4e4467bcdaf4	comentario 1	2025-10-14 06:54:01.549629	\N	\N	\N
4f018131-346e-4498-8da2-6c83473377b2	be9383b6-847b-4894-a2ef-e74c40654076	9c4ccdc1-37dc-4a93-b65d-5374c20c8d80	hola	2025-10-14 11:59:29.423807	\N	\N	\N
81982816-9c16-4164-99a2-d52a53f49cfb	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	4cf7e9d5-ce17-4022-a52f-4e4467bcdaf4	magnificent	2025-10-14 11:58:48.19749	\N	\N	\N
9b1e92c6-47c2-4f7d-900c-59198bb5571d	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	4cf7e9d5-ce17-4022-a52f-4e4467bcdaf4	hola	2025-10-14 12:34:11.753421	\N	\N	\N
f3d3150b-c2e7-43df-a6e7-e63754be5667	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	4cf7e9d5-ce17-4022-a52f-4e4467bcdaf4	😼	2025-10-14 13:54:25.81863	\N	\N	\N
a1bb9bb7-e8a3-430a-aa4f-a5ff26634435	a324b98b-0729-45ad-8294-6916dafaedfd	fa6a369a-f138-4cf9-8398-6a10a57f6433	Hola :)	2025-10-14 14:09:58.488422	\N	\N	\N
db418797-4bdc-48bf-9e34-9108f4573c18	5b9f365c-6c3a-4ffe-b27d-9f809722e313	4cf7e9d5-ce17-4022-a52f-4e4467bcdaf4	Holiss\n	2025-10-14 14:42:31.271645	\N	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1760983976/TpFinal/user/profilePicture/5b9f365c-6c3a-4ffe-b27d-9f809722e313-1760983975048.png
7b5061a3-cf05-422d-9223-5aa797e228ff	5b9f365c-6c3a-4ffe-b27d-9f809722e313	65f6bba0-c423-4587-890f-6a5dce3c6543	Holaaa	2025-10-14 20:06:35.830592	\N	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1760983976/TpFinal/user/profilePicture/5b9f365c-6c3a-4ffe-b27d-9f809722e313-1760983975048.png
d99737f5-4386-47f3-a32c-9cbe1a8ccbfb	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	65f6bba0-c423-4587-890f-6a5dce3c6543	Como estas? :3	2025-10-14 20:06:49.979861	7b5061a3-cf05-422d-9223-5aa797e228ff	\N	\N
25df89ca-0451-4dd8-8711-1e85acd1af27	5b9f365c-6c3a-4ffe-b27d-9f809722e313	65f6bba0-c423-4587-890f-6a5dce3c6543	wiwiwi	2025-10-14 20:08:47.617709	d99737f5-4386-47f3-a32c-9cbe1a8ccbfb	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1760983976/TpFinal/user/profilePicture/5b9f365c-6c3a-4ffe-b27d-9f809722e313-1760983975048.png
ec833a80-364b-426b-b9e8-dcb54f054d32	cf3d4890-be5e-4912-b65e-f84d14600734	fa6a369a-f138-4cf9-8398-6a10a57f6433	lol	2025-10-14 21:10:44.812347	a1bb9bb7-e8a3-430a-aa4f-a5ff26634435	\N	\N
ed7e19cd-8823-4b19-b1e4-9625c31102d7	cf3d4890-be5e-4912-b65e-f84d14600734	fa6a369a-f138-4cf9-8398-6a10a57f6433	hola	2025-10-14 21:11:00.662351	ec833a80-364b-426b-b9e8-dcb54f054d32	\N	\N
36dcf988-efee-4c86-8e78-ed119b69ea9e	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	4cf7e9d5-ce17-4022-a52f-4e4467bcdaf4	increible	2025-10-14 21:19:21.462404	\N	\N	\N
a182cce2-8b06-4a3b-abe0-908a75d8e103	80195420-7e74-4a40-81b1-340ab3536f30	fa6a369a-f138-4cf9-8398-6a10a57f6433	Holaaa\n	2025-10-14 21:20:08.237387	\N	\N	
c3e84027-3f37-4cc3-b55c-6bb6b42c267f	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	4cf7e9d5-ce17-4022-a52f-4e4467bcdaf4	Wiwiwi	2025-10-14 21:22:46.463704	9e12dbb2-0a16-4403-8f89-e4f3384a14cf	\N	\N
b1b47901-fcdb-4e08-bf2b-b03105ae2e9f	cf3d4890-be5e-4912-b65e-f84d14600734	4cf7e9d5-ce17-4022-a52f-4e4467bcdaf4	soy user test	2025-10-14 21:23:16.585204	\N	\N	\N
9e12dbb2-0a16-4403-8f89-e4f3384a14cf	80195420-7e74-4a40-81b1-340ab3536f30	4cf7e9d5-ce17-4022-a52f-4e4467bcdaf4	Holisss :3 :>	2025-10-14 21:21:04.800246	\N	2025-10-14	
5dda6f5f-179b-432c-969e-7fb4af8b03e0	a324b98b-0729-45ad-8294-6916dafaedfd	4cf7e9d5-ce17-4022-a52f-4e4467bcdaf4	wuwuw\n	2025-10-14 22:31:16.95333	c3e84027-3f37-4cc3-b55c-6bb6b42c267f	\N	\N
c7199a66-838f-46d5-91a3-6fb473474c00	a324b98b-0729-45ad-8294-6916dafaedfd	80914705-57e3-4808-9ce0-410e81f216a1	Descripción del comentario	2025-10-22 17:08:54.813499	\N	\N	\N
96bb60c9-ba03-4463-bfd5-e61539f799b2	a324b98b-0729-45ad-8294-6916dafaedfd	80914705-57e3-4808-9ce0-410e81f216a1	buenou	2025-10-22 17:20:50.620152	\N	\N	\N
6240e1ee-bf66-4a71-a700-8df6340a95e6	a324b98b-0729-45ad-8294-6916dafaedfd	84a824df-2214-46b7-ae13-a33c76f2b005	shake it off 	2025-10-23 18:32:37.403593	\N	\N	\N
21efb11c-e041-4577-b6b8-c331c62edbc4	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	364cae1f-6e05-4c37-8022-8e4d4ac4b293	Hola	2025-10-29 07:21:31.198357	\N	\N	\N
7793c5da-d084-419b-b068-663a76b9e08d	35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	254ec008-8c9a-4b54-a87d-ef5cee1d82b0	Hola	2025-11-04 22:11:59.012254	\N	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1762292679/TpFinal/user/profilePicture/35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2-1762292672468.jpg
53be3c47-06ff-412f-8271-04fa7acdfa11	5b9f365c-6c3a-4ffe-b27d-9f809722e313	b4ebef1c-61b9-4cb7-b3a7-b1cd366eab9d	En cadena	2025-11-04 22:27:37.271246	239a0214-9066-4318-9b06-4c6ab539b3cf	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1762291903/TpFinal/user/profilePicture/5b9f365c-6c3a-4ffe-b27d-9f809722e313-1762291898388.png
\.


--
-- TOC entry 3691 (class 0 OID 17609)
-- Dependencies: 233
-- Data for Name: user_interactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_interactions (id, user_id, post_id, interaction_type, created_at) FROM stdin;
1314084d-7bb3-4f75-a6ba-06110215b50f	a324b98b-0729-45ad-8294-6916dafaedfd	ddd7aaa6-a590-48b4-8176-e42c1147327a	like	2025-10-23 17:31:35.109504
3ef810b4-6ee3-4466-9706-0944f8232326	a324b98b-0729-45ad-8294-6916dafaedfd	10267df2-83af-4062-b851-59f6119ab6db	like	2025-10-23 18:28:47.752396
e30018c9-0f9e-435c-b8fa-956c05f0dea8	a324b98b-0729-45ad-8294-6916dafaedfd	84a824df-2214-46b7-ae13-a33c76f2b005	like	2025-10-23 18:32:15.824115
cb3c25ea-9983-4b03-aec3-a8123c132d48	a324b98b-0729-45ad-8294-6916dafaedfd	790ee7ec-7d43-454a-8897-945dabd66e12	like	2025-10-23 18:32:18.617068
3faefd94-b9c7-4363-8ecd-1c8e826678b3	a324b98b-0729-45ad-8294-6916dafaedfd	84a824df-2214-46b7-ae13-a33c76f2b005	comment	2025-10-23 18:34:59.063258
\.


--
-- TOC entry 3692 (class 0 OID 17619)
-- Dependencies: 234
-- Data for Name: user_interests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_interests (id, user_id, topic_id, weight) FROM stdin;
\.


--
-- TOC entry 3677 (class 0 OID 17032)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, username, displayname, bio, profile_picture_url, created_at, updated_at, role, status, city, country_iso) FROM stdin;
aeeed781-9123-439d-86d7-3ea7a61de1af	larry.reid@example.com	$2b$10$XVYwLwsI59qf5nsHAwF43Oxfb55wQF2vQ1Bvd2jVOp6LGzYdulDiK	organicostrich332	Larry Reid	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/18.jpg	2025-11-02 22:53:34.921442	2025-11-02 22:53:34.921442	USER	ACTIVE	Carrigaline	IE
cc668db5-002d-4262-ace6-5fb6c487de35	terrance.williams@example.com	$2b$10$SFt6ouVMKiJxMzZ7okI1Z.kgVjYhVpeYLgXIOlF81M6/qzurUvLd6	happyleopard735	Terrance Williams	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/17.jpg	2025-11-02 22:53:35.644037	2025-11-02 22:53:35.644037	USER	ACTIVE	Pembroke Pines	US
c1ff17c4-3d28-4f71-ac65-d2217f869ac4	elias.kumar@example.com	$2b$10$8darcjDSuEP2jbt0/ioyGe0INqEauBUum2DgvdBs9iIyRZlQQei1m	greenelephant492	Elias Kumar	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/76.jpg	2025-11-02 22:53:36.387022	2025-11-02 22:53:36.387022	USER	ACTIVE	Glomfjord	NO
18819d3d-c7a1-4510-9887-42a3e2c220b2	layla.wilson@example.com	$2b$10$9dJZBd7SnzMi8UVYcAGUfuSGE/RqqrxrvQSC1yFzobmS16zGQFCXu	bluefish902	Layla Wilson	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/30.jpg	2025-11-02 22:53:37.30841	2025-11-02 22:53:37.30841	USER	ACTIVE	Masterton	NZ
98a56bb0-04da-4176-890d-1ce42e6a25b0	nuria.pena@example.com	$2b$10$nXb7OimINMq2jrKwO1L7E.QyPmVCdW9bES6Q4I5EYmVqXFZjZjB5u	heavylion495	Nuria Peña	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/79.jpg	2025-11-02 22:53:38.334955	2025-11-02 22:53:38.334955	USER	ACTIVE	La Palma	ES
be9383b6-847b-4894-a2ef-e74c40654076	uriviachoi@gmail.com	$2b$10$YTrlW3cEH2rE7lSh2TuoWO8pxnGsapQIEPD75K4BjUlDlOMEQLboq	Usuario_Prueba3	Hera	\N	\N	2025-09-28 19:05:16.318537	2025-09-29 13:46:37.72217	USER	ACTIVE	\N	\N
16b690be-51cd-4c10-a411-6efd60bb87a1	mahir.danielsen@example.com	$2b$10$z9S7MHBDvisia2wrbFCXLef8mWWH8KlRK8LPWohZ0ZIT/Umr9O8tq	blackzebra633	Mahir Danielsen	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/4.jpg	2025-11-02 22:53:39.561366	2025-11-02 22:53:39.561366	USER	ACTIVE	Norderhov	NO
c8f0d3c9-70e7-4ac8-9206-69083f0b58fc	hitesh.gupta@example.com	$2b$10$C52nuwAJunhub8UH2fHibeaCftacS1gv5UH4cunG5BRK.weuHVISO	bigkoala101	Hitesh Gupta	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/90.jpg	2025-11-02 22:53:40.480245	2025-11-02 22:53:40.480245	USER	ACTIVE	Dharmavaram	IN
898eb0ae-923c-4c0f-9c44-5ac48ca6df0e	florencia.russo@est.fi.uncoma.edu.ar	$2b$10$3ZTeTZmP/m0eHg53aZTmSOzLWk0rFle/HsdAKxllY7wJH.Hd/5Ypy	Florrrrr	Florchu	holu	https://res.cloudinary.com/dtybvnx2h/image/upload/v1762292767/TpFinal/user/profilePicture/898eb0ae-923c-4c0f-9c44-5ac48ca6df0e-1762292763834.jpg	2025-09-29 22:01:21.80937	2025-11-04 21:46:08.270274	USER	ACTIVE	Albany	AU
35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2	brisa.celayes@est.fi.uncoma.edu.ar	$2b$10$UrhbXW9EOWdG7NI8G5AnluW4ADhqaPddpH3w0LGQdcRRRWMTLGyJC	brisa.celayes	Brisa Celayes	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1762292679/TpFinal/user/profilePicture/35bcb00c-ef0b-4a07-bdc0-d3c1a2b567e2-1762292672468.jpg	2025-09-30 17:15:12	2025-11-04 21:44:40.699278	USER	ACTIVE	General Roca	AR
cf3d4890-be5e-4912-b65e-f84d14600734	ragbrosenthusiast@gmail.com	$2b$10$l.60V4bsdKC3ZXoxkrEQOOTQ09v8mGnJpO1bHKdVomFrTWttRnKiS	Usuario_Prueba2	Prueba	hola, esta es la bio	\N	2025-09-27 03:56:16	2025-09-30 17:30:56	ADMIN	ACTIVE	\N	\N
b2e631ab-46cf-4cd8-9fb0-37169d2eefb0	spotifyapiapp.2025@gmail.com	$2b$10$eVB700S.BtVwSxXBmAfY8.udV.mUPlCo4az8ugpli6zNnW8DS62X6	spotifyapiapp.2025	OurApp	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1761863575/TpFinal/user/profilePicture/b2e631ab-46cf-4cd8-9fb0-37169d2eefb0-1761863572118.png	2025-10-30 20:29:45.510812	2025-10-31 23:26:41.744392	USER	ACTIVE	Aomori	JP
a4b3e602-adc6-48a7-b407-498af61e9f3c	brisacelayesabril@gmail.com	$2b$10$zKurz4alRU3/17deP5Z2y.iQtLcI5PX0CUeET89x.3BVNW4VkrgyC	brisacelayesabril	Brisa Celayes	\N	https://lh3.googleusercontent.com/a/ACg8ocLvq46EvYmjPoZmdlkC20fqtv3ES853rLsOAKXnMBPu_zJizYQ=s96-c	2025-11-01 02:22:20.740735	2025-11-01 02:22:20.740735	USER	ACTIVE	\N	\N
81bd3780-5622-4f37-8cac-aa8d903f96e2	russoflorencia363@gmail.com	$2b$10$xCig.Wj5AgGWvhqaqO0lB.lPopVkduvJFOicsRp7glFjQLatOAC12	Florencia Russo	Florchu	\N	\N	2025-10-13 20:26:58.100285	2025-10-13 20:27:29.342984	USER	ACTIVE	\N	\N
08e47ca2-ee15-44f0-9daa-9f1f5e1522b5	niklas.lundekvam@example.com	$2b$10$zLeXoABc0lbkvzttM9AkDuRise0iE5TIMsb8MO1G/3gg0eth84Ape	purpleostrich410	Niklas Lundekvam	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/11.jpg	2025-11-02 22:53:30.221703	2025-11-02 22:53:30.221703	USER	ACTIVE	Skjeberg	NO
d1c68c25-e938-4437-ba77-477497a4bdd6	celayes.brisaabril@gmail.com	$2b$10$heNy7wvmFyckwuzsSCxakeelm9avJkNF8hEkPpltUBVU6GcDgV0.q	nyva_roo	Nyva	\N	\N	2025-10-22 19:27:56.555546	2025-10-22 19:32:06.539876	USER	ACTIVE	\N	\N
0ae8f8db-dde3-43a3-93b9-c2a1e5d07973	mlyn.hmdy@example.com	$2b$10$6gSILIr8YOGf9lJEnNEGKeJWcuvoS62XyMKqEny7rSveUbNonbSSa	orangegorilla483	ملینا احمدی	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/87.jpg	2025-11-02 22:53:31.005422	2025-11-02 22:53:31.005422	USER	ACTIVE	اهواز	IR
b4d3b61f-f9e7-44d1-803d-c3506138cb3f	yandel.gaytan@example.com	$2b$10$PZpqN5EDij4xHCxJIrTwouXM5.EE.9KTmBMOaLn09u7PNIYSARcsu	organicmeercat778	Yandel Gaytán	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/37.jpg	2025-11-02 22:53:31.723567	2025-11-02 22:53:31.723567	USER	ACTIVE	Dzibalchen	MX
bc43de13-fd3a-4804-9b98-66515e8b440c	chaitra.kumar@example.com	$2b$10$/MYr/8KWN9TCD92JNXVj0el3UOFcY8cIzU9x4rU4zIDFlSVoJiboq	yellowrabbit262	Chaitra Kumar	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/45.jpg	2025-11-02 22:53:32.463294	2025-11-02 22:53:32.463294	USER	ACTIVE	Shahjahanpur	IN
eb99829c-842a-4f4b-beea-fd302e93549a	bill.jordan@example.com	$2b$10$0lqTQSBxZ8GEfmfMyUmeMuBdrWj2PtBHIJ65orbF2tryc9h0sZZny	happyfish720	Bill Jordan	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/7.jpg	2025-11-02 22:53:41.286253	2025-11-02 22:53:41.286253	USER	ACTIVE	Port Macquarie	AU
ed22c048-f044-4315-a59a-e34cbc94e2c7	ricky.willis@example.com	$2b$10$L6rjoyJNLeSXGRRpJtkimuJJRfEuphG9Cz6fqnjuKO40.g2AK/af.	crazycat418	Ricky Willis	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/35.jpg	2025-11-02 22:53:42.432141	2025-11-02 22:53:42.432141	USER	ACTIVE	Manchester	GB
b0b00d46-259d-480f-9f0c-b7eaa0c056c8	horacio.acosta@example.com	$2b$10$x9DyqMLRC89TfRNhQiUGmut5KXifAnRIR2bwZhlYPSagFF3VbpsGm	redrabbit846	Horacio Acosta	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/8.jpg	2025-11-02 22:53:33.289578	2025-11-02 22:53:33.289578	USER	ACTIVE	La Ventosa	MX
c367c2f9-a5a7-424d-ba84-8b9a7f7193df	ruzica.lucic@example.com	$2b$10$vOxyxSSxgPWo9ngnHEddp.mNjPxOgNxATh9.E7zXo2WdxdWPF3cQC	tinygorilla549	Ružica Lučić	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/3.jpg	2025-11-02 22:53:34.201989	2025-11-02 22:53:34.201989	USER	ACTIVE	Ljubovija	RS
bf015106-b009-4020-abef-20f51c92bc4d	leidemere.lima@example.com	$2b$10$0Plp/WvXMyja39M6kk1C6ephMfThmOK3EyKgwKVkmz/fNMzU25uk6	yellowduck251	Leidemere Lima	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/39.jpg	2025-11-03 18:33:44.516736	2025-11-03 18:33:44.516736	USER	ACTIVE	Santa Cruz do Sul	BR
5973cba0-8eb2-48e5-8ab9-d534ef4f5ed4	thn.aalyzdh@example.com	$2b$10$Pt/otDtQALkvK6EOF2VIAOeldZO58.bhMkLyFWdBAWHzimZn4yxTq	greenostrich521	ثنا علیزاده	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/77.jpg	2025-11-03 18:33:44.946609	2025-11-03 18:33:44.946609	USER	ACTIVE	ایلام	IR
a324b98b-0729-45ad-8294-6916dafaedfd	russoflorencia96@gmail.com	$2b$10$I2szbnhuQ.Qiq5U6eXRNaOnZ3yr9f9NcXXwLhVFh/7aMtcy1E1G2S	Florcita	Flor08	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1762291929/TpFinal/user/profilePicture/a324b98b-0729-45ad-8294-6916dafaedfd-1762291928241.jpg	2025-09-29 19:12:50	2025-11-04 21:32:10.211798	ADMIN	ACTIVE	General Las Heras	AR
19b5e66b-3ece-49e6-b951-47ae7e4cdd4a	nathaniel.white@example.com	$2b$10$xVguqnxEgPaLAkY7xQBV6e2lWYuwZ.rkOh8adw0OlSKTu8vCUW2CW	whitemeercat372	Nathaniel White	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/87.jpg	2025-11-03 18:33:45.376472	2025-11-03 18:33:45.376472	USER	ACTIVE	Dunedin	NZ
2d015567-5bf0-4e9e-bd5e-d7ceefaebdf8	vseslava.galchuk@example.com	$2b$10$hxdawOpZl1cbEgaehb.d5On5uc8yq3koeBLofjpVHP4pViwvexv/i	smallswan890	Vseslava Galchuk	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/77.jpg	2025-11-03 18:33:45.783257	2025-11-03 18:33:45.783257	USER	ACTIVE	Ternivka	UA
3f55bcc6-ffea-449a-912c-c2d662a14e8f	philip.dunn@example.com	$2b$10$fsBVyfv.Jw9J1oAcO2hSseVAHLdgA4xgKo0CulQuUNNchLSWliCA6	crazypeacock272	Philip Dunn	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/55.jpg	2025-11-03 18:33:46.186517	2025-11-03 18:33:46.186517	USER	ACTIVE	Cambridge	GB
aaecf944-3435-4a2c-b92d-e364b26b3b2e	franco.meertens@example.com	$2b$10$nMvQ07lRuHavxc1DkKvlCOG14xrJULioG.9Ts0WP5tRA2mD2SlTP.	sadmouse761	Franco Meertens	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/84.jpg	2025-11-03 18:33:46.584562	2025-11-03 18:33:46.584562	USER	ACTIVE	Nieuweschild	NL
32893c41-8d0c-4aac-a745-993bb2fac2c3	nanna.christiansen@example.com	$2b$10$im1h6nLcEn6dUzbwMZLhsuSZvJxu4Zs7FpM7AwLWVVszwkQaPe9oq	beautifulkoala310	Nanna Christiansen	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/83.jpg	2025-11-03 18:33:47.031483	2025-11-03 18:33:47.031483	USER	ACTIVE	Kongens  Lyngby	DK
c6ae2147-e738-4540-a176-507bb06f8cf4	armyt.aalyzdh@example.com	$2b$10$fX4BZb/nifAkW6bwbgRYse13A1mn3T83/HOKfyzIPiPXRXtNBgY5u	ticklishbear578	آرمیتا علیزاده	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/59.jpg	2025-11-03 18:33:47.496846	2025-11-03 18:33:47.496846	USER	ACTIVE	خمینی‌شهر	IR
d4af7f02-9d52-41a5-8990-9e761ce937e2	zhdan.zubrickiy@example.com	$2b$10$Rq1cfTBcq3PWfcOcmIz7DO3R45pwipEmnML.290jrdDYDP5x/Q2ka	smallostrich741	Zhdan Zubrickiy	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/58.jpg	2025-11-03 18:33:47.960874	2025-11-03 18:33:47.960874	USER	ACTIVE	Novograd-Volinskiy	UA
1c1f8e5c-2d4d-46d9-b9f2-777eda1206e8	remedios.lozano@example.com	$2b$10$Dvn4B2xz.fH892oPNklB1uOjn/3WjZrLS66ArO.eI6v3GPi05gpGm	heavyfish431	Remedios Lozano	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/40.jpg	2025-11-03 18:33:48.468093	2025-11-03 18:33:48.468093	USER	ACTIVE	Guadalajara	ES
8b812eff-b821-4109-93ad-f092934988c1	oliver.kangas@example.com	$2b$10$sOrwsW6CfpprfAcfG0aJkuB5dktug3pjztIBpYX8n8ZJRZiD2FoOe	redwolf719	Oliver Kangas	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/46.jpg	2025-11-03 18:33:49.189929	2025-11-03 18:33:49.189929	USER	ACTIVE	Rautalampi	FI
7dacd21e-a494-4318-8ee0-79fee2c16814	aubrey.hamilton@example.com	$2b$10$AvI3imjigBxKDrVrFYt6AuARK/qiWFj2G8iXaIfVfDPnQDd.ZUzoe	bigtiger502	Aubrey Hamilton	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/25.jpg	2025-11-03 18:33:49.681461	2025-11-03 18:33:49.681461	USER	ACTIVE	Durham	US
e472d93c-e83f-45ab-a9b0-62167d85b702	aaron.morris@example.com	$2b$10$lvuwmwY0OCDVqGXghHBvX.rmO8Ja4EN1vJNobBeQpKBWjMc4/YU6u	redduck616	Aaron Morris	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/94.jpg	2025-11-03 18:33:50.154355	2025-11-03 18:33:50.154355	USER	ACTIVE	Tauranga	NZ
cb22dc8c-1841-4c32-8ff8-f60788c96438	louis.mackay@example.com	$2b$10$AAGsRUl1BsoDrIz2UQgxgek5lXzRnSjOwMql9Y09KJu1yCp8/a1CC	redladybug602	Louis Mackay	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/62.jpg	2025-11-03 18:33:50.656858	2025-11-03 18:33:50.656858	USER	ACTIVE	Sherbrooke	CA
00eefc0c-3022-4132-adc5-bd648687f69c	bobbie.robertson@example.com	$2b$10$ldB6UID/EVYCZr0VVECS3Op5fnWqV92lQosMYAzrcl1XESpmLveh6	bigzebra302	Bobbie Robertson	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/34.jpg	2025-11-03 18:33:51.285498	2025-11-03 18:33:51.285498	USER	ACTIVE	Mesa	US
0d843c45-ef02-4f71-83e3-96347b47f58e	ruben.aguilar@example.com	$2b$10$n.wKScUtCJ5NlVyrrJVLHOAwf1hPR1Gfj6CcoA68YpnV1vR1/7Zbm	ticklishtiger325	Rubén Aguilar	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/0.jpg	2025-11-03 21:44:55.439477	2025-11-03 21:44:55.439477	USER	ACTIVE	Alcobendas	ES
63828c4b-7e65-41e5-a193-722936cd9524	kathleen.peterson@example.com	$2b$10$whAWxVJKYFiD8fBedbxgROZqwaSQpE1KNdN7YLUxR1oO2cxy92La2	happyelephant991	Kathleen Peterson	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/46.jpg	2025-11-03 21:44:55.84818	2025-11-03 21:44:55.84818	USER	ACTIVE	Athenry	IE
71977f65-f641-4df3-9d5b-4483bfbbeaa6	magnus.christiansen@example.com	$2b$10$sdaX82tVsRv.ewbL5EWbYuYBEFXQ8mVNUSPW1Vbs1DfTanHGAbBru	happyleopard732	Magnus Christiansen	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/46.jpg	2025-11-03 21:44:56.271158	2025-11-03 21:44:56.271158	USER	ACTIVE	Rødvig Stevns	DK
e7e12b60-26ec-450c-85ba-143b28bc6ea5	afsar.kirac@example.com	$2b$10$E9nw5pnaVQV5KI/x.FRF/eFwqYTAS1wEVApFQax3GQaSgYb..Dxsa	sadladybug510	Afşar Kıraç	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/15.jpg	2025-11-03 21:44:56.669941	2025-11-03 21:44:56.669941	USER	ACTIVE	Kocaeli	TR
2684fc10-9e04-4f2c-942a-4487f46b5bbd	pavitra.shah@example.com	$2b$10$tsSjtCvn3r0p4rL3HYlQwujDFNPiQzc152KunDit2TnQq24QJsjzC	greensnake733	Pavitra Shah	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/56.jpg	2025-11-03 21:44:57.081228	2025-11-03 21:44:57.081228	USER	ACTIVE	Hajipur	IN
da14f89d-4350-4234-8851-8bc680b23778	johan.andersen@example.com	$2b$10$6DNkwMKzmWdPAygmN0C/D.bnCimjWaVuTvzkbBx6sjVk.2AONLYlC	beautifulcat642	Johan Andersen	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/46.jpg	2025-11-03 21:44:57.490235	2025-11-03 21:44:57.490235	USER	ACTIVE	Jystrup	DK
5ff4dc09-39e6-412e-ade6-ef365ed3ee1f	jolijn.helleman@example.com	$2b$10$EKG0CZaHFc7tzW1Te0Ml4ulnsEmHvKr72F/hyoVsglD6.MpmsNoa.	heavyelephant479	Jolijn Helleman	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/21.jpg	2025-11-03 21:44:57.891532	2025-11-03 21:44:57.891532	USER	ACTIVE	Rothem	NL
64626d53-47cd-4d04-b3dc-328af08bd3f1	nete.rocha@example.com	$2b$10$PfNdrLLEC.FgAQw2ulRDUeJdW/TmzhLfwSUu.AJlJyLtrnB9c2nvu	redfish410	Nete Rocha	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/83.jpg	2025-11-03 21:44:58.289965	2025-11-03 21:44:58.289965	USER	ACTIVE	Parnamirim	BR
8ac4edfb-a601-428a-816f-2b058c78a0c0	oona.leinonen@example.com	$2b$10$UsERyyitO64GOtcYFZyO0OeIpROMzET89fbYCnuIGtgnNuRhc4B82	angrygoose880	Oona Leinonen	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/90.jpg	2025-11-03 21:44:58.731295	2025-11-03 21:44:58.731295	USER	ACTIVE	Raisio	FI
312bc299-86bc-49cc-9bf9-3a8bdc754c63	miro.ahonen@example.com	$2b$10$N98SSms5n656Okyzpde.5ec7j8mdte5Fg4WDqPGuPyvAxoRv0Fp4q	greendog138	Miro Ahonen	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/63.jpg	2025-11-03 21:44:59.132666	2025-11-03 21:44:59.132666	USER	ACTIVE	Riihimäki	FI
3e0684a3-02ce-4559-a985-666a0006e19d	vedant.dalvi@example.com	$2b$10$t7zTgC1hil/36x6xJkY/OeG.NAFbZi6o5Qs3.JH2FmVi17P1DDsnK	heavyladybug957	Vedant Dalvi	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/40.jpg	2025-11-03 21:44:59.533923	2025-11-03 21:44:59.533923	USER	ACTIVE	Nagercoil	IN
f42acf38-3397-4d74-a3bc-fabfb1fe86a0	robin.torres@example.com	$2b$10$SkNKKcZivfl9ETV7cJqzt.WAgdfavmNNc3uo.maS.CuPLgUQiFE7e	crazywolf374	Robin Torres	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/65.jpg	2025-11-03 21:44:59.935975	2025-11-03 21:44:59.935975	USER	ACTIVE	Maitland	AU
28e7e97f-974e-4699-9cb7-baaf30a3a14e	lauren.brooks@example.com	$2b$10$3asRfViXIiL5CVnUAbdBTehGdSCrVRxb29valQTad6yQHqGPAVHe2	redbear230	Lauren Brooks	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/39.jpg	2025-11-03 21:45:00.49988	2025-11-03 21:45:00.49988	USER	ACTIVE	Portlaoise	IE
563f4ff5-ab16-4d92-abff-0fa76e0a96dd	amit.bangera@example.com	$2b$10$Xb14HuQBdgM4Nrg1bSTK9eXFPh4Jp/tfrAFMKYw6q8qkpN0tF5uMC	brownfish971	Amit Bangera	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/men/67.jpg	2025-11-03 21:45:00.911012	2025-11-03 21:45:00.911012	USER	ACTIVE	Bahraich	IN
8131019e-7220-45f0-90d2-2f3494435dee	pry.rdyy@example.com	$2b$10$kpargizII0rddSLB5RQdyu.wxIXEEp1gQEfmPpFjRs6W/8rO0CoCG	orangeladybug697	پریا رضایی	Usuario generado automáticamente para desarrollo	https://randomuser.me/api/portraits/women/42.jpg	2025-11-03 21:45:01.320436	2025-11-03 21:45:01.320436	USER	ACTIVE	بجنورد	IR
5b9f365c-6c3a-4ffe-b27d-9f809722e313	ayefernan02@hotmail.com	$2b$10$TjbmWuRzM1niKIYfvfwA3O1OwbySAcdeGSxTvj8nv44GDuLJG2pDi	Rocio_1	Ayelen	\N	https://res.cloudinary.com/dtybvnx2h/image/upload/v1762291903/TpFinal/user/profilePicture/5b9f365c-6c3a-4ffe-b27d-9f809722e313-1762291898388.png	2025-09-30 19:25:32.012504	2025-11-04 21:31:44.608754	USER	ACTIVE	Plottier	AR
80195420-7e74-4a40-81b1-340ab3536f30	rochyfer10@hotmail.com.ar	$2b$10$fucGFBOH1MXI0CStjPAwAO50wUE8MBjqqBRHp3NcGtx4SoUtb2.ey	Rocio	Ayelen	Wiwiwi :3	https://res.cloudinary.com/dtybvnx2h/image/upload/v1762294324/TpFinal/user/profilePicture/80195420-7e74-4a40-81b1-340ab3536f30-1762294314377.png	2025-09-24 15:36:36	2025-11-04 22:12:10.077556	ADMIN	ACTIVE	Cipolletti	AR
\.


--
-- TOC entry 3479 (class 2606 OID 17244)
-- Name: blocks blocks_blocker_id_blocked_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_blocker_id_blocked_id_key UNIQUE (blocker_id, blocked_id);


--
-- TOC entry 3481 (class 2606 OID 17242)
-- Name: blocks blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_pkey PRIMARY KEY (id);


--
-- TOC entry 3457 (class 2606 OID 17061)
-- Name: conversation_participants conversation_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_pkey PRIMARY KEY (conversation_id, user_id);


--
-- TOC entry 3455 (class 2606 OID 17055)
-- Name: conversation conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversation
    ADD CONSTRAINT conversation_pkey PRIMARY KEY (id);


--
-- TOC entry 3476 (class 2606 OID 17208)
-- Name: email_verifications email_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3472 (class 2606 OID 17175)
-- Name: follow follow_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow
    ADD CONSTRAINT follow_pkey PRIMARY KEY (follower_id, followed_id);


--
-- TOC entry 3470 (class 2606 OID 17159)
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- TOC entry 3468 (class 2606 OID 17140)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 3474 (class 2606 OID 17193)
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- TOC entry 3488 (class 2606 OID 17598)
-- Name: post_metrics post_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_metrics
    ADD CONSTRAINT post_metrics_pkey PRIMARY KEY (post_id);


--
-- TOC entry 3460 (class 2606 OID 17081)
-- Name: post post_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_pkey PRIMARY KEY (id);


--
-- TOC entry 3502 (class 2606 OID 17642)
-- Name: post_topics post_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_topics
    ADD CONSTRAINT post_topics_pkey PRIMARY KEY (id);


--
-- TOC entry 3504 (class 2606 OID 17644)
-- Name: post_topics post_topics_post_id_topic_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_topics
    ADD CONSTRAINT post_topics_post_id_topic_id_key UNIQUE (post_id, topic_id);


--
-- TOC entry 3464 (class 2606 OID 17259)
-- Name: reaction reaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reaction
    ADD CONSTRAINT reaction_pkey PRIMARY KEY (id);


--
-- TOC entry 3486 (class 2606 OID 17288)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- TOC entry 3498 (class 2606 OID 17636)
-- Name: topics topics_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_name_key UNIQUE (name);


--
-- TOC entry 3500 (class 2606 OID 17634)
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- TOC entry 3466 (class 2606 OID 17265)
-- Name: reaction unique_user_target; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reaction
    ADD CONSTRAINT unique_user_target UNIQUE (user_id, post_id, comment_id);


--
-- TOC entry 3462 (class 2606 OID 17093)
-- Name: user_comments user_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_comments
    ADD CONSTRAINT user_comments_pkey PRIMARY KEY (id);


--
-- TOC entry 3490 (class 2606 OID 17618)
-- Name: user_interactions user_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_interactions
    ADD CONSTRAINT user_interactions_pkey PRIMARY KEY (id);


--
-- TOC entry 3492 (class 2606 OID 17658)
-- Name: user_interactions user_interactions_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_interactions
    ADD CONSTRAINT user_interactions_unique UNIQUE (user_id, post_id, interaction_type);


--
-- TOC entry 3494 (class 2606 OID 17625)
-- Name: user_interests user_interests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_interests
    ADD CONSTRAINT user_interests_pkey PRIMARY KEY (id);


--
-- TOC entry 3496 (class 2606 OID 17656)
-- Name: user_interests user_interests_user_topic_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_interests
    ADD CONSTRAINT user_interests_user_topic_unique UNIQUE (user_id, topic_id);


--
-- TOC entry 3449 (class 2606 OID 17045)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3451 (class 2606 OID 17043)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3453 (class 2606 OID 17047)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3482 (class 1259 OID 17256)
-- Name: idx_blocks_blocked; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blocks_blocked ON public.blocks USING btree (blocked_id);


--
-- TOC entry 3483 (class 1259 OID 17255)
-- Name: idx_blocks_blocker; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blocks_blocker ON public.blocks USING btree (blocker_id);


--
-- TOC entry 3477 (class 1259 OID 17214)
-- Name: idx_email_verifications_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_verifications_token ON public.email_verifications USING btree (token);


--
-- TOC entry 3458 (class 1259 OID 17390)
-- Name: idx_posts_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_created_at ON public.post USING btree (created_at DESC);


--
-- TOC entry 3484 (class 1259 OID 17311)
-- Name: idx_reports_target; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reports_target ON public.reports USING btree (target_type, target_id);


--
-- TOC entry 3447 (class 1259 OID 17661)
-- Name: idx_users_country; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_country ON public.users USING btree (country_iso);


--
-- TOC entry 3529 (class 2620 OID 17605)
-- Name: user_comments trigger_update_post_comment_count; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_post_comment_count AFTER INSERT OR DELETE ON public.user_comments FOR EACH ROW EXECUTE FUNCTION public.update_post_comment_count();


--
-- TOC entry 3530 (class 2620 OID 17608)
-- Name: reaction trigger_update_post_reaction_metrics_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_post_reaction_metrics_delete AFTER DELETE ON public.reaction FOR EACH ROW WHEN ((old.post_id IS NOT NULL)) EXECUTE FUNCTION public.update_post_reaction_metrics();


--
-- TOC entry 3531 (class 2620 OID 17607)
-- Name: reaction trigger_update_post_reaction_metrics_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_post_reaction_metrics_insert AFTER INSERT ON public.reaction FOR EACH ROW WHEN ((new.post_id IS NOT NULL)) EXECUTE FUNCTION public.update_post_reaction_metrics();


--
-- TOC entry 3523 (class 2606 OID 17250)
-- Name: blocks blocks_blocked_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_blocked_id_fkey FOREIGN KEY (blocked_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3524 (class 2606 OID 17245)
-- Name: blocks blocks_blocker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_blocker_id_fkey FOREIGN KEY (blocker_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3505 (class 2606 OID 17062)
-- Name: conversation_participants conversation_participants_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversation(id) ON DELETE CASCADE;


--
-- TOC entry 3506 (class 2606 OID 17067)
-- Name: conversation_participants conversation_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3522 (class 2606 OID 17209)
-- Name: email_verifications email_verifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3519 (class 2606 OID 17181)
-- Name: follow follow_followee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow
    ADD CONSTRAINT follow_followee_id_fkey FOREIGN KEY (followed_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3520 (class 2606 OID 17176)
-- Name: follow follow_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow
    ADD CONSTRAINT follow_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3517 (class 2606 OID 17165)
-- Name: media media_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- TOC entry 3518 (class 2606 OID 17160)
-- Name: media media_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.post(id) ON DELETE CASCADE;


--
-- TOC entry 3515 (class 2606 OID 17141)
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversation(id) ON DELETE CASCADE;


--
-- TOC entry 3516 (class 2606 OID 17146)
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3521 (class 2606 OID 17194)
-- Name: notification notification_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3507 (class 2606 OID 17082)
-- Name: post post_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3526 (class 2606 OID 17599)
-- Name: post_metrics post_metrics_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_metrics
    ADD CONSTRAINT post_metrics_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.post(id) ON DELETE CASCADE;


--
-- TOC entry 3508 (class 2606 OID 17663)
-- Name: post post_shared_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_shared_post_id_fkey FOREIGN KEY (shared_post_id) REFERENCES public.post(id) ON DELETE SET NULL;


--
-- TOC entry 3527 (class 2606 OID 17645)
-- Name: post_topics post_topics_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_topics
    ADD CONSTRAINT post_topics_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.post(id) ON DELETE CASCADE;


--
-- TOC entry 3528 (class 2606 OID 17650)
-- Name: post_topics post_topics_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_topics
    ADD CONSTRAINT post_topics_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;


--
-- TOC entry 3512 (class 2606 OID 17127)
-- Name: reaction reaction_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reaction
    ADD CONSTRAINT reaction_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.user_comments(id) ON DELETE CASCADE;


--
-- TOC entry 3513 (class 2606 OID 17122)
-- Name: reaction reaction_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reaction
    ADD CONSTRAINT reaction_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.post(id) ON DELETE CASCADE;


--
-- TOC entry 3514 (class 2606 OID 17117)
-- Name: reaction reaction_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reaction
    ADD CONSTRAINT reaction_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3525 (class 2606 OID 17289)
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3509 (class 2606 OID 17094)
-- Name: user_comments user_comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_comments
    ADD CONSTRAINT user_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3510 (class 2606 OID 17104)
-- Name: user_comments user_comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_comments
    ADD CONSTRAINT user_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.user_comments(id) ON DELETE CASCADE;


--
-- TOC entry 3511 (class 2606 OID 17099)
-- Name: user_comments user_comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_comments
    ADD CONSTRAINT user_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.post(id) ON DELETE CASCADE;


-- Completed on 2025-11-16 14:00:55

--
-- PostgreSQL database dump complete
--

\unrestrict dgfdMammwEpXNVwMnt77hmUr5KOLNu4xwURCd6mpZQahlbg4n1thp0YIulSZagk

