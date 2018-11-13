--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.10
-- Dumped by pg_dump version 9.6.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: title_distance(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION title_distance(text, text) RETURNS double precision
    LANGUAGE sql IMMUTABLE
    AS $_$SELECT cast(levenshtein(normalize($1), normalize($2)) as double precision)
  / cast(greatest(length($1), length($2)) as double precision)$_$;


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: auth_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE auth_user (
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
-- Name: auth_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE auth_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auth_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE auth_user_id_seq OWNED BY auth_user.id;


--
-- Name: company_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE company_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: connect_twittersetting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE connect_twittersetting (
    id integer NOT NULL,
    user_id integer NOT NULL,
    key character varying(255) NOT NULL,
    secret character varying(255) NOT NULL
);


--
-- Name: connect_twittersetting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE connect_twittersetting_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: connect_twittersetting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE connect_twittersetting_id_seq OWNED BY connect_twittersetting.id;


--
-- Name: person_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE person_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: record_category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE record_category (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(30) NOT NULL,
    "position" bigint NOT NULL
);


--
-- Name: record_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE record_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: record_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE record_category_id_seq OWNED BY record_category.id;


--
-- Name: record_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE record_history (
    id integer NOT NULL,
    user_id integer NOT NULL,
    work_id integer NOT NULL,
    status character varying(30),
    updated_at timestamp with time zone,
    comment text NOT NULL,
    status_type smallint DEFAULT 1 NOT NULL,
    contains_spoiler boolean NOT NULL,
    record_id integer NOT NULL
);


--
-- Name: record_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE record_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: record_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE record_history_id_seq OWNED BY record_history.id;


--
-- Name: record_record; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE record_record (
    id integer NOT NULL,
    user_id integer NOT NULL,
    work_id integer NOT NULL,
    status character varying(30),
    updated_at timestamp with time zone,
    category_id integer,
    status_type smallint DEFAULT 1 NOT NULL,
    title character varying(100) NOT NULL
);


--
-- Name: record_record_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE record_record_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: record_record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE record_record_id_seq OWNED BY record_record.id;


--
-- Name: search_workindex; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE search_workindex (
    work_id integer NOT NULL,
    title character varying(100) NOT NULL,
    record_count integer NOT NULL,
    rank integer NOT NULL,
    blacklisted boolean NOT NULL
);


--
-- Name: search_workperiodindex; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE search_workperiodindex (
    id integer NOT NULL,
    period character varying(6) NOT NULL,
    work_id integer NOT NULL,
    is_first_period boolean NOT NULL
);


--
-- Name: search_workperiodindex_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE search_workperiodindex_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: search_workperiodindex_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE search_workperiodindex_id_seq OWNED BY search_workperiodindex.id;


--
-- Name: search_worktitleindex; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE search_worktitleindex (
    id integer NOT NULL,
    key character varying(255) NOT NULL,
    work_id integer NOT NULL
);


--
-- Name: search_worktitleindex_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE search_worktitleindex_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: search_worktitleindex_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE search_worktitleindex_id_seq OWNED BY search_worktitleindex.id;


--
-- Name: work_cast_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE work_cast_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_company_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE work_company_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_mergerequest_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE work_mergerequest_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE work_staff_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_titlemapping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE work_titlemapping (
    id integer NOT NULL,
    work_id integer NOT NULL,
    title character varying(100) NOT NULL,
    key character varying(100) NOT NULL
);


--
-- Name: work_titlemapping_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE work_titlemapping_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_titlemapping_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE work_titlemapping_id_seq OWNED BY work_titlemapping.id;


--
-- Name: work_work; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE work_work (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    raw_metadata text,
    image_filename character varying(100),
    original_image_filename character varying(100),
    blacklisted boolean NOT NULL,
    metadata jsonb,
    image_center_y double precision NOT NULL
);


--
-- Name: work_work_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE work_work_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_work_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE work_work_id_seq OWNED BY work_work.id;


--
-- Name: auth_user id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY auth_user ALTER COLUMN id SET DEFAULT nextval('auth_user_id_seq'::regclass);


--
-- Name: connect_twittersetting id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY connect_twittersetting ALTER COLUMN id SET DEFAULT nextval('connect_twittersetting_id_seq'::regclass);


--
-- Name: record_category id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY record_category ALTER COLUMN id SET DEFAULT nextval('record_category_id_seq'::regclass);


--
-- Name: record_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY record_history ALTER COLUMN id SET DEFAULT nextval('record_history_id_seq'::regclass);


--
-- Name: record_record id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY record_record ALTER COLUMN id SET DEFAULT nextval('record_record_id_seq'::regclass);


--
-- Name: search_workperiodindex id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY search_workperiodindex ALTER COLUMN id SET DEFAULT nextval('search_workperiodindex_id_seq'::regclass);


--
-- Name: search_worktitleindex id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY search_worktitleindex ALTER COLUMN id SET DEFAULT nextval('search_worktitleindex_id_seq'::regclass);


--
-- Name: work_titlemapping id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY work_titlemapping ALTER COLUMN id SET DEFAULT nextval('work_titlemapping_id_seq'::regclass);


--
-- Name: work_work id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY work_work ALTER COLUMN id SET DEFAULT nextval('work_work_id_seq'::regclass);


--
-- Name: auth_user auth_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY auth_user
    ADD CONSTRAINT auth_user_pkey PRIMARY KEY (id);


--
-- Name: connect_twittersetting connect_twittersetting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY connect_twittersetting
    ADD CONSTRAINT connect_twittersetting_pkey PRIMARY KEY (id);


--
-- Name: record_category record_category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY record_category
    ADD CONSTRAINT record_category_pkey PRIMARY KEY (id);


--
-- Name: record_history record_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY record_history
    ADD CONSTRAINT record_history_pkey PRIMARY KEY (id);


--
-- Name: record_record record_record_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY record_record
    ADD CONSTRAINT record_record_pkey PRIMARY KEY (id);


--
-- Name: search_workindex search_workindex_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY search_workindex
    ADD CONSTRAINT search_workindex_pkey PRIMARY KEY (work_id);


--
-- Name: search_workperiodindex search_workperiodindex_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY search_workperiodindex
    ADD CONSTRAINT search_workperiodindex_pkey PRIMARY KEY (id);


--
-- Name: search_worktitleindex search_worktitleindex_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY search_worktitleindex
    ADD CONSTRAINT search_worktitleindex_pkey PRIMARY KEY (id);


--
-- Name: work_titlemapping work_titlemapping_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY work_titlemapping
    ADD CONSTRAINT work_titlemapping_pkey PRIMARY KEY (id);


--
-- Name: work_titlemapping work_titlemapping_title_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY work_titlemapping
    ADD CONSTRAINT work_titlemapping_title_key UNIQUE (title);


--
-- Name: work_work work_work_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY work_work
    ADD CONSTRAINT work_work_pkey PRIMARY KEY (id);


--
-- Name: category_id_refs_id_839076b0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX category_id_refs_id_839076b0 ON record_record USING btree (category_id);


--
-- Name: connect_twittersetting_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX connect_twittersetting_user_id ON connect_twittersetting USING btree (user_id);


--
-- Name: main_record_anime_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX main_record_anime_id ON record_record USING btree (work_id);


--
-- Name: main_record_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX main_record_owner_id ON record_record USING btree (user_id);


--
-- Name: record_category_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX record_category_user_id ON record_category USING btree (user_id);


--
-- Name: record_history_12b92a91; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX record_history_12b92a91 ON record_history USING btree (record_id);


--
-- Name: record_recordhistory_anime_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX record_recordhistory_anime_id ON record_history USING btree (work_id);


--
-- Name: record_recordhistory_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX record_recordhistory_owner_id ON record_history USING btree (user_id);


--
-- Name: record_recordhistory_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX record_recordhistory_updated_at ON record_history USING btree (updated_at);


--
-- Name: record_recordhistory_work_id_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX record_recordhistory_work_id_updated_at ON record_history USING btree (work_id, status, updated_at DESC);


--
-- Name: record_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX record_unique ON record_record USING btree (work_id, user_id);


--
-- Name: search_workindex_rank; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_workindex_rank ON search_workindex USING btree (rank);


--
-- Name: search_workperiodindex_84c7ac35; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_workperiodindex_84c7ac35 ON search_workperiodindex USING btree (work_id);


--
-- Name: search_workperiodindex_a0acfa46; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_workperiodindex_a0acfa46 ON search_workperiodindex USING btree (period);


--
-- Name: search_workperiodindex_period_6cbc8746b29756ab_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_workperiodindex_period_6cbc8746b29756ab_like ON search_workperiodindex USING btree (period varchar_pattern_ops);


--
-- Name: search_worktitleindex_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_worktitleindex_key ON search_worktitleindex USING btree (key);


--
-- Name: search_worktitleindex_key_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_worktitleindex_key_like ON search_worktitleindex USING btree (key varchar_pattern_ops);


--
-- Name: search_worktitleindex_work_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_worktitleindex_work_id ON search_worktitleindex USING btree (work_id);


--
-- Name: username; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX username ON auth_user USING btree (username);


--
-- Name: work_titlemapping_work_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX work_titlemapping_work_id ON work_titlemapping USING btree (work_id);


--
-- Name: work_work_title; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX work_work_title ON work_work USING btree (title);


--
-- Name: record_history record_history_record_id_479ffb7c_fk_record_record_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY record_history
    ADD CONSTRAINT record_history_record_id_479ffb7c_fk_record_record_id FOREIGN KEY (record_id) REFERENCES record_record(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: search_workindex search_workindex_work_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY search_workindex
    ADD CONSTRAINT search_workindex_work_id_fkey FOREIGN KEY (work_id) REFERENCES work_work(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: search_workperiodindex search_workperiodindex_work_id_4298ff9d17df62e_fk_work_work_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY search_workperiodindex
    ADD CONSTRAINT search_workperiodindex_work_id_4298ff9d17df62e_fk_work_work_id FOREIGN KEY (work_id) REFERENCES work_work(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: search_worktitleindex search_worktitleindex_work_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY search_worktitleindex
    ADD CONSTRAINT search_worktitleindex_work_id_fkey FOREIGN KEY (work_id) REFERENCES search_workindex(work_id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: work_titlemapping work_titlemapping_work_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY work_titlemapping
    ADD CONSTRAINT work_titlemapping_work_id_fkey FOREIGN KEY (work_id) REFERENCES work_work(id) DEFERRABLE INITIALLY DEFERRED;


--
-- PostgreSQL database dump complete
--

