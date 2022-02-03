--
-- PostgreSQL database dump
--

-- Dumped from database version 10.17 (Debian 10.17-1.pgdg90+1)
-- Dumped by pg_dump version 10.17 (Debian 10.17-1.pgdg90+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
-- SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: anime_tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.anime_tag (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    anime_id integer NOT NULL,
    tagged_by_id integer NOT NULL
);


--
-- Name: anime_tag_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.anime_tag_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: anime_tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.anime_tag_id_seq OWNED BY public.anime_tag.id;


--
-- Name: auth_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(80) NOT NULL
);


--
-- Name: auth_group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auth_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auth_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auth_group_id_seq OWNED BY public.auth_group.id;


--
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_group_permissions (
    id integer NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auth_group_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auth_group_permissions_id_seq OWNED BY public.auth_group_permissions.id;


--
-- Name: auth_message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_message (
    id integer NOT NULL,
    user_id integer NOT NULL,
    message text NOT NULL
);


--
-- Name: auth_message_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auth_message_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auth_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auth_message_id_seq OWNED BY public.auth_message.id;


--
-- Name: auth_permission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_permission (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content_type_id integer NOT NULL,
    codename character varying(100) NOT NULL
);


--
-- Name: auth_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auth_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auth_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auth_permission_id_seq OWNED BY public.auth_permission.id;


--
-- Name: auth_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_user (
    id integer NOT NULL,
    username character varying(30) NOT NULL,
    first_name character varying(30) NOT NULL,
    last_name character varying(30) NOT NULL,
    email character varying(254) NOT NULL,
    password character varying(128) NOT NULL,
    is_staff boolean NOT NULL,
    is_active boolean NOT NULL,
    is_superuser boolean NOT NULL,
    last_login timestamp without time zone,
    date_joined timestamp without time zone NOT NULL
);


--
-- Name: auth_user_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_user_groups (
    id integer NOT NULL,
    user_id integer NOT NULL,
    group_id integer NOT NULL
);


--
-- Name: auth_user_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auth_user_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auth_user_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auth_user_groups_id_seq OWNED BY public.auth_user_groups.id;


--
-- Name: auth_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auth_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auth_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auth_user_id_seq OWNED BY public.auth_user.id;


--
-- Name: auth_user_user_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_user_user_permissions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    permission_id integer NOT NULL
);


--
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auth_user_user_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auth_user_user_permissions_id_seq OWNED BY public.auth_user_user_permissions.id;


--
-- Name: company; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    metadata jsonb,
    ann_id integer
);


--
-- Name: company_ann_ids; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_ann_ids (
    company_id integer NOT NULL,
    ann_ids integer NOT NULL
);


--
-- Name: company_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.company_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: company_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.company_id_seq OWNED BY public.company.id;


--
-- Name: connect_facebooksetting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.connect_facebooksetting (
    id integer NOT NULL,
    user_id integer NOT NULL,
    key character varying(255) NOT NULL
);


--
-- Name: connect_facebooksetting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.connect_facebooksetting_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: connect_facebooksetting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.connect_facebooksetting_id_seq OWNED BY public.connect_facebooksetting.id;


--
-- Name: connect_me2setting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.connect_me2setting (
    id integer NOT NULL,
    user_id integer NOT NULL,
    userid character varying(100) NOT NULL,
    userkey character varying(30) NOT NULL
);


--
-- Name: connect_me2setting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.connect_me2setting_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: connect_me2setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.connect_me2setting_id_seq OWNED BY public.connect_me2setting.id;


--
-- Name: connect_twittersetting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.connect_twittersetting (
    id integer NOT NULL,
    user_id integer NOT NULL,
    key character varying(255) NOT NULL,
    secret character varying(255) NOT NULL
);


--
-- Name: connect_twittersetting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.connect_twittersetting_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: connect_twittersetting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.connect_twittersetting_id_seq OWNED BY public.connect_twittersetting.id;


