
  create table "public"."revenuecat_events" (
    "id" uuid not null default gen_random_uuid(),
    "app_user_id" text,
    "event_type" text,
    "payload" jsonb not null,
    "processed" boolean default false,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."revenuecat_events" enable row level security;

CREATE INDEX revenuecat_events_app_user_id_idx ON public.revenuecat_events USING btree (app_user_id);

CREATE INDEX revenuecat_events_created_at_idx ON public.revenuecat_events USING btree (created_at DESC);

CREATE UNIQUE INDEX revenuecat_events_pkey ON public.revenuecat_events USING btree (id);

CREATE INDEX revenuecat_events_processed_idx ON public.revenuecat_events USING btree (processed);

alter table "public"."revenuecat_events" add constraint "revenuecat_events_pkey" PRIMARY KEY using index "revenuecat_events_pkey";

grant delete on table "public"."revenuecat_events" to "anon";

grant insert on table "public"."revenuecat_events" to "anon";

grant references on table "public"."revenuecat_events" to "anon";

grant select on table "public"."revenuecat_events" to "anon";

grant trigger on table "public"."revenuecat_events" to "anon";

grant truncate on table "public"."revenuecat_events" to "anon";

grant update on table "public"."revenuecat_events" to "anon";

grant delete on table "public"."revenuecat_events" to "authenticated";

grant insert on table "public"."revenuecat_events" to "authenticated";

grant references on table "public"."revenuecat_events" to "authenticated";

grant select on table "public"."revenuecat_events" to "authenticated";

grant trigger on table "public"."revenuecat_events" to "authenticated";

grant truncate on table "public"."revenuecat_events" to "authenticated";

grant update on table "public"."revenuecat_events" to "authenticated";

grant delete on table "public"."revenuecat_events" to "service_role";

grant insert on table "public"."revenuecat_events" to "service_role";

grant references on table "public"."revenuecat_events" to "service_role";

grant select on table "public"."revenuecat_events" to "service_role";

grant trigger on table "public"."revenuecat_events" to "service_role";

grant truncate on table "public"."revenuecat_events" to "service_role";

grant update on table "public"."revenuecat_events" to "service_role";


