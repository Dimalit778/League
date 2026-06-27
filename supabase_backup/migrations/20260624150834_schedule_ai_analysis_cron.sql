-- Enable pg_cron if not already enabled
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Schedule daily at 08:00 UTC
-- Replace <SERVICE_ROLE_KEY> with value from Supabase Dashboard → Project Settings → API → service_role
select cron.schedule(
  'generate-match-analysis',
  '0 8 * * *',
  $$
  select net.http_post(
    url := 'https://keuavfvgwhwckqordjbp.supabase.co/functions/v1/generate-match-analysis',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
    ),
    body := '{}'::jsonb
  )
  $$
);
