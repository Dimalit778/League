# Knockout Tie Bracket Connectors

Add classic C-shaped bracket lines next to two-legged knockout ties (home + away), merging into one line that continues to the screen edge. Direction follows app language (RTL → right, LTR → left).

## Goal

In the knockout matches view, when a tie has two legs, visually connect the two match cards with a tournament-style bracket so it is obvious they form one tie that advances as a single unit.

## Scope

In scope:
- Two-legged ties only (`tie.legs.length === 2`) in `KnockoutEngine` / `TieBlock`
- Classic C-bracket: horizontal stub from each card midline → vertical join → one horizontal exit to the screen edge
- Lines start **outside** the card border (small gap; never drawn into or over the card)
- Direction: Hebrew / `isRTL` → gutter + exit on the **right**; English / LTR → gutter + exit on the **left**
- Stroke: theme `border` (or muted-equivalent), ~1.5px, square joins

Out of scope:
- Single-leg ties (no connector)
- Full multi-round tournament bracket linking ties to each other
- Aggregate score badge on the connector
- Changes to `MatchCard` internals
- Curved / soft Y-merge styles

## Approach

Keep connectors local to the knockout tie row. Wrap the two cards so a connector overlay sits on the exit side. Draw the C with absolutely positioned `View` segments (thin `backgroundColor` bars) — no new dependency, no SVG unless Views prove awkward.

`MatchCard` is already centered with horizontal padding (`screenWidth - MATCH_CARD_HORIZONTAL_PADDING`). Use that side space for the connector: stubs start just outside the card edge, merge in the padding zone, and the exit line continues to the list/screen edge. If the existing padding is too tight for a clear C, nudge the card column slightly away from the exit edge for two-leg ties only — do **not** draw over or into the card.

## Components

| Piece | Change |
| --- | --- |
| `TieBlock` in `KnockoutEngine.tsx` | When `legs.length === 2`, render cards + `TieBracketConnector`; otherwise keep current single-card list |
| `TieBracketConnector` (new, colocated under `engines/` or inline in `KnockoutEngine`) | Draws the C in the gutter; reads `useIsRTL()` and `useThemeTokens().colors.border` |
| `MatchCard` | Unchanged |
| `selectKnockoutTies` / knockout model | Unchanged |

## Behavior

1. Measure/layout: cards stack vertically as today; connector gutter sits on the leading-exit side (`end` in writing direction = right in RTL, left in LTR).
2. Stub Y positions: vertical center of each card.
3. Merge Y: midpoint between the two stub Y positions.
4. Exit: from the vertical spine at the merge point, one horizontal line continues to the FlatList / screen edge on that side.
5. Gap: stubs begin a few px **outside** the card’s outer edge so they never overlap card chrome.
6. Single-leg ties: render cards only, no connector.

## Layout sketch

```
RTL (Hebrew)                      LTR (English)

[ Leg 1 ] ──┐                     ┌── [ Leg 1 ]
            ├──────────► edge     edge ◄──────────┤
[ Leg 2 ] ──┘                     └── [ Leg 2 ]
```

## Testing

- Manual: two-leg stage (e.g. CL round of 16) shows C connectors; single-leg (e.g. final) does not.
- Manual: switch language EN ↔ HE; connector flips side.
- Manual: dark/light theme; stroke remains visible via `border` token.
- Optional unit/smoke: if a tiny pure layout helper is extracted for stub/merge geometry, assert RTL vs LTR side choice; otherwise manual is enough for this UI-only change.