--
-- Name: databasechangelog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.databasechangelog (
    id character varying(255) NOT NULL,
    author character varying(255) NOT NULL,
    filename character varying(255) NOT NULL,
    dateexecuted timestamp without time zone NOT NULL,
    orderexecuted integer NOT NULL,
    exectype character varying(10) NOT NULL,
    md5sum character varying(35),
    description character varying(255),
    comments character varying(255),
    tag character varying(255),
    liquibase character varying(20),
    contexts character varying(255),
    labels character varying(255),
    deployment_id character varying(10)
);


--
-- Name: databasechangeloglock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.databasechangeloglock (
    id integer NOT NULL,
    locked boolean NOT NULL,
    lockgranted timestamp without time zone,
    lockedby character varying(255)
);


--
-- Name: django_admin_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.django_admin_log (
    id integer NOT NULL,
    action_time timestamp without time zone NOT NULL,
    user_id integer NOT NULL,
    content_type_id integer,
    object_id text,
    object_repr character varying(200) NOT NULL,
    action_flag bigint NOT NULL,
    change_message text NOT NULL
);


--
-- Name: django_admin_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.django_admin_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: django_admin_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.django_admin_log_id_seq OWNED BY public.django_admin_log.id;


--
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


--
-- Name: django_content_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.django_content_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: django_content_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.django_content_type_id_seq OWNED BY public.django_content_type.id;


--
-- Name: django_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.django_migrations (
    id integer NOT NULL,
    app character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied timestamp with time zone NOT NULL
);


--
-- Name: django_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.django_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: django_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.django_migrations_id_seq OWNED BY public.django_migrations.id;


--
-- Name: django_project_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.django_project_version (
    id integer NOT NULL,
    signature text NOT NULL,
    "when" timestamp without time zone NOT NULL
);


--
-- Name: django_project_version_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.django_project_version_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: django_project_version_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.django_project_version_id_seq OWNED BY public.django_project_version.id;


--
-- Name: django_site; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.django_site (
    id integer NOT NULL,
    domain character varying(100) NOT NULL,
    name character varying(50) NOT NULL
);


--
-- Name: django_site_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.django_site_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: django_site_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.django_site_id_seq OWNED BY public.django_site.id;


--
-- Name: oauth_provider_consumer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.oauth_provider_consumer (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    key character varying(256) NOT NULL,
    secret character varying(16) NOT NULL,
    status smallint NOT NULL,
    user_id integer
);


--
-- Name: oauth_provider_consumer_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.oauth_provider_consumer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: oauth_provider_consumer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.oauth_provider_consumer_id_seq OWNED BY public.oauth_provider_consumer.id;


--
-- Name: oauth_provider_nonce; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.oauth_provider_nonce (
    id integer NOT NULL,
    token_key character varying(32) NOT NULL,
    consumer_key character varying(256) NOT NULL,
    key character varying(255) NOT NULL
);


--
-- Name: oauth_provider_nonce_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.oauth_provider_nonce_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: oauth_provider_nonce_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.oauth_provider_nonce_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: oauth_provider_nonce_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.oauth_provider_nonce_id_seq1 OWNED BY public.oauth_provider_nonce.id;


--
-- Name: oauth_provider_resource; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.oauth_provider_resource (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    url text NOT NULL,
    is_readonly boolean NOT NULL
);


--
-- Name: oauth_provider_resource_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.oauth_provider_resource_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: oauth_provider_resource_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.oauth_provider_resource_id_seq OWNED BY public.oauth_provider_resource.id;


--
-- Name: oauth_provider_token; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.oauth_provider_token (
    id integer NOT NULL,
    key character varying(32),
    secret character varying(16),
    token_type smallint NOT NULL,
    "timestamp" integer NOT NULL,
    is_approved boolean NOT NULL,
    user_id integer,
    consumer_id integer NOT NULL,
    verifier character varying(10) NOT NULL,
    callback character varying(2083),
    callback_confirmed boolean NOT NULL
);


--
-- Name: oauth_provider_token_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.oauth_provider_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: oauth_provider_token_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.oauth_provider_token_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: oauth_provider_token_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.oauth_provider_token_id_seq1 OWNED BY public.oauth_provider_token.id;


--
-- Name: person; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.person (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    metadata jsonb,
    ann_id integer
);


--
-- Name: person_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.person_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: person_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.person_id_seq OWNED BY public.person.id;


