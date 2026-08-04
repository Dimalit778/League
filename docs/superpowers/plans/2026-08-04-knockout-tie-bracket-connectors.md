# Knockout Tie Bracket Connectors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Draw classic C-shaped bracket connectors beside two-legged knockout ties so the two match cards merge into one line that continues to the screen edge (RTL → right, LTR → left), without the lines entering the cards.

**Architecture:** A pure `computeTieBracketGeometry` helper owns stub/merge Y positions and exit side. `TieBracketConnector` renders thin absolutely positioned `View` bars from that geometry. `TieBlock` in `KnockoutEngine` wraps two-leg ties with the connector overlay; single-leg ties stay unchanged.

**Tech Stack:** Expo React Native, NativeWind, `useIsRTL` / `useThemeTokens`, jest-expo.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-04-knockout-tie-bracket-connectors-design.md`
- Connectors only when `tie.legs.length === 2`
- Lines never enter/overlap the card; start a few px outside the card edge
- Stroke color = theme `colors.border`; stroke ~1.5px
- Hebrew / `isRTL === true` → connector on the **right**; English → **left**
- No new dependencies; prefer `View` segments over SVG
- Do not change `MatchCard` internals
- Stage only files each task names; do not commit unrelated WIP on the branch
- Tests colocated in `__tests__/`; run with `npx jest <path>`

## File map

| File | Responsibility |
| --- | --- |
| `src/features/matches/engines/tieBracketGeometry.ts` | Pure geometry: side, stub Ys, merge Y, gap, stub length |
| `src/features/matches/engines/__tests__/tieBracketGeometry.test.ts` | Unit tests for geometry |
| `src/features/matches/engines/TieBracketConnector.tsx` | Renders C from geometry + theme color |
| `src/features/matches/engines/KnockoutEngine.tsx` | Wire connector into two-leg `TieBlock` |

---

### Task 1: Pure bracket geometry helper

**Files:**
- Create: `src/features/matches/engines/tieBracketGeometry.ts`
- Test: `src/features/matches/engines/__tests__/tieBracketGeometry.test.ts`

**Interfaces:**
- Consumes: nothing (pure numbers + `isRTL` boolean)
- Produces:
  ```ts
  export type TieBracketSide = 'left' | 'right';

  export type TieBracketGeometry = {
    side: TieBracketSide;
    strokeWidth: number;
    gapFromCard: number;
    stubLength: number;
    topStubCenterY: number;
    bottomStubCenterY: number;
    mergeY: number;
    totalHeight: number;
  };

  export function computeTieBracketGeometry(params: {
    isRTL: boolean;
    cardHeight: number;
    cardsGap: number;
    strokeWidth?: number;
    gapFromCard?: number;
    stubLength?: number;
  }): TieBracketGeometry;
  ```

- [ ] **Step 1: Write the failing test**

Create `src/features/matches/engines/__tests__/tieBracketGeometry.test.ts`:

```ts
import { computeTieBracketGeometry } from '../tieBracketGeometry';

