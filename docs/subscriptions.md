# Subscription mode

Champo currently runs in free-access mode. The RevenueCat integration,
subscription catalog, paywall, webhook, and historical subscription records are
intentionally preserved for a future paid-plan launch.

## Current configuration

- Mobile: `EXPO_PUBLIC_SUBSCRIPTIONS_ENABLED` defaults to disabled unless its
  value is exactly `true`.
- Database: `public.app_config.subscriptions_enabled` defaults to `false`.
- While disabled, RevenueCat is not initialized, paywall calls succeed without
  navigation, the subscription settings row is hidden, and every user receives
  immediate client-side and server-side `pro` access by default.

## Re-enable paid plans

1. Set `public.app_config.subscriptions_enabled` to `true` using a trusted
   service-role/admin connection.
2. Set `EXPO_PUBLIC_SUBSCRIPTIONS_ENABLED=true` in the build environment.
3. Build and release a new app version.
4. Verify a free account and a paid account against league count, league size,
   premium competitions, AI analysis, purchase, restore, and webhook flows.

If the singleton config row is missing, the database also defaults to free
`pro` access. Paid-plan enforcement therefore requires explicitly enabling the
switch in both Supabase and the mobile build.
