# Custom Alert System

This project now uses a custom alert system instead of React Native's native `Alert.alert`. The new system provides:

- ✅ **Web Compatibility**: Works perfectly on web, mobile, and all platforms
- 🎨 **Beautiful Design**: Modern, themed dialogs with smooth animations
- 🎯 **Type Safety**: Full TypeScript support
- 🌙 **Theme Integration**: Automatically adapts to light/dark themes
- 📱 **Responsive**: Adapts to different screen sizes

## Quick Migration

### Before (Native Alert)

```tsx
import { Alert } from 'react-native';

Alert.alert('Title', 'Message', [
  { text: 'Cancel', style: 'cancel' },
  { text: 'Delete', style: 'destructive', onPress: handleDelete },
]);
```

### After (Custom Alert)

```tsx
import { useAlert } from '@/hooks/useAlert';

const { showAlert } = useAlert();

showAlert({
  title: 'Title',
  message: 'Message',
  type: 'warning',
  buttons: [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: handleDelete },
  ],
});
```

## Alert Types

The system supports different visual styles:

- `info` - Blue theme (default)
- `success` - Green theme with checkmark
- `warning` - Amber theme with warning icon
- `error` - Red theme with error icon

## Button Styles

- `default` - Standard button
- `cancel` - Secondary style button
- `destructive` - Red button for dangerous actions

## Examples

### Simple Info Alert

```tsx
showAlert({
  title: 'Information',
  message: 'This is an info message',
  type: 'info',
  buttons: [{ text: 'OK' }],
});
```

### Success Alert

```tsx
showAlert({
  title: 'Success!',
  message: 'Operation completed successfully',
  type: 'success',
  buttons: [{ text: 'Great!' }],
});
```

### Confirmation Dialog

```tsx
showAlert({
  title: 'Delete Item',
  message: 'Are you sure you want to delete this item?',
  type: 'warning',
  buttons: [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: handleDelete },
  ],
});
```

### Error Alert

```tsx
showAlert({
  title: 'Error',
  message: 'Something went wrong. Please try again.',
  type: 'error',
  buttons: [{ text: 'OK' }],
});
```

## Setup

The `AlertProvider` is already configured in your app's root layout (`src/app/_layout.tsx`). You can use `useAlert()` in any component within the app.

## Migration Status

✅ **Completed:**

- ProfileScreen.tsx
- PreviewLeagueScreen.tsx
- AvatarSection.tsx

🔄 **Remaining files to migrate:**

- EditLeagueScreen.tsx
- SettingsScreen.tsx
- SubscriptionScreen.tsx
- GoogleAuth.tsx
- useLeagues.ts
- AdminCompetitionsScreen.tsx
- LeagueDetailsSection.tsx
- AdminUsersScreen.tsx

## Auto-Migration Script

A script is available at `scripts/replace-alerts.js` to help automate the migration process, but manual review is recommended for optimal results.