describe('computeTieBracketGeometry', () => {
  const base = { cardHeight: 100, cardsGap: 8 };

  it('places connector on the right for RTL and left for LTR', () => {
    expect(computeTieBracketGeometry({ ...base, isRTL: true }).side).toBe('right');
    expect(computeTieBracketGeometry({ ...base, isRTL: false }).side).toBe('left');
  });

  it('centers stubs on each card and merges midway', () => {
    const g = computeTieBracketGeometry({ ...base, isRTL: false });
    expect(g.topStubCenterY).toBe(50);
    expect(g.bottomStubCenterY).toBe(100 + 8 + 50);
    expect(g.mergeY).toBe((g.topStubCenterY + g.bottomStubCenterY) / 2);
    expect(g.totalHeight).toBe(100 + 8 + 100);
  });

  it('keeps a positive gap from the card and a usable stub length', () => {
    const g = computeTieBracketGeometry({ ...base, isRTL: true });
    expect(g.gapFromCard).toBeGreaterThan(0);
    expect(g.stubLength).toBeGreaterThan(g.gapFromCard);
    expect(g.strokeWidth).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/features/matches/engines/__tests__/tieBracketGeometry.test.ts`
Expected: FAIL (module / export not found)

- [ ] **Step 3: Write minimal implementation**

Create `src/features/matches/engines/tieBracketGeometry.ts`:

```ts
export type TieBracketSide = 'left' | 'right';

export type TieBracketGeometry = {
  side: TieBracketSide;
  strokeWidth: number;
  gapFromCard: number;
  stubLength: number;
  topStubCenterY: number;
  bottomStubCenterY: number;
  mergeY: number;
  totalHeight: number;
};

const DEFAULT_STROKE = 1.5;
const DEFAULT_GAP_FROM_CARD = 4;
const DEFAULT_STUB_LENGTH = 14;

export function computeTieBracketGeometry(params: {
  isRTL: boolean;
  cardHeight: number;
  cardsGap: number;
  strokeWidth?: number;
  gapFromCard?: number;
  stubLength?: number;
}): TieBracketGeometry {
  const strokeWidth = params.strokeWidth ?? DEFAULT_STROKE;
  const gapFromCard = params.gapFromCard ?? DEFAULT_GAP_FROM_CARD;
  const stubLength = params.stubLength ?? DEFAULT_STUB_LENGTH;
  const topStubCenterY = params.cardHeight / 2;
  const bottomStubCenterY = params.cardHeight + params.cardsGap + params.cardHeight / 2;
  return {
    side: params.isRTL ? 'right' : 'left',
    strokeWidth,
    gapFromCard,
    stubLength,
    topStubCenterY,
    bottomStubCenterY,
    mergeY: (topStubCenterY + bottomStubCenterY) / 2,
    totalHeight: params.cardHeight * 2 + params.cardsGap,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/features/matches/engines/__tests__/tieBracketGeometry.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/matches/engines/tieBracketGeometry.ts src/features/matches/engines/__tests__/tieBracketGeometry.test.ts
git commit -m "feat(matches): add knockout tie bracket geometry helper"
```

---

### Task 2: TieBracketConnector UI

**Files:**
- Create: `src/features/matches/engines/TieBracketConnector.tsx`

**Interfaces:**
- Consumes: `computeTieBracketGeometry` from `./tieBracketGeometry`; `useIsRTL` from `@/providers/LanguageProvider`; `useThemeTokens` from `@/hooks/useThemeTokens`
- Produces: `TieBracketConnector` component with props:
  ```ts
  {
    cardHeight: number;
    cardsGap: number;
    /** Distance from card outer edge to the list/screen edge on the exit side */
    railWidth: number;
  }
  ```

- [ ] **Step 1: Implement the connector**

Create `src/features/matches/engines/TieBracketConnector.tsx`:

```tsx
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useIsRTL } from '@/providers/LanguageProvider';
import { View } from 'react-native';
import { computeTieBracketGeometry } from './tieBracketGeometry';

type Props = {
  cardHeight: number;
  cardsGap: number;
  railWidth: number;
};

export function TieBracketConnector({ cardHeight, cardsGap, railWidth }: Props) {
  const isRTL = useIsRTL();
  const { colors } = useThemeTokens();
  const g = computeTieBracketGeometry({ isRTL, cardHeight, cardsGap });
  const color = colors.border;

  // Horizontal reach available after the card-edge gap
  const usable = Math.max(0, railWidth - g.gapFromCard);
  if (usable <= 0) return null;

  const stubW = Math.min(g.stubLength, usable);
  const exitStart = g.gapFromCard + stubW;
  const exitW = Math.max(0, railWidth - exitStart);
  const spineH = g.bottomStubCenterY - g.topStubCenterY;
  const bar = (extra: object) => ({
    position: 'absolute' as const,
    backgroundColor: color,
    ...extra,
  });

  const sideStyle = g.side === 'right' ? { right: 0 } : { left: 0 };

  return (
    <View
      pointerEvents="none"
      style={[{ position: 'absolute', top: 0, width: railWidth, height: g.totalHeight }, sideStyle]}
    >
      {/* top stub: from gapFromCard toward spine */}
      <View
        style={bar({
          top: g.topStubCenterY - g.strokeWidth / 2,
          height: g.strokeWidth,
          width: stubW,
          ...(g.side === 'right'
            ? { right: railWidth - exitStart }
            : { left: g.gapFromCard }),
        })}
      />
      {/* bottom stub */}
      <View
        style={bar({
          top: g.bottomStubCenterY - g.strokeWidth / 2,
          height: g.strokeWidth,
          width: stubW,
          ...(g.side === 'right'
            ? { right: railWidth - exitStart }
            : { left: g.gapFromCard }),
        })}
      />
      {/* vertical spine */}
      <View
        style={bar({
          top: g.topStubCenterY,
          height: spineH,
          width: g.strokeWidth,
          ...(g.side === 'right' ? { right: exitW } : { left: exitStart - g.strokeWidth / 2 }),
        })}
      />
      {/* exit to screen edge */}
      {exitW > 0 ? (
        <View
          style={bar({
            top: g.mergeY - g.strokeWidth / 2,
            height: g.strokeWidth,
            width: exitW,
            ...(g.side === 'right' ? { right: 0 } : { left: exitStart }),
          })}
        />
      ) : null}
    </View>
  );
}
```

Fix any off-by-one on spine `left`/`right` so the spine meets both stubs flush (miter look). Keep stubs starting at `gapFromCard` from the card-facing edge of the rail (card side = left of rail when `side === 'right'`, and vice versa).

Rail orientation note:
- When `side === 'right'`, the rail sits to the right of the cards; **card-facing edge is `left: 0` of the rail**. Stubs grow rightward from `left: gapFromCard`.
- When `side === 'left'`, the rail sits to the left of the cards; **card-facing edge is `right: 0` of the rail**. Stubs grow leftward from `right: gapFromCard`.

Prefer rewriting the positioning to that mental model if the first draft looks inverted on device.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i TieBracket || true`
Expected: no errors mentioning `TieBracket`

- [ ] **Step 3: Commit**

```bash
git add src/features/matches/engines/TieBracketConnector.tsx
git commit -m "feat(matches): add TieBracketConnector for two-leg ties"
```

---

### Task 3: Wire into KnockoutEngine TieBlock

**Files:**
- Modify: `src/features/matches/engines/KnockoutEngine.tsx`

**Interfaces:**
- Consumes: `TieBracketConnector`; `getMatchCardMetrics` from `../components/MatchCardBg`; `useWindowDimensions` from `react-native`; `useIsRTL`
- Produces: updated `TieBlock` that shows the connector only for `tie.legs.length === 2`

- [ ] **Step 1: Update TieBlock**

In `KnockoutEngine.tsx`:

1. Import `TieBracketConnector`, `getMatchCardMetrics`, `useWindowDimensions`, `useIsRTL`.
2. Replace `TieBlock` so that:
   - Always render the two (or one) `MatchCard`s as today.
   - If `tie.legs.length !== 2`, return the fragment of cards only.
   - If two legs:
     - `const { width: screenWidth } = useWindowDimensions()`
     - `const { height: cardHeight, width: cardWidth } = getMatchCardMetrics(screenWidth)`
     - `const cardsGap = 8` (small vertical gap between the two cards — add `style={{ marginBottom: cardsGap }}` on the first card wrapper, or a spacer `View` of height `cardsGap`)
     - `const railWidth = Math.max(0, (screenWidth - cardWidth) / 2)` — the existing MatchCard side padding zone. If too tight for a clear C (e.g. `railWidth < 24`), nudge cards away from the exit side by shifting the column with padding on the opposite side so the exit rail grows (keep cards from overlapping the lines).
     - Wrap in `<View style={{ position: 'relative' }}>` containing the cards column + `<TieBracketConnector cardHeight={cardHeight} cardsGap={cardsGap} railWidth={railWidth} />`.

Sketch:

```tsx
function TieBlock({ tie }: { tie: Tie }) {
  const { width: screenWidth } = useWindowDimensions();
  const isRTL = useIsRTL();
  const { height: cardHeight, width: cardWidth } = getMatchCardMetrics(screenWidth);
  const cardsGap = 8;
  const cards = tie.legs.map((leg) => {
    const card = mapMatchToCardData(leg);
    return (
      <MatchCard
        key={leg.id}
        id={card.id}
        home={card.home}
        away={card.away}
        prediction={card.prediction}
        predictionStatus={card.predictionStatus}
        status={card.status}
        date={card.date}
        time={card.time}
        onPress={() => router.push(`/(app)/(league)/match/${leg.id}`)}
      />
    );
  });

  if (tie.legs.length !== 2) {
    return <>{cards}</>;
  }

  const sidePadding = Math.max(0, (screenWidth - cardWidth) / 2);
  const minRail = 28;
  const railWidth = Math.max(sidePadding, minRail);
  const nudge = Math.max(0, railWidth - sidePadding);

  return (
    <View
      style={{
        position: 'relative',
        paddingLeft: !isRTL ? nudge : 0,
        paddingRight: isRTL ? nudge : 0,
      }}
    >
      <View style={{ gap: cardsGap }}>{cards}</View>
      <TieBracketConnector cardHeight={cardHeight} cardsGap={cardsGap} railWidth={railWidth} />
    </View>
  );
}
```

If NativeWind `gap` is preferred and already used nearby, `className="gap-2"` is fine instead of `style={{ gap: cardsGap }}` — but pass the same numeric `cardsGap` into the connector so geometry matches.

- [ ] **Step 2: Manual verification**

On simulator / device with a two-leg knockout stage:
- Two cards show C connector; lines do not enter cards
- Exit line reaches the screen edge on the correct side
- Switch language HE ↔ EN; connector flips side
- Single-leg stage (e.g. final): no connector
- Dark/light: stroke still visible via `border` token

- [ ] **Step 3: Commit**

```bash
git add src/features/matches/engines/KnockoutEngine.tsx
git commit -m "feat(matches): show C-bracket connectors on two-leg knockout ties"
```

---

## Spec coverage checklist

| Spec requirement | Task |
| --- | --- |
| Two-leg only | Task 3 |
| Classic C (stubs → spine → exit) | Task 2 |
| Outside card / gap | Tasks 1–2 (`gapFromCard`) |
| RTL right / LTR left | Tasks 1–3 |
| Theme `border` ~1.5px | Tasks 1–2 |
| No MatchCard changes | All tasks |
| Screen-edge exit + padding rail | Task 3 |
