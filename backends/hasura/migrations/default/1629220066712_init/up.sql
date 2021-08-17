SET check_function_bodies = false;
CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;
CREATE TABLE public.identity (
    uid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    idp text NOT NULL,
    props jsonb,
    idp_id text NOT NULL,
    user_uid uuid NOT NULL
);
CREATE TABLE public.idp (
    value text NOT NULL,
    comment text NOT NULL
);
CREATE TABLE public.role (
    value text NOT NULL,
    comment text
);
CREATE TABLE public."user" (
    uid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL
);
CREATE TABLE public.user_role (
    uid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_uid uuid NOT NULL,
    role text NOT NULL
);
ALTER TABLE ONLY public.identity
    ADD CONSTRAINT identity_pkey PRIMARY KEY (uid);
ALTER TABLE ONLY public.idp
    ADD CONSTRAINT idp_pkey PRIMARY KEY (value);
ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (value);
ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (uid);
ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_pkey PRIMARY KEY (uid);
CREATE TRIGGER set_public_identity_updated_at BEFORE UPDATE ON public.identity FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_identity_updated_at ON public.identity IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_public_user_role_updated_at BEFORE UPDATE ON public.user_role FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_user_role_updated_at ON public.user_role IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_public_user_updated_at BEFORE UPDATE ON public."user" FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_user_updated_at ON public."user" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
ALTER TABLE ONLY public.identity
    ADD CONSTRAINT identity_user_uid_fkey FOREIGN KEY (user_uid) REFERENCES public."user"(uid) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_role_fkey FOREIGN KEY (role) REFERENCES public.role(value) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_user_uid_fkey FOREIGN KEY (user_uid) REFERENCES public."user"(uid) ON UPDATE CASCADE ON DELETE CASCADE;