--
-- Name: record_category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.record_category (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(30) NOT NULL,
    "position" bigint NOT NULL
);


--
-- Name: record_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.record_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: record_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.record_category_id_seq OWNED BY public.record_category.id;


--
-- Name: record_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.record_history (
    id integer NOT NULL,
    user_id integer NOT NULL,
    work_id integer NOT NULL,
    status character varying(30),
    updated_at timestamp with time zone,
    comment text NOT NULL,
    status_type smallint DEFAULT 1 NOT NULL,
    contains_spoiler boolean NOT NULL,
    record_id integer NOT NULL,
    rating integer
);


--
-- Name: record_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.record_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: record_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.record_history_id_seq OWNED BY public.record_history.id;


--
-- Name: record_record; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.record_record (
    id integer NOT NULL,
    user_id integer NOT NULL,
    work_id integer NOT NULL,
    status character varying(30),
    updated_at timestamp with time zone,
    category_id integer,
    status_type smallint DEFAULT 1 NOT NULL,
    title character varying(100) NOT NULL,
    rating integer
);


--
-- Name: record_record_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.record_record_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: record_record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.record_record_id_seq OWNED BY public.record_record.id;


--
-- Name: search_workattributeindex; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.search_workattributeindex (
    id integer NOT NULL,
    key character varying(20) NOT NULL,
    value text NOT NULL
);


--
-- Name: search_workattributeindex_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.search_workattributeindex_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: search_workattributeindex_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.search_workattributeindex_id_seq OWNED BY public.search_workattributeindex.id;


--
-- Name: search_workindex; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.search_workindex (
    work_id integer NOT NULL,
    title character varying(100) NOT NULL,
    record_count integer NOT NULL,
    rank integer NOT NULL,
    blacklisted boolean NOT NULL,
    verified boolean DEFAULT true NOT NULL
);


--
-- Name: search_workperiodindex; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.search_workperiodindex (
    id integer NOT NULL,
    period character varying(6) NOT NULL,
    work_id integer NOT NULL,
    is_first_period boolean NOT NULL
);


--
-- Name: search_workperiodindex_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.search_workperiodindex_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: search_workperiodindex_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.search_workperiodindex_id_seq OWNED BY public.search_workperiodindex.id;


--
-- Name: search_worktitleindex; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.search_worktitleindex (
    id integer NOT NULL,
    key character varying(255) NOT NULL,
    work_id integer NOT NULL
);


--
-- Name: search_worktitleindex_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.search_worktitleindex_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: search_worktitleindex_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.search_worktitleindex_id_seq OWNED BY public.search_worktitleindex.id;


--
-- Name: south_migrationhistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.south_migrationhistory (
    id integer NOT NULL,
    app_name character varying(255) NOT NULL,
    migration character varying(255) NOT NULL,
    applied timestamp without time zone NOT NULL
);


--
-- Name: south_migrationhistory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.south_migrationhistory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: south_migrationhistory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.south_migrationhistory_id_seq OWNED BY public.south_migrationhistory.id;


--
-- Name: work_cast; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_cast (
    id integer NOT NULL,
    work_id integer NOT NULL,
    role character varying(50) NOT NULL,
    "position" integer NOT NULL,
    actor_id integer NOT NULL,
    metadata jsonb
);


--
-- Name: work_cast_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.work_cast_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_cast_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.work_cast_id_seq OWNED BY public.work_cast.id;


--
-- Name: work_company; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_company (
    id integer NOT NULL,
    work_id integer NOT NULL,
    "position" integer NOT NULL,
    company_id integer NOT NULL,
    metadata jsonb
);


--
-- Name: work_company_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.work_company_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_company_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.work_company_id_seq OWNED BY public.work_company.id;


--
-- Name: work_mergerequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_mergerequest (
    id integer NOT NULL,
    user_id integer NOT NULL,
    target_id integer NOT NULL,
    source_id integer NOT NULL
);


--
-- Name: work_mergerequest_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.work_mergerequest_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_mergerequest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.work_mergerequest_id_seq OWNED BY public.work_mergerequest.id;


