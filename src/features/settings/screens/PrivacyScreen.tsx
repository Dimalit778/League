import { Screen } from '@/components/layout';
import { BackButton } from '@/components/ui';
import { CText } from '@/components/ui/CText';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PrivacyScreen = () => {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const edges = useSafeAreaInsets();

  const policySections = [
    {
      title: 'Introduction',
      icon: 'shield-checkmark',
      iconLibrary: 'Ionicons',
      iconColor: colors.primary,
      body: [
        'League is committed to protecting your privacy and providing a transparent explanation of how your data is handled. These terms describe how we collect, use, and safeguard information when you use the League mobile application and related services.',
      ],
    },
    {
      title: 'Information We Collect',
      icon: 'person-circle-outline',
      iconLibrary: 'Ionicons',
      iconColor: colors.secondary,
      body: [
        'Profile Information: Details you provide such as your name, contact information, preferred teams, and profile photo.',
        'Usage Data: Interactions within the app including match selections, preferences, and device information (operating system, app version, and device identifiers).',
        'Support Communications: Messages and attachments you send to our support team.',
      ],
    },
    {
      title: 'How We Use Information',
      icon: 'bar-chart-outline',
      iconLibrary: 'Ionicons',
      iconColor: '#10b981', // green
      body: [
        'Provide and Improve Services: Deliver personalized schedules, notifications, and recommendations based on your preferences.',
        'Security and Integrity: Detect, prevent, and investigate activities that could compromise the safety or reliability of the service.',
        'Communication: Send service updates, respond to support requests, and inform you about new features. You can opt out of non-essential communications at any time.',
      ],
    },
    {
      title: 'Sharing and Disclosure',
      icon: 'share-social-outline',
      iconLibrary: 'Ionicons',
      iconColor: '#8b5cf6', // purple
      body: [
        'We do not sell your personal information. Data is only shared with trusted vendors who support core functionality such as authentication, analytics, and customer support. Each vendor is contractually obligated to safeguard your information and use it solely for the services they provide to League.',
      ],
    },
    {
      title: 'Data Retention',
      icon: 'time-outline',
      iconLibrary: 'Ionicons',
      iconColor: '#f59e0b', // amber
      body: [
        'We retain your information for as long as your account remains active or as needed to provide services. You may request deletion of your account at any time, after which we will remove or anonymize your personal data unless retention is required by law.',
      ],
    },
    {
      title: 'Your Choices',
      icon: 'settings-outline',
      iconLibrary: 'Ionicons',
      iconColor: '#06b6d4', // cyan
      body: [
        'Access and Update: Review or update your profile details directly within the app settings.',
        'Notifications: Customize push notification preferences within the device or in-app settings.',
        'Data Requests: Contact us to request a copy, correction, or deletion of your personal data. We will respond in accordance with applicable laws.',
      ],
    },
    {
      title: "Children's Privacy",
      icon: 'people-outline',
      iconLibrary: 'Ionicons',
      iconColor: '#ec4899', // pink
      body: [
        'League is not intended for children under the age of 13. We do not knowingly collect personal information from children. If we learn that we have collected such data, we will take steps to delete it promptly.',
      ],
    },
    {
      title: 'Updates to These Terms',
      icon: 'notifications-outline',
      iconLibrary: 'Ionicons',
      iconColor: '#6366f1', // indigo
      body: [
        'We may update this policy from time to time to reflect changes in our practices or legal requirements. Significant updates will be communicated within the app or via email. Continued use of League after changes become effective constitutes acceptance of the revised policy.',
      ],
    },
  ];

  const renderIcon = (iconName: string, iconLibrary: string, color: string, size: number = 24) => {
    if (iconLibrary === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
    }
    return <Ionicons name={iconName as any} size={size} color={color} />;
  };

  return (
    <Screen withSafeArea>
      <BackButton title={t('Policy Terms')} />

      <ScrollView
        className="flex-1 "
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: edges.bottom + 20, paddingHorizontal: 10 }}
      >
        <CText variant="h2" className="my-4">
          {t('Privacy & Data Protection')}
        </CText>
        {policySections.map((section) => (
          <View
            key={section.title}
            className="mb-4 p-4 rounded-2xl bg-surface"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {/* Section Header with Icon */}
            <View className="flex-row items-center mb-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: section.iconColor + '15' }}
              >
                {renderIcon(section.icon, section.iconLibrary, section.iconColor, 22)}
              </View>
              <CText variant="h3" className="flex-1">
                {t(section.title)}
              </CText>
            </View>

            {/* Section Body */}
            <View className="ml-13">
              {section.body.map((paragraph, idx) => (
                <View key={idx} className="flex-row mb-2">
                  <CText variant="body" className="text-muted mr-2">
                    •
                  </CText>
                  <CText variant="body" className="flex-1 text-muted leading-6">
                    {t(paragraph)}
                  </CText>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Footer */}
        <View className="mt-4 p-4 rounded-2xl" style={{ backgroundColor: colors.primary + '10' }}>
          <CText variant="body" className="text-center text-muted leading-6">
            {t('By continuing to use League you acknowledge that you have read and agree to these policy terms.')}
          </CText>
        </View>
      </ScrollView>
    </Screen>
  );
};

export default PrivacyScreen;
