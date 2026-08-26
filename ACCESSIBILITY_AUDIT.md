# Native Accessibility Audit — August 26, 2026

## Scope

Internal accessibility review of the Champo Expo React Native application for iOS and Android. The review used WCAG 2.2 Level AA as the product target, native Apple/Android guidance, and the applicable principles of Israel Standard 5568 and the service-accessibility regulations.

This is an engineering audit, not an external legal certification.

## Checks performed

- Inspected all custom `Pressable` and `Touchable*` controls for a meaningful native role, name, state, and operable target.
- Reviewed shared typography for dynamic text support and Hebrew right-to-left behavior.
- Reviewed semantic light/dark theme colors and their automated contrast assertions.
- Reviewed headings, dialogs, tabs, switches, checkboxes, form validation, loading states, and live error announcements.
- Added automated assertions for the published statement, heading semantics, settings entry, and shared 48-point controls.
- Inspected the native iOS accessibility tree on an iPhone 17 Pro simulator and verified the unauthenticated entry screen at the largest accessibility text size without clipping or blocked actions.
- Ran Expo dependency validation, ESLint, TypeScript, component/unit tests, and Expo Doctor.

## Findings addressed

- Published an English/Hebrew accessibility statement in the app and repository.
- Added public access to the statement before sign-in, plus an Accessibility entry in Settings and native route/header.
- Increased shared small, medium, icon, toggle, section-action, and input-icon controls to a 48-point minimum target.
- Localized the theme switch's screen-reader label.
- Added or corrected native roles, labels, selected/checked/disabled/busy states, and target sizes in dialogs, league controls, match tabs, fixture tabs, tournament tabs, profile links, headers, and purchase recovery actions.
- Marked legal-document section titles as headings and modal content as modal for assistive technologies.

## Existing strengths verified

- Shared text permits font scaling and uses a 200% maximum multiplier by default.
- Shared buttons, list items, chips, inputs, tabs, skeletons, and navigation headers already expose native accessibility semantics.
- Form errors and loading/status content use accessibility live regions where appropriate.
- Semantic text-color combinations are covered by WCAG AA contrast tests in light and dark themes.
- Hebrew layout uses native RTL-aware direction and alignment.

## Known limitations and follow-up

- Dense standings tables and tournament brackets require continued manual verification at the largest text sizes.
- Third-party Apple/Google sign-in and App Store purchase sheets are partly outside Champo's accessibility control.
- A final release candidate should be manually traversed on physical devices using current VoiceOver and TalkBack, Switch Control/Voice Access, reduce-motion settings, and the largest supported text size.
- User-reported barriers should be recorded with device, OS, assistive technology, screen, and reproduction steps and prioritized when they prevent a core task.
