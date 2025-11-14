# ErrorBoundary Test Guide

## ✅ Environment Variables Verified

Your `.env` file is properly configured with:
- ✅ `EXPO_PUBLIC_SUPABASE_URL` - Set
- ✅ `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Set  
- ✅ `EXPO_PUBLIC_SUPABASE_STORAGE_PROFILE_IMAGES_BUCKET` - Set

## ✅ ErrorBoundary Integration Verified

The ErrorBoundary component has been updated with:
- ✅ Sentry import added
- ✅ Error reporting to Sentry in production (`!__DEV__`)
- ✅ Console logging in development (`__DEV__`)
- ✅ Proper error context with component stack

## Testing the ErrorBoundary

### Manual Test (Development)

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Create a test error component** (temporary):
   Create `src/test/ErrorTest.tsx`:
   ```tsx
   import { useState } from 'react';
   import { Button, View } from 'react-native';
   
   export const ErrorTest = () => {
     const [shouldError, setShouldError] = useState(false);
     
     if (shouldError) {
       throw new Error('Test error for ErrorBoundary');
     }
     
     return (
       <View style={{ padding: 20 }}>
         <Button 
           title="Trigger Error" 
           onPress={() => setShouldError(true)} 
         />
       </View>
     );
   };
   ```

3. **Add to a test screen** temporarily to trigger the error

4. **Expected behavior:**
   - In development: Error shows in console, error UI displays
   - In production: Error sent to Sentry, error UI displays

### Production Test

1. **Build production version:**
   ```bash
   eas build --platform ios --profile production
   ```

2. **Install on device via TestFlight**

3. **Trigger an error** (or wait for real error)

4. **Check Sentry dashboard:**
   - Go to: https://sentry.io/organizations/dima-apps/projects/leaguechampion/
   - Look for error reports with React component stack

## Verification Checklist

- [x] `.env` file exists with Supabase credentials
- [x] ErrorBoundary imports Sentry
- [x] ErrorBoundary wraps app in `_layout.tsx`
- [x] Sentry configured in `_layout.tsx`
- [ ] Test error trigger in development
- [ ] Verify Sentry receives errors in production build

## Next Steps

1. Run `npm start` to verify app starts correctly
2. Test error boundary by intentionally causing an error
3. Build production version and verify Sentry integration
4. Monitor Sentry dashboard for real errors

