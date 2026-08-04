# Web Header Tab Navigation

Replace the web sidebar drawer with horizontal tab links in the league tabs header.

## Goal

On web, users navigate between league tabs (Home, Matches, Leaderboard, Profile) via a header link list. The active tab is visually distinct. Native (iOS/Android) is unchanged.

## Scope

In scope:
- Web-only header nav for the four league tabs
- Active-tab styling (`primary` text + subtle `surface` background; inactive `muted`)
- Remove hamburger + `SidebarMenu` from the league tabs layout on web
- Keep the My Leagues (Trophy) button in the header

Out of scope:
- Native navigation changes
- Settings / DrawerHeader contexts outside league tabs
- New dependencies or navigation libraries

## Approach

Put the tab links directly in `TabsHeader` when `Platform.OS === 'web'`. Reuse the same routes already defined in `SidebarMenu`. Stop rendering `SidebarMenu` and `DrawerToggleButton` from the tabs layout/header on web.

## Components

| Piece | Change |
| --- | --- |
| `TabsHeader` / `TopTabBar` | On web: render horizontal tab links + Trophy; no hamburger, no page title. Native keeps title + Trophy |
| `SidebarMenu` | Remove from `(tabs)/_layout`; delete the component if nothing else imports it |
| `(tabs)/_layout.tsx` | Drop `{isWeb && <SidebarMenu />}` |
| Routes | Inline the four tab routes in the web header nav (same hrefs as today’s sidebar) |

## Behavior

- Tap a link → `router.push` to that tab route
- Active detection: same logic as today in `SidebarMenu` (`pathname` match; Home when `pathname === '/'`)
- RTL: respect existing header direction handling
- Web narrow widths: links stay in one row with normal padding; no hamburger fallback in this change

## Testing

Manual on web: each tab navigates correctly; active style follows the current route; Trophy still opens My Leagues; native bottom tabs still work.