--
-- Name: work_staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_staff (
    id integer NOT NULL,
    work_id integer NOT NULL,
    task character varying(50) NOT NULL,
    "position" integer NOT NULL,
    person_id integer NOT NULL,
    metadata jsonb
);


--
-- Name: work_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.work_staff_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.work_staff_id_seq OWNED BY public.work_staff.id;


--
-- Name: work_titlemapping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_titlemapping (
    id integer NOT NULL,
    work_id integer NOT NULL,
    title character varying(100) NOT NULL,
    key character varying(100) NOT NULL
);


--
-- Name: work_titlemapping_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.work_titlemapping_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_titlemapping_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.work_titlemapping_id_seq OWNED BY public.work_titlemapping.id;


--
-- Name: work_work; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_work (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    raw_metadata text,
    image_filename character varying(100),
    original_image_filename character varying(100),
    blacklisted boolean NOT NULL,
    metadata jsonb,
    image_center_y double precision NOT NULL,
    first_period character varying(6)
);


--
-- Name: work_work_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.work_work_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_work_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.work_work_id_seq OWNED BY public.work_work.id;


--
-- Name: anime_tag id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.anime_tag ALTER COLUMN id SET DEFAULT nextval('public.anime_tag_id_seq'::regclass);


--
-- Name: auth_group id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_group ALTER COLUMN id SET DEFAULT nextval('public.auth_group_id_seq'::regclass);


--
-- Name: auth_group_permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_group_permissions ALTER COLUMN id SET DEFAULT nextval('public.auth_group_permissions_id_seq'::regclass);


--
-- Name: auth_message id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_message ALTER COLUMN id SET DEFAULT nextval('public.auth_message_id_seq'::regclass);


--
-- Name: auth_permission id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_permission ALTER COLUMN id SET DEFAULT nextval('public.auth_permission_id_seq'::regclass);


--
-- Name: auth_user id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user ALTER COLUMN id SET DEFAULT nextval('public.auth_user_id_seq'::regclass);


--
-- Name: auth_user_groups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user_groups ALTER COLUMN id SET DEFAULT nextval('public.auth_user_groups_id_seq'::regclass);


--
-- Name: auth_user_user_permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user_user_permissions ALTER COLUMN id SET DEFAULT nextval('public.auth_user_user_permissions_id_seq'::regclass);


--
-- Name: company id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company ALTER COLUMN id SET DEFAULT nextval('public.company_id_seq'::regclass);


--
-- Name: connect_facebooksetting id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connect_facebooksetting ALTER COLUMN id SET DEFAULT nextval('public.connect_facebooksetting_id_seq'::regclass);


--
-- Name: connect_me2setting id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connect_me2setting ALTER COLUMN id SET DEFAULT nextval('public.connect_me2setting_id_seq'::regclass);


--
-- Name: connect_twittersetting id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connect_twittersetting ALTER COLUMN id SET DEFAULT nextval('public.connect_twittersetting_id_seq'::regclass);


--
-- Name: django_admin_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_admin_log ALTER COLUMN id SET DEFAULT nextval('public.django_admin_log_id_seq'::regclass);


--
-- Name: django_content_type id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_content_type ALTER COLUMN id SET DEFAULT nextval('public.django_content_type_id_seq'::regclass);


--
-- Name: django_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_migrations ALTER COLUMN id SET DEFAULT nextval('public.django_migrations_id_seq'::regclass);


--
-- Name: django_project_version id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_project_version ALTER COLUMN id SET DEFAULT nextval('public.django_project_version_id_seq'::regclass);


--
-- Name: django_site id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_site ALTER COLUMN id SET DEFAULT nextval('public.django_site_id_seq'::regclass);


--
-- Name: oauth_provider_consumer id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_provider_consumer ALTER COLUMN id SET DEFAULT nextval('public.oauth_provider_consumer_id_seq'::regclass);


--
-- Name: oauth_provider_nonce id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_provider_nonce ALTER COLUMN id SET DEFAULT nextval('public.oauth_provider_nonce_id_seq1'::regclass);


--
-- Name: oauth_provider_resource id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_provider_resource ALTER COLUMN id SET DEFAULT nextval('public.oauth_provider_resource_id_seq'::regclass);


