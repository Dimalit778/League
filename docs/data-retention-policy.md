# Data retention and deletion runbook

Effective: 2026-08-26. Owner: Champo operator. Review at least annually and whenever a processor, plan, or data flow changes.

## Enforced schedule

| Data or processor | Retention | Enforcement |
| --- | ---: | --- |
| Active account/profile | Account lifetime | In-app deletion removes Auth/profile data and profile files; league history is de-identified |
| Legal acceptance evidence | Account lifetime | `legal_acceptances` cascades when the Auth account is deleted |
| Pending content reports | Until reviewed | Required for the moderation queue |
| Resolved/dismissed reports | 24 months after review | Daily database retention job |
| Reports involving a deleted account | Immediate | `BEFORE DELETE` trigger on `public.users` |
| RevenueCat webhook payloads | 180 days | Daily database retention job; account deletion also removes matching events and the RevenueCat customer |
| Subscription-sync attempts | 1 day | Daily database retention job |
| Supabase Auth audit entries stored in Postgres | 90 days | Daily database retention job |
| Football API call logs | 31 days maximum | Opportunistic 10-minute cleanup plus daily database retention job |
| `pg_cron` run history | 30 days | Daily database retention job |
| Google Vision monthly usage totals | 14 months | Daily database retention job |
| Unreferenced profile-image objects | 7-day safety window | Daily `cleanup-retained-data` Edge Function; referenced images remain for the account lifetime |
| Google Cloud Vision synchronous image content | No content at rest | Provider processes the image in memory; request metadata may be logged temporarily |
| Gemini/Tavily match-analysis inputs | No Champo personal/account data | Only public match facts are sent; provider-controlled technical retention applies |
| Sentry events | Provider-plan controlled | App and Edge Functions omit default PII; the app strips identity, request data, secrets, query strings, and breadcrumb data before transmission |

The daily SQL job is `enforce-data-retention` at 03:17 UTC. Storage cleanup is `cleanup-orphaned-profile-images` at 03:27 UTC. Their output is available in `cron.job_run_details`, itself limited to 30 days.

## Backups

The current Supabase organization is on the Free plan, which does not provide automatic daily database backups. Storage objects are not part of Supabase database backups. There is therefore no current backup set to prune.

Before enabling a paid or off-site backup:

1. Use an encrypted destination with least-privilege access and record it as a processor/subprocessor.
2. Configure automatic expiry at **14 days maximum**; do not rely on a manual deletion calendar.
3. Ensure expired snapshots and temporary export files are deleted, and test restore and expiry quarterly.
4. Document that an account deletion may persist only in an immutable backup until that backup expires; restored data must immediately be reprocessed against deletion records before production use.

## Provider settings requiring account administration

- Supabase platform-log retention is plan-controlled. The Postgres copy of Auth audit events is independently capped at 90 days by Champo. An authenticated dashboard administrator should disable duplicate Auth audit writes to Postgres only if the platform log alone provides the required security evidence.
- Sentry cloud-event retention and server-side data scrubbing must be reviewed in the organization settings after every plan change. The available API credential currently lacks organization/project administration scope, so repository-side minimization is the enforceable control in this deployment.
- RevenueCat customer deletion is invoked by the account-deletion function. Apple transaction retention remains under Apple’s legal and account controls.
- Google Vision request metadata, Gemini technical logs, and Tavily technical logs are provider-controlled. Do not add personal or account data to Gemini or Tavily prompts without a new privacy review and an enforceable processor retention agreement.

## Verification checklist

- Check both cron jobs are active and review failed runs before the 30-day history expires.
- Confirm the oldest retained row in each governed table is within its limit.
- Compare `storage.objects` in `profile_images` with non-null `league_members.avatar_url` values.
- Test account deletion in staging: Auth user, profile, images, legal acceptance, reports, subscription records, and RevenueCat customer are removed; league history is de-identified.
- Reconfirm Supabase plan/backups and Sentry retention after any billing or plan change.
