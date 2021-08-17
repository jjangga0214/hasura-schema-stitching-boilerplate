CREATE TABLE "public"."task" ("uid" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "date" date, "time" timetz, "is_done" boolean NOT NULL DEFAULT false, "task_group_uid" uuid NOT NULL, "title" text NOT NULL, PRIMARY KEY ("uid") , FOREIGN KEY ("task_group_uid") REFERENCES "public"."task_group"("uid") ON UPDATE cascade ON DELETE cascade);
CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_task_updated_at"
BEFORE UPDATE ON "public"."task"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_task_updated_at" ON "public"."task" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