--
-- Name: oauth_provider_token id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_provider_token ALTER COLUMN id SET DEFAULT nextval('public.oauth_provider_token_id_seq1'::regclass);


--
-- Name: person id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person ALTER COLUMN id SET DEFAULT nextval('public.person_id_seq'::regclass);


--
-- Name: record_category id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.record_category ALTER COLUMN id SET DEFAULT nextval('public.record_category_id_seq'::regclass);


--
-- Name: record_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.record_history ALTER COLUMN id SET DEFAULT nextval('public.record_history_id_seq'::regclass);


--
-- Name: record_record id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.record_record ALTER COLUMN id SET DEFAULT nextval('public.record_record_id_seq'::regclass);


--
-- Name: search_workattributeindex id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_workattributeindex ALTER COLUMN id SET DEFAULT nextval('public.search_workattributeindex_id_seq'::regclass);


--
-- Name: search_workperiodindex id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_workperiodindex ALTER COLUMN id SET DEFAULT nextval('public.search_workperiodindex_id_seq'::regclass);


--
-- Name: search_worktitleindex id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_worktitleindex ALTER COLUMN id SET DEFAULT nextval('public.search_worktitleindex_id_seq'::regclass);


--
-- Name: south_migrationhistory id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.south_migrationhistory ALTER COLUMN id SET DEFAULT nextval('public.south_migrationhistory_id_seq'::regclass);


--
-- Name: work_cast id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_cast ALTER COLUMN id SET DEFAULT nextval('public.work_cast_id_seq'::regclass);


--
-- Name: work_company id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_company ALTER COLUMN id SET DEFAULT nextval('public.work_company_id_seq'::regclass);


--
-- Name: work_mergerequest id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_mergerequest ALTER COLUMN id SET DEFAULT nextval('public.work_mergerequest_id_seq'::regclass);


--
-- Name: work_staff id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_staff ALTER COLUMN id SET DEFAULT nextval('public.work_staff_id_seq'::regclass);


--
-- Name: work_titlemapping id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_titlemapping ALTER COLUMN id SET DEFAULT nextval('public.work_titlemapping_id_seq'::regclass);


--
-- Name: work_work id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_work ALTER COLUMN id SET DEFAULT nextval('public.work_work_id_seq'::regclass);


--
-- Name: anime_tag anime_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.anime_tag
    ADD CONSTRAINT anime_tag_pkey PRIMARY KEY (id);


--
-- Name: auth_group_permissions auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- Name: auth_message auth_message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_message
    ADD CONSTRAINT auth_message_pkey PRIMARY KEY (id);


--
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- Name: auth_user_groups auth_user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_pkey PRIMARY KEY (id);


--
-- Name: auth_user auth_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_pkey PRIMARY KEY (id);


--
-- Name: auth_user_user_permissions auth_user_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_pkey PRIMARY KEY (id);


--
-- Name: connect_facebooksetting connect_facebooksetting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connect_facebooksetting
    ADD CONSTRAINT connect_facebooksetting_pkey PRIMARY KEY (id);


--
-- Name: connect_me2setting connect_me2setting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connect_me2setting
    ADD CONSTRAINT connect_me2setting_pkey PRIMARY KEY (id);


--
-- Name: connect_twittersetting connect_twittersetting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connect_twittersetting
    ADD CONSTRAINT connect_twittersetting_pkey PRIMARY KEY (id);


--
-- Name: django_admin_log django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);


--
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- Name: django_project_version django_project_version_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_project_version
    ADD CONSTRAINT django_project_version_pkey PRIMARY KEY (id);


--
-- Name: django_site django_site_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_site
    ADD CONSTRAINT django_site_pkey PRIMARY KEY (id);


--
-- Name: oauth_provider_consumer oauth_provider_consumer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_provider_consumer
    ADD CONSTRAINT oauth_provider_consumer_pkey PRIMARY KEY (id);


--
-- Name: oauth_provider_nonce oauth_provider_nonce_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_provider_nonce
    ADD CONSTRAINT oauth_provider_nonce_pkey PRIMARY KEY (id);


