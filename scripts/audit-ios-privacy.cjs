const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const appConfig = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).expo;
const failures = [];

const fail = (message) => failures.push(message);
const plugin = (name) =>
  appConfig.plugins.find((entry) => (Array.isArray(entry) ? entry[0] === name : entry === name));

const imagePicker = plugin('expo-image-picker');
const imagePickerOptions = Array.isArray(imagePicker) ? imagePicker[1] : {};
if (!imagePickerOptions?.photosPermission) fail('expo-image-picker must explain profile photo access.');
if (imagePickerOptions?.cameraPermission !== false) fail('Camera permission must stay disabled.');
if (imagePickerOptions?.microphonePermission !== false) fail('Microphone permission must stay disabled.');

const secureStore = plugin('expo-secure-store');
const secureStoreOptions = Array.isArray(secureStore) ? secureStore[1] : {};
if (secureStoreOptions?.faceIDPermission !== false) fail('Face ID permission must stay disabled.');

const manifest = appConfig.ios?.privacyManifests;
if (appConfig.ios?.supportsTablet !== true) {
  fail('The iOS release must support both iPhone and iPad (ios.supportsTablet=true).');
}
if (!manifest) {
  fail('ios.privacyManifests is missing.');
} else {
  if (Object.prototype.hasOwnProperty.call(manifest, 'supportsTablet')) {
    fail('supportsTablet belongs under ios, not inside ios.privacyManifests.');
  }
  if (manifest.NSPrivacyTracking !== false) fail('NSPrivacyTracking must be false.');
  if ((manifest.NSPrivacyTrackingDomains ?? []).length > 0) fail('Tracking domains must be empty.');

  const expectedTypes = new Set([
    'NSPrivacyCollectedDataTypeName',
    'NSPrivacyCollectedDataTypeEmailAddress',
    'NSPrivacyCollectedDataTypePhotosorVideos',
    'NSPrivacyCollectedDataTypeGameplayContent',
    'NSPrivacyCollectedDataTypeOtherUserContent',
    'NSPrivacyCollectedDataTypeUserID',
    'NSPrivacyCollectedDataTypePurchaseHistory',
    'NSPrivacyCollectedDataTypeProductInteraction',
  ]);
  const declared = manifest.NSPrivacyCollectedDataTypes ?? [];
  const declaredTypes = new Set(declared.map((item) => item.NSPrivacyCollectedDataType));

  for (const type of expectedTypes) {
    if (!declaredTypes.has(type)) fail(`Missing collected data type: ${type}`);
  }

  for (const item of declared) {
    if (item.NSPrivacyCollectedDataTypeTracking !== false) {
      fail(`${item.NSPrivacyCollectedDataType} must not be marked for tracking.`);
    }
    if (!Array.isArray(item.NSPrivacyCollectedDataTypePurposes) || item.NSPrivacyCollectedDataTypePurposes.length === 0) {
      fail(`${item.NSPrivacyCollectedDataType} must declare at least one purpose.`);
    }
  }
}

const profileHero = fs.readFileSync(
  path.join(root, 'src/features/members/components/profile/ProfileHeroCard.tsx'),
  'utf8',
);
if (profileHero.includes('requestMediaLibraryPermissionsAsync')) {
  fail('Avatar picker must use the system picker without requesting broad library access first.');
}
if (profileHero.includes('launchCameraAsync')) fail('Avatar flow must not launch the camera.');

if (failures.length > 0) {
  console.error('iOS privacy audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  'iOS release audit passed: iPhone/iPad enabled, tracking disabled, manifest complete, unnecessary permissions blocked.',
);
