alter table "public"."task_group"
  add constraint "task_group_uid_fkey"
  foreign key ("uid")
  references "public"."user"
  ("uid") on update cascade on delete cascade;