--
-- Name: oauth_provider_resource oauth_provider_resource_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_provider_resource
    ADD CONSTRAINT oauth_provider_resource_pkey PRIMARY KEY (id);


--
-- Name: oauth_provider_token oauth_provider_token_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_provider_token
    ADD CONSTRAINT oauth_provider_token_pkey PRIMARY KEY (id);


--
-- Name: company pk_company; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT pk_company PRIMARY KEY (id);


--
-- Name: databasechangeloglock pk_databasechangeloglock; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.databasechangeloglock
    ADD CONSTRAINT pk_databasechangeloglock PRIMARY KEY (id);


--
-- Name: person pk_person; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT pk_person PRIMARY KEY (id);


--
-- Name: work_cast pk_work_cast; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_cast
    ADD CONSTRAINT pk_work_cast PRIMARY KEY (id);


--
-- Name: work_company pk_work_company; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_company
    ADD CONSTRAINT pk_work_company PRIMARY KEY (id);


--
-- Name: work_staff pk_work_staff; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_staff
    ADD CONSTRAINT pk_work_staff PRIMARY KEY (id);


--
-- Name: record_category record_category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.record_category
    ADD CONSTRAINT record_category_pkey PRIMARY KEY (id);


--
-- Name: record_history record_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.record_history
    ADD CONSTRAINT record_history_pkey PRIMARY KEY (id);


--
-- Name: record_record record_record_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.record_record
    ADD CONSTRAINT record_record_pkey PRIMARY KEY (id);


--
-- Name: search_workattributeindex search_workattributeindex_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_workattributeindex
    ADD CONSTRAINT search_workattributeindex_pkey PRIMARY KEY (id);


--
-- Name: search_workindex search_workindex_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_workindex
    ADD CONSTRAINT search_workindex_pkey PRIMARY KEY (work_id);


--
-- Name: search_workperiodindex search_workperiodindex_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_workperiodindex
    ADD CONSTRAINT search_workperiodindex_pkey PRIMARY KEY (id);


--
-- Name: search_worktitleindex search_worktitleindex_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_worktitleindex
    ADD CONSTRAINT search_worktitleindex_pkey PRIMARY KEY (id);


--
-- Name: south_migrationhistory south_migrationhistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.south_migrationhistory
    ADD CONSTRAINT south_migrationhistory_pkey PRIMARY KEY (id);


--
-- Name: work_mergerequest work_mergerequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_mergerequest
    ADD CONSTRAINT work_mergerequest_pkey PRIMARY KEY (id);


--
-- Name: work_mergerequest work_mergerequest_target_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_mergerequest
    ADD CONSTRAINT work_mergerequest_target_id_key UNIQUE (target_id, source_id);


--
-- Name: work_titlemapping work_titlemapping_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_titlemapping
    ADD CONSTRAINT work_titlemapping_pkey PRIMARY KEY (id);


--
-- Name: work_titlemapping work_titlemapping_title_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_titlemapping
    ADD CONSTRAINT work_titlemapping_title_key UNIQUE (title);


--
-- Name: work_work work_work_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_work
    ADD CONSTRAINT work_work_pkey PRIMARY KEY (id);


--
-- Name: anime_tag_anime_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX anime_tag_anime_id ON public.anime_tag USING btree (anime_id);


--
-- Name: anime_tag_tagged_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX anime_tag_tagged_by_id ON public.anime_tag USING btree (tagged_by_id);


--
-- Name: app_label; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX app_label ON public.django_content_type USING btree (app_label, model);


--
-- Name: auth_message_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_message_user_id ON public.auth_message USING btree (user_id);


--
-- Name: auth_permission_content_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_permission_content_type_id ON public.auth_permission USING btree (content_type_id);


--
-- Name: category_id_refs_id_839076b0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX category_id_refs_id_839076b0 ON public.record_record USING btree (category_id);


--
-- Name: connect_facebooksetting_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX connect_facebooksetting_user_id ON public.connect_facebooksetting USING btree (user_id);


--
-- Name: connect_me2setting_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX connect_me2setting_user_id ON public.connect_me2setting USING btree (user_id);


--
-- Name: connect_twittersetting_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX connect_twittersetting_user_id ON public.connect_twittersetting USING btree (user_id);


