# FixturesList UI Redesign

**File:** `src/features/matches/components/matches/FixturesList.tsx`

## Summary

Redesign the horizontal fixture selector from a flat pill to a taller card with a top accent bar, larger bold number, and opacity fading for non-active items.

## Visual States

| State | Border | Top bar | Number color | Date color | Opacity |
|-------|--------|---------|--------------|------------|---------|
| Past / future (idle) | `border-border` 0.5px | none | `text-muted` | `text-muted` | 0.38 (past) / 0.32 (future) |
| Today (`isToday`) | `border-text` 1.5px | white/text color, 2.5px | `text-text` | `text-muted` | 1.0 |
| Selected | `border-primary` 1.5px | `bg-primary` 2.5px | white (`text-background`) | accent (`text-primary`) | 1.0 |
| Today + Selected | `border-primary` 1.5px | `bg-primary` 2.5px | white | `text-primary` | 1.0 |

## Component Changes

- **Card height:** increase vertical padding from current `h-[30px]` to `py-2` (taller card)
- **Number font:** `font-black text-xl` (was `bodyBold` ~14px)
- **Top accent bar:** absolute-positioned 2.5px strip at top of pressable, visible only for selected or isToday
- **Opacity:** wrap each `FixtureItem` in an `Animated.View` (or plain `View` with `style={{ opacity }}`) — idle items use reduced opacity
- **Date color:** `text-primary` when selected, `text-muted` otherwise
- **No "GW" label** — number only
- **Width:** keep `fixtureWidth = 55`, adjust `fixtureHeight` to reflect taller card (use `auto` / padding-driven height)

## What Does NOT Change

- Scroll behavior, `scrollToIndex`, `getItemLayout`, `onScrollToIndexFailed` — all unchanged
- Props interface — no changes
- Web-specific optimizations — unchanged
