alter table "public"."task_group" drop constraint "task_group_uid_fkey",
  add constraint "task_group_user_uid_fkey"
  foreign key ("user_uid")
  references "public"."user"
  ("uid") on update cascade on delete cascade;
