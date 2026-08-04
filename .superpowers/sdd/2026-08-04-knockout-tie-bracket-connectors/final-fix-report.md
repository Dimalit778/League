# Final Fix Report

## Fixes

- Pinned two-leg card stacks to `flex-end`, keeping them on the trailing edge in both LTR and RTL while the connector remains on its physical geometry side.
- Added 8px horizontal outer padding and clamped connector rails to the available padded width with a 48px maximum.
- Extended the connector spine by half a stroke at each end to remove hairline seams.
- Typed connector bar styles as `ViewStyle`.

## Checks

- `npx jest src/features/matches/engines/__tests__/tieBracketGeometry.test.ts --runInBand --no-watchman`
  - PASS: 1 suite, 5 tests.
- `npx eslint "src/features/matches/engines/KnockoutEngine.tsx" "src/features/matches/engines/TieBracketConnector.tsx" "src/features/matches/engines/tieBracketGeometry.ts" "src/features/matches/engines/__tests__/tieBracketGeometry.test.ts`
  - PASS: no output.
- `npm run typecheck`
  - PASS: `tsc --noEmit`.
