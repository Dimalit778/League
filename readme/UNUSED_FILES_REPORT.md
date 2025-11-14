# Unused Files Report

## ✅ Files That Can Be Safely Deleted

### 1. **`src/utils/testAdminAccess.ts`** ❌ UNUSED
- **Status**: Only referenced in its own documentation comment
- **Reason**: Test utility that's never imported or used
- **Action**: Safe to delete (or keep for future admin testing)

### 2. **`src/utils/performanceMonitor.ts`** ❌ UNUSED
- **Status**: Not imported anywhere
- **Reason**: Performance monitoring utility that was created but never integrated
- **Action**: Safe to delete (or integrate if you want performance monitoring)

### 3. **`src/hooks/useImagePrefetch.ts`** ❌ UNUSED (DUPLICATE)
- **Status**: Not imported anywhere
- **Reason**: Duplicate of `usePrefetchImages.ts` - same functionality
- **Action**: **DELETE** - `usePrefetchImages.ts` is the one actually used

### 4. **`src/hooks/useImagePickerPermissions.ts`** ❌ UNUSED
- **Status**: Not imported anywhere
- **Reason**: Created but never used in the app
- **Action**: Safe to delete (or use if you need permission handling)

### 5. **`src/utils/getRoundNumber.ts`** ❌ UNUSED
- **Status**: Not imported anywhere
- **Reason**: Utility function that's never used
- **Action**: Safe to delete

### 6. **`src/components/layout/NativeTabs.tsx`** ❌ UNUSED
- **Status**: Not imported anywhere (only imports from expo-router)
- **Reason**: Alternative tab implementation that was replaced by `BottomTabs.tsx`
- **Action**: **DELETE** - `BottomTabs.tsx` is the one actually used in `_layout.tsx`

### 7. **`src/components/ui/Icon.tsx`** ⚠️ LIKELY UNUSED
- **Status**: Exported in `index.ts` but no actual usage found
- **Reason**: All icon usage in app uses `@assets/icons` directly or `Ionicons` from expo
- **Action**: **VERIFY & DELETE** - Check if used, if not, safe to delete

## ⚠️ Files That Are Used (DO NOT DELETE)

### Components in Use:
- ✅ `GoogleSignInButton.tsx` - Used in `GoogleAuth.tsx`
- ✅ `BottomTabs.tsx` - Used in `(tabs)/_layout.tsx`
- ✅ `Card.tsx` - Used in multiple screens (League, Stats, Match)
- ✅ `Icon.tsx` - Exported in `index.ts` but check actual usage
- ✅ `MyImage.tsx` - Used in Profile, League screens
- ✅ `AnimatedSkeleton.tsx` - Used in skeleton components

## 📊 Summary

### Safe to Delete (6 files):
1. `src/utils/testAdminAccess.ts`
2. `src/utils/performanceMonitor.ts`
3. `src/hooks/useImagePrefetch.ts` ⚠️ **DUPLICATE**
4. `src/hooks/useImagePickerPermissions.ts`
5. `src/utils/getRoundNumber.ts`
6. `src/components/layout/NativeTabs.tsx` ⚠️ **REPLACED**

### Total Size Savings:
- Estimated: ~15-20 KB of code
- Reduces bundle size
- Improves code maintainability

## 🎯 Recommended Actions

### High Priority (Duplicates/Replacements):
1. **Delete `useImagePrefetch.ts`** - Duplicate of `usePrefetchImages.ts`
2. **Delete `NativeTabs.tsx`** - Replaced by `BottomTabs.tsx`

### Medium Priority (Unused Utilities):
3. Delete `testAdminAccess.ts` - Test utility
4. Delete `performanceMonitor.ts` - Unused monitoring
5. Delete `useImagePickerPermissions.ts` - Unused hook
6. Delete `getRoundNumber.ts` - Unused utility

## ⚠️ Before Deleting

1. **Backup**: Make sure you have a git commit
2. **Test**: Run the app to ensure nothing breaks
3. **Verify**: Double-check imports in case of dynamic imports

## Commands to Delete

```bash
# Delete unused files
rm src/utils/testAdminAccess.ts
rm src/utils/performanceMonitor.ts
rm src/hooks/useImagePrefetch.ts
rm src/hooks/useImagePickerPermissions.ts
rm src/utils/getRoundNumber.ts
rm src/components/layout/NativeTabs.tsx

# Verify app still works
npm start
```