--
-- Name: content_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX content_type_id ON public.auth_permission USING btree (content_type_id, codename);


--
-- Name: django_admin_log_content_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX django_admin_log_content_type_id ON public.django_admin_log USING btree (content_type_id);


--
-- Name: django_admin_log_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX django_admin_log_user_id ON public.django_admin_log USING btree (user_id);


--
-- Name: group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX group_id ON public.auth_group_permissions USING btree (group_id, permission_id);


--
-- Name: group_id_refs_id_f116770; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX group_id_refs_id_f116770 ON public.auth_user_groups USING btree (group_id);


--
-- Name: idx_company_ann_ids_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_ann_ids_1 ON public.company_ann_ids USING btree (ann_ids);


--
-- Name: idx_work_cast_work_id_actor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_cast_work_id_actor_id ON public.work_cast USING btree (work_id, actor_id);


--
-- Name: idx_work_staff_work_id_person_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_staff_work_id_person_id ON public.work_staff USING btree (work_id, person_id);


--
-- Name: main_record_anime_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX main_record_anime_id ON public.record_record USING btree (work_id);


--
-- Name: main_record_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX main_record_owner_id ON public.record_record USING btree (user_id);


--
-- Name: name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX name ON public.auth_group USING btree (name);


--
-- Name: oauth_provider_consumer_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX oauth_provider_consumer_user_id ON public.oauth_provider_consumer USING btree (user_id);


--
-- Name: oauth_provider_token_consumer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX oauth_provider_token_consumer_id ON public.oauth_provider_token USING btree (consumer_id);


--
-- Name: oauth_provider_token_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX oauth_provider_token_user_id ON public.oauth_provider_token USING btree (user_id);


--
-- Name: permission_id_refs_id_5886d21f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX permission_id_refs_id_5886d21f ON public.auth_group_permissions USING btree (permission_id);


--
-- Name: permission_id_refs_id_67e79cb; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX permission_id_refs_id_67e79cb ON public.auth_user_user_permissions USING btree (permission_id);


--
-- Name: record_category_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX record_category_user_id ON public.record_category USING btree (user_id);


--
-- Name: record_history_12b92a91; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX record_history_12b92a91 ON public.record_history USING btree (record_id);


--
-- Name: record_recordhistory_anime_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX record_recordhistory_anime_id ON public.record_history USING btree (work_id);


--
-- Name: record_recordhistory_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX record_recordhistory_owner_id ON public.record_history USING btree (user_id);


--
-- Name: record_recordhistory_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX record_recordhistory_updated_at ON public.record_history USING btree (updated_at);


--
-- Name: record_recordhistory_work_id_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX record_recordhistory_work_id_updated_at ON public.record_history USING btree (work_id, status, updated_at DESC);


--
-- Name: record_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX record_unique ON public.record_record USING btree (work_id, user_id);


--
-- Name: search_workattributeindex_3c6e0b8a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_workattributeindex_3c6e0b8a ON public.search_workattributeindex USING btree (key);


--
-- Name: search_workattributeindex_key_6e0b2826_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_workattributeindex_key_6e0b2826_like ON public.search_workattributeindex USING btree (key varchar_pattern_ops);


--
-- Name: search_workindex_rank; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_workindex_rank ON public.search_workindex USING btree (rank);


--
-- Name: search_workperiodindex_84c7ac35; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_workperiodindex_84c7ac35 ON public.search_workperiodindex USING btree (work_id);


--
-- Name: search_workperiodindex_a0acfa46; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_workperiodindex_a0acfa46 ON public.search_workperiodindex USING btree (period);


--
-- Name: search_workperiodindex_period_6cbc8746b29756ab_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_workperiodindex_period_6cbc8746b29756ab_like ON public.search_workperiodindex USING btree (period varchar_pattern_ops);


--
-- Name: search_worktitleindex_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_worktitleindex_key ON public.search_worktitleindex USING btree (key);


--
-- Name: search_worktitleindex_key_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_worktitleindex_key_like ON public.search_worktitleindex USING btree (key varchar_pattern_ops);


--
-- Name: search_worktitleindex_work_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_worktitleindex_work_id ON public.search_worktitleindex USING btree (work_id);


