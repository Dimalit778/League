import { Screen } from '@/components/layout';
import { BackButton } from '@/components/ui';
import { CText } from '@/components/ui/CText';
import { useTranslation } from '@/hooks/useTranslation';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PrivacyScreen = () => {
  const { t } = useTranslation();
  const policySections = [
    {
      title: 'Introduction',
      body: [
        'League is committed to protecting your privacy and providing a transparent explanation of how your data is handled. These terms describe how we collect, use, and safeguard information when you use the League mobile application and related services.',
      ],
    },
    {
      title: 'Information We Collect',
      body: [
        'Profile Information: Details you provide such as your name, contact information, preferred teams, and profile photo.',
        'Usage Data: Interactions within the app including match selections, preferences, and device information (operating system, app version, and device identifiers).',
        'Support Communications: Messages and attachments you send to our support team.',
      ],
    },
    {
      title: 'How We Use Information',
      body: [
        'Provide and Improve Services: Deliver personalized schedules, notifications, and recommendations based on your preferences.',
        'Security and Integrity: Detect, prevent, and investigate activities that could compromise the safety or reliability of the service.',
        'Communication: Send service updates, respond to support requests, and inform you about new features. You can opt out of non-essential communications at any time.',
      ],
    },
    {
      title: 'Sharing and Disclosure',
      body: [
        'We do not sell your personal information. Data is only shared with trusted vendors who support core functionality such as authentication, analytics, and customer support. Each vendor is contractually obligated to safeguard your information and use it solely for the services they provide to League.',
      ],
    },
    {
      title: 'Data Retention',
      body: [
        'We retain your information for as long as your account remains active or as needed to provide services. You may request deletion of your account at any time, after which we will remove or anonymize your personal data unless retention is required by law.',
      ],
    },
    {
      title: 'Your Choices',
      body: [
        'Access and Update: Review or update your profile details directly within the app settings.',
        'Notifications: Customize push notification preferences within the device or in-app settings.',
        'Data Requests: Contact us to request a copy, correction, or deletion of your personal data. We will respond in accordance with applicable laws.',
      ],
    },
    {
      title: "Children's Privacy",
      body: [
        'League is not intended for children under the age of 13. We do not knowingly collect personal information from children. If we learn that we have collected such data, we will take steps to delete it promptly.',
      ],
    },
    {
      title: 'Updates to These Terms',
      body: [
        'We may update this policy from time to time to reflect changes in our practices or legal requirements. Significant updates will be communicated within the app or via email. Continued use of League after changes become effective constitutes acceptance of the revised policy.',
      ],
    },
    {
      title: 'Contact Us',
      body: ['If you have any questions or concerns about these policy terms, contact us at support@league.app.'],
    },
  ];
  const edges = useSafeAreaInsets();

  return (
    <Screen withSafeArea className="">
      <BackButton title={t('Policy Terms')} />
      <ScrollView
        className="flex-1 px-2 "
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: edges.bottom + 10 }}
      >
        {policySections.map((section) => (
          <View key={section.title} className="mb-6">
            <CText className="text-lg font-semibold text-text mb-3">{t(section.title)}</CText>
            {section.body.map((paragraph) => (
              <CText key={paragraph} className="mt-2 text-base leading-6 text-zinc-300">
                {`• ${t(paragraph)}`}
              </CText>
            ))}
          </View>
        ))}

        <CText variant="small" className=" text-muted">
          {t('By continuing to use League you acknowledge that you have read and agree to these policy terms.')}
        </CText>
      </ScrollView>
    </Screen>
  );
};

export default PrivacyScreen;
