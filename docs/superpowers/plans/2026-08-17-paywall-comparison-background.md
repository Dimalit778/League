# Paywall Comparison Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display the existing Season Pass artwork behind the full FREE/PRO comparison table while preserving readability.

**Architecture:** Keep the change local to `ChamoPaywallModal`. The comparison card becomes the clipping container for one absolutely positioned image and dark overlay; the existing table rows render above them unchanged.

**Tech Stack:** Expo, React Native, `expo-image`, `expo-linear-gradient`, Jest, Testing Library.

## Global Constraints

- Reuse `images.seasonPass`; add no assets or dependencies.
- Preserve the comparison content, RTL order, rounded clipping, and PRO-column styling.
- Treat the background artwork as decorative for accessibility.
- Do not create a Git commit unless the user explicitly requests one.

---

### Task 1: Move the Season Pass artwork behind the comparison table

**Files:**
- Modify: `src/features/subscription/screens/ChamoPaywallModal.tsx:174-225`
- Test: `src/features/subscription/components/__tests__/ChampoPaywallModal.test.tsx:26-43`

**Interfaces:**
- Consumes: `images.seasonPass`, Expo `Image`, and `LinearGradient`.
- Produces: a `comparison-background` test target rendered behind all comparison rows.

- [ ] **Step 1: Write the failing test**

Add an assertion that the decorative image exists and fills its parent:

```tsx
const background = getByTestId('comparison-background');
expect(background.props.contentFit).toBe('cover');
expect(background.props.accessible).toBe(false);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
npx jest src/features/subscription/components/__tests__/ChampoPaywallModal.test.tsx --runInBand
```

Expected: FAIL because `comparison-background` does not exist.

- [ ] **Step 3: Implement the background layers**

Remove the separate 150px image block. Inside the existing rounded comparison card, render:

```tsx
<Image
  testID="comparison-background"
  source={images.seasonPass}
  contentFit="cover"
  accessible={false}
  style={StyleSheet.absoluteFill}
/>
<LinearGradient
  colors={['rgba(3,11,21,0.72)', 'rgba(3,11,21,0.88)']}
  style={StyleSheet.absoluteFill}
/>
```

Keep the current header and `ComparisonRow` elements after these layers so they paint above the background.

- [ ] **Step 4: Run the focused test**

Run:

```bash
npx jest src/features/subscription/components/__tests__/ChampoPaywallModal.test.tsx --runInBand
```

Expected: PASS.

- [ ] **Step 5: Check edited-file diagnostics**

Check both edited files for TypeScript and lint diagnostics. Resolve only issues introduced by this change.
