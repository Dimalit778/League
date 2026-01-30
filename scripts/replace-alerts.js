#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files to process
const files = [
  'src/features/leagues/screens/PreviewLeagueScreen.tsx',
  'src/features/leagues/screens/EditLeagueScreen.tsx',
  'src/features/settings/screens/SettingsScreen.tsx',
  'src/features/subscription/screens/SubscriptionScreen.tsx',
  'src/features/auth/components/GoogleAuth.tsx',
  'src/features/leagues/hooks/useLeagues.ts',
  'src/features/admin/screens/AdminCompetitionsScreen.tsx',
  'src/features/members/components/profile/LeagueDetailsSection.tsx',
  'src/features/members/components/profile/AvatarSection.tsx',
  'src/features/admin/screens/AdminUsersScreen.tsx',
];

function processFile(filePath) {
  console.log(`Processing: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Add useAlert import if Alert is imported
  if (content.includes('import { Alert') || content.includes('import {.*Alert')) {
    // Remove Alert from React Native imports
    content = content.replace(
      /import\s*{\s*([^}]*),?\s*Alert\s*,?\s*([^}]*)\s*}\s*from\s*['"]react-native['"];?/g,
      (match, before, after) => {
        const parts = [before, after].filter((p) => p && p.trim());
        const imports = parts
          .join(', ')
          .replace(/,\s*,/g, ',')
          .replace(/^,\s*|,\s*$/g, '');
        return imports ? `import { ${imports} } from 'react-native';` : '';
      },
    );

    // Add useAlert import
    if (!content.includes('import { useAlert }')) {
      content = content.replace(
        /(import.*from ['"]@\/hooks\/[^'"]*['"];?\n)/,
        "$1import { useAlert } from '@/hooks/useAlert';\n",
      );

      // If no other hook imports, add after component imports
      if (!content.includes('import { useAlert }')) {
        content = content.replace(
          /(import.*from ['"]@\/[^'"]*['"];?\n)/,
          "$1import { useAlert } from '@/hooks/useAlert';\n",
        );
      }
    }
    modified = true;
  }

  // Add useAlert hook usage in component
  if (content.includes('Alert.alert')) {
    // Add hook usage
    const hookPattern = /const\s+{\s*[^}]*\s*}\s*=\s*use\w+\([^)]*\);?/g;
    const lastHook = [...content.matchAll(hookPattern)].pop();

    if (lastHook && !content.includes('const { showAlert } = useAlert();')) {
      const insertPos = lastHook.index + lastHook[0].length;
      content = content.slice(0, insertPos) + '\n  const { showAlert } = useAlert();' + content.slice(insertPos);
      modified = true;
    }
  }

  // Replace Alert.alert calls
  content = content.replace(
    /Alert\.alert\(\s*([^,]+),\s*([^,]+)(?:,\s*\[([^\]]+)\])?\s*\);?/g,
    (match, title, message, buttons) => {
      let replacement = `showAlert({\n      title: ${title},\n      message: ${message},\n      type: 'info'`;

      if (buttons) {
        replacement += `,\n      buttons: [${buttons}]`;
      }

      replacement += ',\n    });';
      return replacement;
    },
  );

  if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`⏭️  No changes: ${filePath}`);
  }
}

// Process each file
files.forEach((file) => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
  } else {
    console.log(`❌ File not found: ${fullPath}`);
  }
});

console.log('\n🎉 Alert replacement complete!');
console.log('\nNext steps:');
console.log('1. Review the changes in each file');
console.log('2. Adjust button styles (cancel, destructive) as needed');
console.log('3. Set appropriate alert types (info, warning, error, success)');
console.log('4. Test the new alerts in your app');