--
-- Name: user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_id ON public.auth_user_user_permissions USING btree (user_id, permission_id);


--
-- Name: username; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX username ON public.auth_user USING btree (username);


--
-- Name: work_mergerequest_source_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX work_mergerequest_source_id ON public.work_mergerequest USING btree (source_id);


--
-- Name: work_mergerequest_target_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX work_mergerequest_target_id ON public.work_mergerequest USING btree (target_id);


--
-- Name: work_mergerequest_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX work_mergerequest_user_id ON public.work_mergerequest USING btree (user_id);


--
-- Name: work_titlemapping_work_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX work_titlemapping_work_id ON public.work_titlemapping USING btree (work_id);


--
-- Name: work_work_title; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX work_work_title ON public.work_work USING btree (title);


--
-- Name: connect_facebooksetting connect_facebooksetting_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connect_facebooksetting
    ADD CONSTRAINT connect_facebooksetting_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: company_ann_ids fk_company_ann_ids_company; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_ann_ids
    ADD CONSTRAINT fk_company_ann_ids_company FOREIGN KEY (company_id) REFERENCES public.company(id);


--
-- Name: work_cast fk_work_cast_actor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_cast
    ADD CONSTRAINT fk_work_cast_actor FOREIGN KEY (actor_id) REFERENCES public.person(id);


--
-- Name: work_cast fk_work_cast_work; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_cast
    ADD CONSTRAINT fk_work_cast_work FOREIGN KEY (work_id) REFERENCES public.work_work(id);


--
-- Name: work_company fk_work_company_company; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_company
    ADD CONSTRAINT fk_work_company_company FOREIGN KEY (company_id) REFERENCES public.company(id);


--
-- Name: work_company fk_work_company_work; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_company
    ADD CONSTRAINT fk_work_company_work FOREIGN KEY (work_id) REFERENCES public.work_work(id);


--
-- Name: work_staff fk_work_staff_person; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_staff
    ADD CONSTRAINT fk_work_staff_person FOREIGN KEY (person_id) REFERENCES public.person(id);


--
-- Name: work_staff fk_work_staff_work; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_staff
    ADD CONSTRAINT fk_work_staff_work FOREIGN KEY (work_id) REFERENCES public.work_work(id);


--
-- Name: oauth_provider_consumer oauth_provider_consumer_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_provider_consumer
    ADD CONSTRAINT oauth_provider_consumer_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: oauth_provider_token oauth_provider_token_consumer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_provider_token
    ADD CONSTRAINT oauth_provider_token_consumer_id_fkey FOREIGN KEY (consumer_id) REFERENCES public.oauth_provider_consumer(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: oauth_provider_token oauth_provider_token_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_provider_token
    ADD CONSTRAINT oauth_provider_token_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: record_history record_history_record_id_479ffb7c_fk_record_record_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.record_history
    ADD CONSTRAINT record_history_record_id_479ffb7c_fk_record_record_id FOREIGN KEY (record_id) REFERENCES public.record_record(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: search_workindex search_workindex_work_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_workindex
    ADD CONSTRAINT search_workindex_work_id_fkey FOREIGN KEY (work_id) REFERENCES public.work_work(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: search_workperiodindex search_workperiodindex_work_id_4298ff9d17df62e_fk_work_work_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_workperiodindex
    ADD CONSTRAINT search_workperiodindex_work_id_4298ff9d17df62e_fk_work_work_id FOREIGN KEY (work_id) REFERENCES public.work_work(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: search_worktitleindex search_worktitleindex_work_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_worktitleindex
    ADD CONSTRAINT search_worktitleindex_work_id_fkey FOREIGN KEY (work_id) REFERENCES public.search_workindex(work_id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: work_mergerequest work_mergerequest_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_mergerequest
    ADD CONSTRAINT work_mergerequest_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: work_titlemapping work_titlemapping_work_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_titlemapping
    ADD CONSTRAINT work_titlemapping_work_id_fkey FOREIGN KEY (work_id) REFERENCES public.work_work(id) DEFERRABLE INITIALLY DEFERRED;


--
-- PostgreSQL database dump complete
--

