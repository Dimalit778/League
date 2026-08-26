import { SupportedLanguage } from '@/store/LanguageStore';

export type LegalSection = {
  title: string;
  body: string[];
};

export type LegalDocument = {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
  footer: string;
};

export const legalContent: Record<
  SupportedLanguage,
  { privacy: LegalDocument; terms: LegalDocument; accessibility: LegalDocument }
> = {
  en: {
    privacy: {
      title: 'Privacy Policy',
      updatedAt: 'Last updated: August 26, 2026',
      intro:
        'Champo is a free football prediction app for creating leagues, joining friends, submitting predictions, and viewing rankings. Champo 1.0 contains no purchases or subscriptions. This policy explains what information we collect, how we use it, and the choices available to you.',
      sections: [
        {
          title: 'Who We Are',
          body: [
            'Champo is operated by the developer identified on Champo’s App Store product page (referred to in this policy as “Champo”, “we”, or “us”). For privacy questions or requests, contact support@champoapp.com.',
          ],
        },
        {
          title: 'Information We Collect',
          body: [
            'Account information: name, email address, authentication provider details, and basic profile details you provide when signing in or managing your account.',
            'League and prediction content: leagues you create or join, nicknames, invite codes, predictions, scores, rankings, and related in-app activity.',
            'Profile media: avatar images or other photos you choose to upload. The system photo picker opens only when you choose to add or update profile media; Champo does not request broad photo-library access in advance.',
            'Device, diagnostics, and usage data: app version, device type, operating system, crash reports, error messages and stack traces, navigation and performance data, and security logs. If you enable match reminders, we store a push notification token for your device to deliver reminders about upcoming matches. You can disable reminders at any time in Settings, which removes the token.',
            'Support communications: messages, attachments, and contact details you send when requesting help.',
          ],
        },
        {
          title: 'How We Use Information',
          body: [
            'To provide the app experience, including authentication, league creation, prediction submission, standings, profile display, and member management.',
            'To send transactional messages such as email verification, password reset messages, important account notices, and replies to support requests.',
            'To secure the service, prevent abuse, debug errors, improve reliability, and understand how core features are used.',
            'To comply with legal obligations, App Store requirements, and enforce our Terms of Service.',
          ],
        },
        {
          title: 'Sharing and Service Providers',
          body: [
            'We do not sell your personal information.',
            'We share information only with providers needed to run the app, such as Supabase for authentication/database/storage, Google Cloud Vision for profile-image safety checks, Sentry for diagnostics, and authentication providers such as Apple or Google when you choose those sign-in methods.',
            'Gemini and Tavily may be used to prepare AI-assisted match previews from public football information. The current implementation does not send account details, names, email addresses, profile images, league memberships, or predictions to these services.',
            'These providers may process information on our behalf and must protect it consistently with this policy and applicable law.',
            'We may disclose information if required by law, to protect rights and safety, or as part of a business transfer such as a merger or acquisition.',
          ],
        },
        {
          title: 'Legal Bases for Processing (EEA and UK)',
          body: [
            'We process account, league, and prediction information as necessary to provide the service and perform our contract with you.',
            'We process limited diagnostics, security logs, abuse-prevention information, and service analytics for our legitimate interests in securing, maintaining, and improving Champo, balanced against your rights and expectations.',
            'We process information when necessary to comply with legal obligations. Where applicable law requires consent, including for an optional device permission, you may withdraw that consent at any time without affecting earlier lawful processing.',
          ],
        },
        {
          title: 'Google Cloud Vision Image Moderation',
          body: [
            'When you choose to upload or replace a profile image, the image is sent to Google Cloud Vision before it is saved. We use its automated SafeSearch detection to estimate whether the image contains adult, racy, violent, or medical content. Champo uses the returned likelihood ratings to accept or reject the upload under our community standards.',
            'The Vision request contains the image itself but does not include your Champo name, email address, user ID, league membership, or predictions. According to Google’s current Cloud Vision data-usage documentation, images submitted through the synchronous API used by Champo are processed in memory and are not persisted to disk; Google may temporarily log request metadata such as request time and size. Google states that submitted content is used only to provide the Vision service and is not used to train Cloud Vision models.',
            'Automated moderation can make mistakes. If your image is rejected and you believe the decision was incorrect, contact support@champoapp.com. Do not upload an image if you do not want it processed by Google Cloud Vision; you can continue using Champo without a profile image.',
          ],
        },
        {
          title: 'Sentry Diagnostics',
          body: [
            'In production mobile versions of Champo, Sentry processes crash reports, error messages and stack traces, app release and version information, device and operating-system details, navigation and sampled performance traces, and technical context needed to diagnose failures. Champo’s server functions may also send Sentry an error type, message, stack trace, function name, request identifier, and response status.',
            'We use this information to detect crashes, troubleshoot errors, monitor performance, protect the service, and improve reliability. Champo configures the mobile Sentry SDK not to send default personally identifiable information or screenshots, and Champo does not enable Sentry Session Replay. We do not intentionally send names, email addresses, profile images, league content, or predictions to Sentry, although diagnostic events can contain technical values present when an error occurs.',
            'Sentry processes diagnostic information on our behalf under its own security, retention, and international-transfer arrangements. Sentry cloud-event retention is controlled by the active Sentry plan and account settings. Champo minimizes events before transmission by removing user identity, request headers, cookies, payloads, query strings, and breadcrumb data.',
          ],
        },
        {
          title: 'Data Retention and Deletion',
          body: [
            'Account and profile information is retained while your account is active. You can delete your account in Settings. We then delete your authentication account, profile details and profile images, revoke Sign in with Apple authorization when applicable, and attempt to revoke a connected Google sign-in grant on supported devices.',
            'Past predictions, points, and the minimum league-member record needed to preserve standings are retained for as long as the related league history or service is maintained. They are de-identified by removing the user ID, profile image, and personal nickname; appear as “Deleted Player”; and cannot be used to identify or sign in to your former account.',
            'Champo 1.0 is free and does not collect purchase history or offer subscriptions, paid upgrades, or external purchase links.',
            'Operational records under Champo’s control are automatically deleted on this schedule: authentication audit records after 90 days; football-provider call logs after 31 days; scheduler run history after 30 days; and monthly image-moderation usage totals after 14 months. Unreferenced profile-image files are deleted after a 7-day safety window.',
            'A content report remains available while pending. A resolved or dismissed report, including its moderation evidence, is deleted 24 months after review. Reports in which a deleted account was the reporter or the reported user are deleted as part of account deletion. Legal-acceptance evidence is retained for the life of the account and deleted with the authentication account.',
            'The current Supabase Free project does not include automatic database backups. If database or off-site backups are enabled later, Champo will encrypt them, restrict access, and configure a maximum 14-day expiry; a deletion may therefore remain in a backup only until that backup expires. Supabase database backups do not include stored profile-image objects.',
            'Google Cloud Vision does not retain synchronous image content at rest as described above. Retention for Sentry cloud events, Google request metadata, and other provider-controlled logs follows the provider account settings, contract, and legal obligations. Support communications are retained only as long as reasonably needed to resolve the request and meet security or legal obligations.',
            'You can request access, correction, export, or deletion of your personal data by contacting support@champoapp.com. Limited records may still be retained when required by law, security, or fraud-prevention obligations.',
          ],
        },
        {
          title: 'Your Choices',
          body: [
            'You can update profile details in the app where supported.',
            'You may optionally enable match reminders after reviewing an in-app explanation. You can change notification permission at any time in your device settings.',
            'Where consent is required, you may withdraw it by changing device permissions, app settings, or contacting us.',
          ],
        },
        {
          title: 'Children',
          body: [
            'Champo is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe a child provided personal information, contact us and we will take appropriate steps to delete it.',
          ],
        },
        {
          title: 'Security and International Processing',
          body: [
            'We use reasonable technical and organizational safeguards to protect information, but no system can be guaranteed to be completely secure.',
            'Your information may be processed in countries other than where you live. When this happens, we rely on appropriate safeguards required by applicable law.',
          ],
        },
        {
          title: 'Changes to This Policy',
          body: [
            'We may update this policy to reflect product, legal, or operational changes. If changes are material, we will provide notice in the app or by another reasonable method.',
          ],
        },
        {
          title: 'Contact Us',
          body: ['For privacy questions or data requests, contact support@champoapp.com.'],
        },
      ],
      footer: 'Privacy questions and data requests: support@champoapp.com',
    },
    terms: {
      title: 'Terms of Service',
      updatedAt: 'Last updated: August 26, 2026',
      intro:
        'These Terms of Service govern your use of Champo. By creating an account, joining a league, submitting predictions, or otherwise using the app, you agree to these terms.',
      sections: [
        {
          title: 'Eligibility and Accounts',
          body: [
            'You must be at least 13 years old to use Champo.',
            'You are responsible for keeping your account credentials secure and for activity that occurs under your account.',
            'You agree to provide accurate account information and to keep it up to date.',
          ],
        },
        {
          title: 'App Use',
          body: [
            'Champo lets users create or join football prediction leagues, invite members, submit score predictions, view rankings, and follow football fixtures and standings.',
            'You may not misuse the app, interfere with its operation, attempt unauthorized access, scrape data, reverse engineer protected parts of the service, or use the app for unlawful activity.',
            'You are responsible for content you submit, including league names, nicknames, profile images, and predictions. Do not submit content that is illegal, abusive, infringing, misleading, or harmful.',
            'Champo may apply automated text filters, accept user reports, restrict visibility, remove content or members, and suspend accounts to protect users. You may report objectionable content and block users from the relevant profile or league screens.',
            'You retain ownership of content you submit. You grant Champo a limited, non-exclusive license to host, display, process, and moderate that content only as needed to operate, secure, and improve the service. This license ends when the content is deleted, except for de-identified league history described in the Privacy Policy.',
          ],
        },
        {
          title: 'Objectionable Content and Community Standards',
          body: [
            'Champo has zero tolerance for objectionable content and abusive behavior. This applies to everything you upload or submit, including profile images, league names, nicknames, and any other user-generated content.',
            'You may not upload, post, or share content that: is sexually explicit, pornographic, or nude; depicts or promotes violence, self-harm, terrorism, or illegal activity; is hateful, harassing, threatening, or discriminatory toward any person or group; infringes another party’s intellectual property, privacy, or publicity rights; impersonates another person or organization; or is otherwise unlawful, deceptive, or harmful.',
            'You may not use another person’s photo, a public figure’s image, or copyrighted artwork as your profile image without the right to do so.',
            'To keep the community safe, Champo may screen or moderate uploaded images and text automatically or manually, and may reject, blur, remove, or replace content that violates these standards, with or without prior notice.',
            'Every member can report objectionable content or an abusive user, and can block a user, from the relevant profile or league screen. Reports can also be sent to support@champoapp.com.',
            'We aim to review reports and remove violating content and remove or suspend the responsible users within 24 hours of a valid report. Serious violations may result in immediate and permanent removal from the service, and may be reported to the relevant authorities where required by law.',
          ],
        },
        {
          title: 'Predictions and Football Data',
          body: [
            'Predictions are for entertainment and social competition. Champo does not provide betting, gambling, financial advice, or guaranteed match outcomes.',
            'Fixtures, scores, events, standings, team information, and related football data may come from third-party sources and may be delayed, incomplete, or inaccurate.',
            'Football data is provided by the Football-Data.org API. Champo is an independent product and is not affiliated with, endorsed by, or sponsored by FIFA, UEFA, any league, competition, club, or team. Names and other identifiers remain the property of their respective owners.',
            'We may correct scoring, rankings, or match data when errors are detected.',
          ],
        },
        {
          title: 'Free Access',
          body: [
            'Champo 1.0 is free and contains no in-app purchases, subscriptions, paid upgrades, or external purchase links.',
            'Every feature visible in this release is available without payment.',
            'If paid functionality is introduced in a future version, we will update these terms and present the price and conditions before any purchase.',
          ],
        },
        {
          title: 'Privacy',
          body: [
            'Our Privacy Policy explains how we collect, use, share, retain, and delete information. By using the app, you acknowledge that information will be handled as described in that policy.',
          ],
        },
        {
          title: 'Third-Party Services',
          body: [
            'The app may rely on third-party services such as Apple, Google, Google Cloud Vision, Supabase, Sentry, Gemini, Tavily, notification services, and sports data providers. Your use of those services may also be governed by their own terms and policies.',
          ],
        },
        {
          title: 'Suspension and Termination',
          body: [
            'We may suspend or terminate access if you violate these terms, create risk for other users or the service, or if we are required to do so by law.',
            'You may stop using the app at any time. Some records may be retained as described in the Privacy Policy.',
          ],
        },
        {
          title: 'Disclaimers and Liability',
          body: [
            'The app is provided on an "as is" and "as available" basis. We do not guarantee uninterrupted service, error-free data, or that every feature will remain available.',
            'To the maximum extent allowed by law, we are not liable for indirect, incidental, special, consequential, or punitive damages, or for losses caused by inaccurate sports data, service interruptions, or user-submitted content.',
          ],
        },
        {
          title: 'Apple Terms',
          body: [
            'For iOS users, your use of the app is also subject to Apple Media Services terms and the applicable App Store license terms. If there is a conflict between these terms and mandatory Apple terms for App Store distribution, the Apple terms control where required.',
          ],
        },
        {
          title: 'General Legal Terms',
          body: [
            'These terms supplement the standard Apple App Store license terms. Mandatory consumer rights in your country are not limited by these terms.',
            'If any provision is found unenforceable, the remaining provisions continue in effect. Failure to enforce a provision is not a waiver of the right to enforce it later.',
            'The laws applicable to the Champo operator in its place of establishment govern these terms, except where mandatory local consumer law gives you additional rights or requires another forum.',
          ],
        },
        {
          title: 'Changes and Contact',
          body: [
            'We may update these terms from time to time. Continued use after the effective date of updated terms means you accept the updated terms.',
            'For questions about these terms, contact support@champoapp.com.',
          ],
        },
      ],
      footer: 'Questions about these terms: support@champoapp.com',
    },
    accessibility: {
      title: 'Accessibility Statement',
      updatedAt: 'Last reviewed: August 26, 2026',
      intro:
        'Champo is committed to making its native mobile experience usable by as many people as possible, including people who use assistive technologies. Accessibility is treated as an ongoing product responsibility.',
      sections: [
        {
          title: 'Accessibility Approach',
          body: [
            'We aim to follow the applicable principles of Israel Standard 5568, the Equal Rights for Persons with Disabilities service-accessibility regulations, and WCAG 2.2 Level AA, while applying Apple and Android native accessibility guidance.',
            'This statement describes an internal code and automated-test review. It is not a certification by an external accessibility professional and does not claim that every screen or device combination is free of barriers.',
          ],
        },
        {
          title: 'Accessibility Features',
          body: [
            'Support for VoiceOver on iOS and TalkBack on Android through native labels, roles, selected/disabled/busy states, headings, tabs, switches, checkboxes, and live error announcements.',
            'Text scaling is enabled across the shared typography system up to 200%, and the interface supports both English and Hebrew, including right-to-left layout.',
            'Shared controls use accessible touch targets, visible text labels, light and dark themes, and semantic colors whose primary text combinations are automatically checked for WCAG AA contrast.',
            'Important actions do not rely only on color or icons, and form fields expose labels, hints, validation messages, and appropriate input behavior to assistive technologies.',
          ],
        },
        {
          title: 'Review Scope',
          body: [
            'The latest internal review covered the native navigation and settings flows, shared buttons, links, cards, tabs, dialogs, form controls, match controls, league controls, authentication controls, dynamic text behavior, Hebrew right-to-left behavior, and light/dark semantic color contrast.',
            'The review included static inspection of custom touch controls, automated accessibility assertions in component tests, linting, TypeScript checks, the full automated test suite, and an iOS simulator accessibility-tree and largest-text-size check of the public entry screen. Manual testing with current VoiceOver and TalkBack versions remains part of ongoing release verification.',
          ],
        },
        {
          title: 'Known Limitations',
          body: [
            'Some dense football tables, tournament brackets, third-party sign-in interfaces, and content supplied by external providers may be less convenient with very large text or some assistive-technology combinations.',
            'We continue to review these areas and prioritize fixes that block navigation, understanding, or completion of core actions.',
          ],
        },
        {
          title: 'Accessibility Feedback',
          body: [
            'If you encounter an accessibility barrier, contact support@champoapp.com. Please include the screen or action, your device and operating-system version, the assistive technology used, and a short description of the problem.',
            'We will review accessibility reports and make reasonable efforts to provide an accessible alternative and correct verified issues as soon as practicable.',
          ],
        },
      ],
      footer: 'Accessibility feedback: support@champoapp.com',
    },
  },
  he: {
    privacy: {
      title: 'מדיניות פרטיות',
      updatedAt: 'עודכן לאחרונה: 26 באוגוסט 2026',
      intro:
        'Champo היא אפליקציית ניחושי כדורגל חינמית ליצירת ליגות, הצטרפות לחברים, שליחת ניחושים וצפייה בדירוגים. גרסה 1.0 אינה כוללת רכישות או מנויים. מדיניות זו מסבירה איזה מידע אנו אוספים, כיצד אנו משתמשים בו, ומהן הבחירות שעומדות לרשותך.',
      sections: [
        {
          title: 'מי אנחנו',
          body: [
            'Champo מופעלת על ידי המפתח שמופיע בעמוד המוצר של Champo ב-App Store (במדיניות זו: „Champo”, „אנחנו” או „אנו”). לשאלות או בקשות בנושא פרטיות ניתן לפנות אל support@champoapp.com.',
          ],
        },
        {
          title: 'מידע שאנו אוספים',
          body: [
            'מידע חשבון: שם, כתובת אימייל, פרטי ספק התחברות ופרטי פרופיל בסיסיים שאתה מוסר בעת התחברות או ניהול החשבון.',
            'תוכן ליגות וניחושים: ליגות שאתה יוצר או מצטרף אליהן, כינויים, קודי הזמנה, ניחושים, ניקוד, דירוגים ופעילות קשורה באפליקציה.',
            'מדיה בפרופיל: תמונת פרופיל או תמונות אחרות שאתה בוחר להעלות. בורר התמונות של המערכת נפתח רק כאשר אתה בוחר להוסיף או לעדכן מדיה בפרופיל; Champo אינה מבקשת מראש גישה רחבה לספריית התמונות.',
            'נתוני מכשיר, אבחון ושימוש: גרסת אפליקציה, סוג מכשיר, מערכת הפעלה, דוחות קריסה, הודעות שגיאה ומחסניות קריאה, נתוני ניווט וביצועים ולוגים לצורכי אבטחה. אם תפעילו תזכורות למשחקים, אנו שומרים אסימון התראות Push עבור המכשיר שלכם כדי לשלוח תזכורות על משחקים קרובים. ניתן להשבית את התזכורות בכל עת בהגדרות, פעולה שמוחקת את האסימון.',
            'פניות תמיכה: הודעות, קבצים מצורפים ופרטי קשר שאתה שולח כאשר אתה מבקש עזרה.',
          ],
        },
        {
          title: 'כיצד אנו משתמשים במידע',
          body: [
            'כדי לספק את חוויית האפליקציה, כולל התחברות, יצירת ליגות, שליחת ניחושים, טבלאות דירוג, הצגת פרופיל וניהול חברים.',
            'כדי לשלוח הודעות תפעוליות כגון אימות דוא"ל, איפוס סיסמה, הודעות חשבון חשובות ותשובות לפניות תמיכה.',
            'כדי לאבטח את השירות, למנוע שימוש לרעה, לתקן תקלות, לשפר אמינות ולהבין כיצד משתמשים בתכונות המרכזיות.',
            'כדי לעמוד בדרישות חוק, בדרישות App Store ולאכוף את תנאי השירות שלנו.',
          ],
        },
        {
          title: 'שיתוף וספקי שירות',
          body: [
            'איננו מוכרים את המידע האישי שלך.',
            'אנו משתפים מידע רק עם ספקים שנדרשים להפעלת האפליקציה, כגון Supabase לאימות/מסד נתונים/אחסון, Google Cloud Vision לבדיקת בטיחות של תמונות פרופיל, Sentry לאבחון תקלות, וספקי התחברות כגון Apple או Google כאשר אתה בוחר בהם.',
            'Gemini ו-Tavily עשויים לשמש להכנת תצוגות מקדימות של משחקים בעזרת AI, על בסיס מידע כדורגל ציבורי. במימוש הנוכחי איננו שולחים אליהם פרטי חשבון, שמות, כתובות דוא"ל, תמונות פרופיל, חברות בליגות או ניחושים.',
            'ספקים אלה עשויים לעבד מידע מטעמנו ונדרשים להגן עליו בהתאם למדיניות זו ולחוק החל.',
            'אנו עשויים לחשוף מידע אם הדבר נדרש לפי דין, כדי להגן על זכויות ובטיחות, או כחלק מהעברה עסקית כגון מיזוג או רכישה.',
          ],
        },
        {
          title: 'בסיסים חוקיים לעיבוד (האזור הכלכלי האירופי ובריטניה)',
          body: [
            'אנו מעבדים פרטי חשבון, ליגה וניחושים ככל שנדרש כדי לספק את השירות ולקיים את החוזה איתך.',
            'אנו מעבדים נתוני אבחון מוגבלים, יומני אבטחה, מידע למניעת שימוש לרעה וניתוח שימוש בשירות מכוח האינטרסים הלגיטימיים שלנו לאבטח, לתחזק ולשפר את Champo, תוך איזון מול זכויותיך וציפיותיך.',
            'אנו מעבדים מידע כאשר הדבר נדרש לקיום חובה משפטית. כאשר הדין החל דורש הסכמה, לרבות עבור הרשאת מכשיר אופציונלית, ניתן למשוך אותה בכל עת בלי לפגוע בחוקיות העיבוד שבוצע קודם לכן.',
          ],
        },
        {
          title: 'בדיקת תמונות באמצעות Google Cloud Vision',
          body: [
            'כאשר אתה בוחר להעלות או להחליף תמונת פרופיל, התמונה נשלחת אל Google Cloud Vision לפני שמירתה. אנו משתמשים בזיהוי SafeSearch האוטומטי כדי להעריך אם התמונה כוללת תוכן למבוגרים, תוכן פרובוקטיבי, אלימות או תוכן רפואי. Champo משתמשת בדירוגי ההסתברות שמוחזרים כדי לאשר או לדחות את ההעלאה לפי כללי הקהילה שלנו.',
            'הבקשה ל-Vision כוללת את התמונה עצמה, אך אינה כוללת את השם שלך ב-Champo, כתובת האימייל, מזהה המשתמש, החברות בליגות או הניחושים שלך. לפי תיעוד השימוש בנתונים העדכני של Google Cloud Vision, תמונות שנשלחות דרך ה-API הסינכרוני שבו Champo משתמשת מעובדות בזיכרון ואינן נשמרות בדיסק; Google עשויה לשמור זמנית מטא-דאטה של הבקשה, כגון מועד וגודל הבקשה. Google מציינת שהתוכן שנשלח משמש רק לאספקת שירות Vision ואינו משמש לאימון מודלי Cloud Vision.',
            'בדיקה אוטומטית עלולה לטעות. אם תמונה נדחתה ולדעתך ההחלטה שגויה, ניתן לפנות אל support@champoapp.com. אין להעלות תמונה אם אינך רוצה שהיא תעובד על ידי Google Cloud Vision; ניתן להמשיך להשתמש ב-Champo ללא תמונת פרופיל.',
          ],
        },
        {
          title: 'אבחון תקלות באמצעות Sentry',
          body: [
            'בגרסאות המובייל של Champo בסביבת הייצור, Sentry מעבדת דוחות קריסה, הודעות שגיאה ומחסניות קריאה, פרטי גרסת האפליקציה, פרטי מכשיר ומערכת הפעלה, נתוני ניווט ודגימות ביצועים, והקשר טכני שנדרש לאבחון תקלות. פונקציות השרת של Champo עשויות לשלוח ל-Sentry גם סוג שגיאה, הודעה, מחסנית קריאה, שם פונקציה, מזהה בקשה וסטטוס תגובה.',
            'אנו משתמשים במידע זה כדי לזהות קריסות, לאבחן שגיאות, לנטר ביצועים, להגן על השירות ולשפר את אמינותו. Champo מגדירה את Sentry במובייל כך שלא יישלחו כברירת מחדל פרטים מזהים אישיים או צילומי מסך, ואינה מפעילה Sentry Session Replay. איננו שולחים במכוון שמות, כתובות אימייל, תמונות פרופיל, תוכן ליגות או ניחושים ל-Sentry, אך אירועי אבחון עשויים לכלול ערכים טכניים שהיו קיימים בזמן התקלה.',
            'Sentry מעבדת מידע אבחוני מטעמנו בהתאם להסדרי האבטחה, השמירה והעברת המידע הבינלאומית שלה. תקופת השמירה של אירועי הענן ב-Sentry נשלטת על ידי התוכנית והגדרות החשבון הפעילות. Champo מצמצמת אירועים לפני שליחתם באמצעות הסרת זהות משתמש, כותרות בקשה, cookies, תוכן בקשה, query strings ונתוני breadcrumbs.',
          ],
        },
        {
          title: 'שמירת מידע ומחיקה',
          body: [
            'מידע החשבון והפרופיל נשמר כל עוד החשבון פעיל. ניתן למחוק את החשבון דרך ההגדרות. לאחר מכן אנו מוחקים את חשבון, פרטי הפרופיל ותמונות הפרופיל, מבטלים הרשאת Sign in with Apple כאשר הדבר רלוונטי, ומנסים לבטל הרשאת Google מחוברת במכשירים נתמכים.',
            'ניחושים וניקוד מהעבר, ורשומת החבר המינימלית שנדרשת לשמירת הדירוג, נשמרים כל עוד נשמרת היסטוריית הליגה הקשורה או שהשירות פעיל. הם עוברים הסרת זיהוי: מזהה המשתמש, תמונת הפרופיל והכינוי האישי מוסרים, והם מוצגים בשם „שחקן שנמחק”.',
            'גרסה 1.0 של Champo חינמית, אינה אוספת היסטוריית רכישות ואינה מציעה מנויים, שדרוגים בתשלום או קישורי רכישה חיצוניים.',
            'רשומות תפעוליות שבשליטת Champo נמחקות אוטומטית לפי לוח הזמנים הבא: רשומות audit של ההתחברות לאחר 90 יום; לוג קריאות לספק הכדורגל לאחר 31 יום; היסטוריית הרצות המתזמן לאחר 30 יום; וסיכומי שימוש חודשיים בבדיקת תמונות לאחר 14 חודשים. קובצי תמונת פרופיל שאינם מקושרים נמחקים לאחר חלון ביטחון של 7 ימים.',
            'דיווח תוכן נשמר כל עוד הוא ממתין לבדיקה. דיווח שטופל או נדחה, כולל ראיות הבדיקה, נמחק 24 חודשים לאחר הבדיקה. דיווחים שבהם חשבון שנמחק הוא המדווח או המשתמש שעליו דווח נמחקים כחלק ממחיקת החשבון. ראיית ההסכמה למסמכים המשפטיים נשמרת למשך חיי החשבון ונמחקת עם חשבון ההתחברות.',
            'פרויקט Supabase הנוכחי בתוכנית Free אינו כולל גיבויי מסד נתונים אוטומטיים. אם יופעלו בעתיד גיבויי מסד נתונים או גיבויים חיצוניים, Champo תצפין אותם, תגביל גישה ותגדיר תפוגה מרבית של 14 יום; לכן מידע שנמחק עשוי להישאר בגיבוי רק עד פקיעתו. גיבויי מסד הנתונים של Supabase אינם כוללים את קובצי תמונות הפרופיל שבאחסון.',
            'Google Cloud Vision אינה שומרת את תוכן התמונה הסינכרוני במנוחה, כמפורט לעיל. שמירת אירועי ענן ב-Sentry, מטא-דאטה של בקשות Google ולוגים אחרים שבשליטת ספקים נקבעת לפי הגדרות חשבון, ההסכם וחובות המשפטיות. פניות תמיכה נשמרות רק כל עוד הדבר נדרש באופן סביר לטיפול בפנייה ולעמידה בחובות אבטחה או דין.',
            'ניתן לבקש גישה, תיקון, ייצוא או מחיקה של המידע האישי שלך באמצעות פנייה אל support@champoapp.com. מידע מוגבל עשוי להישמר כאשר הדבר נדרש לפי דין או לצורכי אבטחה ומניעת הונאה.',
          ],
        },
        {
          title: 'הבחירות שלך',
          body: [
            'ניתן לעדכן פרטי פרופיל באפליקציה במקומות שבהם הדבר נתמך.',
            'ניתן להפעיל תזכורות למשחקים לאחר הצגת הסבר באפליקציה. אפשר לשנות את הרשאת ההתראות בכל עת בהגדרות המכשיר.',
            'כאשר נדרשת הסכמה, ניתן למשוך אותה באמצעות שינוי הרשאות מכשיר, הגדרות באפליקציה או פנייה אלינו.',
          ],
        },
        {
          title: 'ילדים',
          body: [
            'Champo אינה מיועדת לילדים מתחת לגיל 13. איננו אוספים ביודעין מידע אישי מילדים מתחת לגיל 13. אם לדעתך ילד מסר מידע אישי, פנה אלינו ונפעל למחיקתו לפי הצורך.',
          ],
        },
        {
          title: 'אבטחה ועיבוד בינלאומי',
          body: [
            'אנו משתמשים באמצעים טכניים וארגוניים סבירים להגנה על מידע, אך אין מערכת שניתן להבטיח שהיא מאובטחת לחלוטין.',
            'המידע שלך עשוי להיות מעובד במדינות אחרות מזו שבה אתה מתגורר. במקרים כאלה אנו מסתמכים על אמצעי הגנה מתאימים לפי החוק החל.',
          ],
        },
        {
          title: 'שינויים במדיניות',
          body: [
            'אנו עשויים לעדכן מדיניות זו כדי לשקף שינויים במוצר, בדרישות משפטיות או בתפעול. אם השינויים מהותיים, נמסור הודעה באפליקציה או בדרך סבירה אחרת.',
          ],
        },
        {
          title: 'יצירת קשר',
          body: ['לשאלות פרטיות או בקשות מידע, ניתן לפנות אל support@champoapp.com.'],
        },
      ],
      footer: 'לשאלות פרטיות ובקשות מידע: support@champoapp.com',
    },
    terms: {
      title: 'תנאי שימוש',
      updatedAt: 'עודכן לאחרונה: 26 באוגוסט 2026',
      intro:
        'תנאי שימוש אלה מסדירים את השימוש שלך ב-Champo. יצירת חשבון, הצטרפות לליגה, שליחת ניחושים או שימוש אחר באפליקציה מהווים הסכמה לתנאים אלה.',
      sections: [
        {
          title: 'כשירות וחשבונות',
          body: [
            'עליך להיות בן 13 לפחות כדי להשתמש ב-Champo.',
            'אתה אחראי לשמירה על פרטי ההתחברות שלך ולפעילות שמתבצעת בחשבונך.',
            'אתה מסכים למסור פרטי חשבון מדויקים ולעדכן אותם לפי הצורך.',
          ],
        },
        {
          title: 'שימוש באפליקציה',
          body: [
            'Champo מאפשרת ליצור או להצטרף לליגות ניחושי כדורגל, להזמין חברים, לשלוח ניחושי תוצאה, לצפות בדירוגים ולעקוב אחר משחקים וטבלאות.',
            'אין לעשות שימוש לרעה באפליקציה, להפריע לפעולתה, לנסות גישה לא מורשית, לגרד נתונים, לבצע הנדסה לאחור לחלקים מוגנים של השירות או להשתמש בה לפעילות בלתי חוקית.',
            'אתה אחראי לתוכן שאתה מוסר, כולל שמות ליגות, כינויים, תמונות פרופיל וניחושים. אין לשלוח תוכן בלתי חוקי, פוגעני, מפר זכויות, מטעה או מזיק.',
            'Champo רשאית להפעיל מסנני טקסט אוטומטיים, לקבל דיווחים, להגביל תצוגה, להסיר תוכן או חברים ולהשעות חשבונות כדי להגן על המשתמשים. ניתן לדווח על תוכן פוגעני ולחסום משתמשים ממסכי הפרופיל או הליגה הרלוונטיים.',
            'הבעלות בתוכן שמסרת נשארת שלך. אתה מעניק ל-Champo רישיון מוגבל ולא בלעדי לאחסן, להציג, לעבד ולמתן את התוכן רק ככל שנדרש להפעלה, לאבטחה ולשיפור השירות. הרישיון מסתיים עם מחיקת התוכן, למעט היסטוריית ליגה שעברה הסרת זיהוי כמתואר במדיניות הפרטיות.',
          ],
        },
        {
          title: 'תוכן פוגעני וכללי קהילה',
          body: [
            'ל-Champo יש אפס סובלנות לתוכן פוגעני ולהתנהגות פוגענית. הדבר חל על כל מה שאתה מעלה או מוסר, כולל תמונות פרופיל, שמות ליגות, כינויים וכל תוכן אחר שנוצר על ידי משתמשים.',
            'אין להעלות, לפרסם או לשתף תוכן שהוא: מיני מפורש, פורנוגרפי או עירום; מציג או מקדם אלימות, פגיעה עצמית, טרור או פעילות בלתי חוקית; מבטא שנאה, הטרדה, איום או אפליה כלפי אדם או קבוצה; מפר קניין רוחני, פרטיות או זכויות פרסום של אחר; מתחזה לאדם או לארגון אחר; או בלתי חוקי, מטעה או מזיק בדרך אחרת.',
            'אין להשתמש בתמונה של אדם אחר, בתמונת דמות ציבורית או ביצירה המוגנת בזכויות יוצרים כתמונת פרופיל ללא הרשאה לכך.',
            'כדי לשמור על קהילה בטוחה, Champo רשאית לבדוק או למתן תמונות וטקסט שהועלו, באופן אוטומטי או ידני, ורשאית לדחות, לטשטש, להסיר או להחליף תוכן שמפר כללים אלה, עם או בלי הודעה מוקדמת.',
            'כל חבר יכול לדווח על תוכן פוגעני או על משתמש פוגעני, ולחסום משתמש, ממסך הפרופיל או הליגה הרלוונטי. ניתן גם לשלוח דיווחים אל support@champoapp.com.',
            'אנו שואפים לבחון דיווחים ולהסיר תוכן מפר, ולהסיר או להשעות את המשתמשים האחראים, בתוך 24 שעות מקבלת דיווח תקף. הפרות חמורות עלולות להוביל להסרה מיידית וקבועה מהשירות, ולהיות מדווחות לרשויות המוסמכות כאשר הדבר נדרש לפי דין.',
          ],
        },
        {
          title: 'ניחושים ונתוני כדורגל',
          body: [
            'הניחושים מיועדים לבידור ולתחרות חברתית. Champo אינה מספקת הימורים, פעילות גיימבלינג, ייעוץ פיננסי או תוצאות משחק מובטחות.',
            'משחקים, תוצאות, אירועים, טבלאות, מידע קבוצות ונתוני כדורגל קשורים עשויים להגיע ממקורות צד שלישי ועלולים להיות באיחור, חלקיים או לא מדויקים.',
            'נתוני הכדורגל מסופקים על ידי Football-Data.org API. ‏Champo היא מוצר עצמאי ואינה מסונפת, מאושרת או ממומנת על ידי FIFA, ‏UEFA, ליגה, תחרות, מועדון או קבוצה כלשהם. שמות ומזהים אחרים נותרים קניינם של בעליהם.',
            'אנו עשויים לתקן ניקוד, דירוגים או נתוני משחק כאשר מתגלות שגיאות.',
          ],
        },
        {
          title: 'גישה חינמית',
          body: [
            'גרסה 1.0 של Champo חינמית ואינה כוללת רכישות בתוך האפליקציה, מנויים, שדרוגים בתשלום או קישורי רכישה חיצוניים.',
            'כל תכונה שמוצגת בגרסה זו זמינה ללא תשלום.',
            'אם יוצעו בעתיד תכונות בתשלום, נעדכן את התנאים ונציג את המחיר והתנאים לפני כל רכישה.',
          ],
        },
        {
          title: 'פרטיות',
          body: [
            'מדיניות הפרטיות שלנו מסבירה כיצד אנו אוספים, משתמשים, משתפים, שומרים ומוחקים מידע. בשימוש באפליקציה אתה מאשר שהמידע יטופל כפי שמתואר במדיניות זו.',
          ],
        },
        {
          title: 'שירותי צד שלישי',
          body: [
            'האפליקציה עשויה להסתמך על שירותי צד שלישי כגון Apple, Google, Google Cloud Vision, Supabase, Sentry, Gemini, Tavily, שירותי התראות וספקי נתוני ספורט. השימוש בשירותים אלה עשוי להיות כפוף גם לתנאים ולמדיניות שלהם.',
          ],
        },
        {
          title: 'השעיה וסיום',
          body: [
            'אנו עשויים להשעות או לסיים גישה אם תפר תנאים אלה, תיצור סיכון למשתמשים אחרים או לשירות, או אם נידרש לכך לפי דין.',
            'ניתן להפסיק להשתמש באפליקציה בכל עת. רשומות מסוימות עשויות להישמר כפי שמתואר במדיניות הפרטיות.',
          ],
        },
        {
          title: 'הסתייגויות ואחריות',
          body: [
            'האפליקציה מסופקת כפי שהיא וכפי שהיא זמינה. איננו מתחייבים לשירות רציף, לנתונים ללא שגיאות או לכך שכל תכונה תישאר זמינה.',
            'במידה המרבית המותרת לפי דין, לא נהיה אחראים לנזקים עקיפים, מקריים, מיוחדים, תוצאתיים או עונשיים, או להפסדים שנגרמו עקב נתוני ספורט לא מדויקים, הפסקות שירות או תוכן שנשלח על ידי משתמשים.',
          ],
        },
        {
          title: 'תנאי Apple',
          body: [
            'למשתמשי iOS, השימוש באפליקציה כפוף גם לתנאי Apple Media Services ולתנאי הרישיון הרלוונטיים של App Store. אם קיימת סתירה בין תנאים אלה לבין תנאי Apple המחייבים להפצה דרך App Store, תנאי Apple יחולו במקומות שבהם הדבר נדרש.',
          ],
        },
        {
          title: 'תנאים משפטיים כלליים',
          body: [
            'תנאים אלה משלימים את תנאי הרישיון הסטנדרטיים של Apple App Store. זכויות צרכניות מחייבות במדינתך אינן מוגבלות על ידי תנאים אלה.',
            'אם הוראה כלשהי תימצא בלתי אכיפה, יתר ההוראות ימשיכו לעמוד בתוקף. הימנעות מאכיפת הוראה אינה ויתור על הזכות לאכוף אותה בעתיד.',
            'על תנאים אלה יחול הדין החל על מפעיל Champo במקום פעילותו, למעט כאשר דין צרכני מקומי מחייב מעניק לך זכויות נוספות או מחייב פורום אחר.',
          ],
        },
        {
          title: 'שינויים ויצירת קשר',
          body: [
            'אנו עשויים לעדכן תנאים אלה מעת לעת. המשך שימוש לאחר מועד התחילה של תנאים מעודכנים מהווה הסכמה לתנאים המעודכנים.',
            'לשאלות לגבי תנאים אלה, ניתן לפנות אל support@champoapp.com.',
          ],
        },
      ],
      footer: 'לשאלות לגבי התנאים: support@champoapp.com',
    },
    accessibility: {
      title: 'הצהרת נגישות',
      updatedAt: 'נבדק לאחרונה: 26 באוגוסט 2026',
      intro:
        'Champo מחויבת להפוך את חוויית המובייל המקורית שלה לשימושית עבור אנשים רבים ככל האפשר, לרבות אנשים המשתמשים בטכנולוגיות מסייעות. נגישות היא אחריות מוצר מתמשכת מבחינתנו.',
      sections: [
        {
          title: 'גישת הנגישות שלנו',
          body: [
            'אנו שואפים לפעול לפי העקרונות הרלוונטיים בתקן הישראלי ת״י 5568, בתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), ובהנחיות WCAG 2.2 ברמה AA, תוך יישום הנחיות הנגישות המקוריות של Apple ושל Android.',
            'הצהרה זו מתארת בדיקת קוד ובדיקות אוטומטיות פנימיות. היא אינה אישור של מורשה נגישות חיצוני ואינה טוענת שכל מסך או שילוב מכשיר חפים לחלוטין מחסמי נגישות.',
          ],
        },
        {
          title: 'התאמות נגישות באפליקציה',
          body: [
            'תמיכה ב-VoiceOver ב-iOS וב-TalkBack ב-Android באמצעות תוויות, תפקידים ומצבי בחירה, השבתה וטעינה מקוריים, וכן כותרות, לשוניות, מתגים, תיבות סימון והקראה של הודעות שגיאה.',
            'הגדלת טקסט מופעלת במערכת הטיפוגרפיה המשותפת עד 200%, והממשק תומך באנגלית ובעברית, לרבות פריסה מימין לשמאל.',
            'רכיבי השליטה המשותפים כוללים אזורי מגע נגישים, תוויות טקסט גלויות, ערכות עיצוב בהירה וכהה וצבעים סמנטיים ששילובי הטקסט המרכזיים שלהם נבדקים אוטומטית לניגודיות WCAG AA.',
            'פעולות חשובות אינן מסתמכות רק על צבע או סמל, ושדות טופס חושפים לטכנולוגיות מסייעות תוויות, רמזים, הודעות אימות והתנהגות קלט מתאימה.',
          ],
        },
        {
          title: 'היקף הבדיקה',
          body: [
            'הבדיקה הפנימית האחרונה כללה את הניווט המקורי ומסכי ההגדרות, כפתורים, קישורים, כרטיסים, לשוניות, חלונות דו-שיח ושדות טופס משותפים, בקרי משחקים וליגות, בקרי התחברות, התנהגות טקסט מוגדל, פריסה עברית מימין לשמאל וניגודיות הצבעים הסמנטיים בערכות בהירה וכהה.',
            'הבדיקה כללה סקירה סטטית של רכיבי מגע מותאמים, בדיקות נגישות אוטומטיות ברכיבים, lint, בדיקת TypeScript, הרצת חבילת הבדיקות המלאה ובדיקת עץ הנגישות וגודל הטקסט המרבי במסך הכניסה הציבורי בסימולטור iOS. בדיקה ידנית בגרסאות עדכניות של VoiceOver ושל TalkBack ממשיכה להיות חלק מתהליך אימות הגרסאות.',
          ],
        },
        {
          title: 'מגבלות ידועות',
          body: [
            'טבלאות כדורגל צפופות, תרשימי שלבי נוקאאוט, ממשקי התחברות או רכישה של צדדים שלישיים ותוכן שמתקבל מספקים חיצוניים עשויים להיות פחות נוחים בשימוש עם טקסט גדול מאוד או בשילובים מסוימים של טכנולוגיות מסייעות.',
            'אנו ממשיכים לבדוק אזורים אלה ומתעדפים תיקונים שחוסמים ניווט, הבנה או השלמה של פעולות מרכזיות.',
          ],
        },
        {
          title: 'פניות בנושא נגישות',
          body: [
            'אם נתקלתם בחסם נגישות, ניתן לפנות אל support@champoapp.com. מומלץ לציין את המסך או הפעולה, סוג המכשיר וגרסת מערכת ההפעלה, הטכנולוגיה המסייעת שבה השתמשתם ותיאור קצר של הבעיה.',
            'אנו נבחן פניות נגישות ונעשה מאמץ סביר לספק חלופה נגישה ולתקן בעיות שאומתו בהקדם האפשרי.',
          ],
        },
      ],
      footer: 'לפניות בנושא נגישות: support@champoapp.com',
    },
  },
};
