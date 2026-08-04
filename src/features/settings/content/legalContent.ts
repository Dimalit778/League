import { SupportedLanguage } from '@/store/LanguageStore';

export type LegalSection = {
  title: string;
  body: string[];
};

type LegalDocument = {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
  footer: string;
};

export const legalContent: Record<SupportedLanguage, { privacy: LegalDocument; terms: LegalDocument }> = {
  en: {
    privacy: {
      title: 'Privacy Policy',
      updatedAt: 'Last updated: August 4, 2026',
      intro:
        'Champo is a football prediction app for creating leagues, joining friends, submitting predictions, viewing rankings, and managing subscriptions. This policy explains what information we collect, how we use it, and the choices available to you.',
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
            'Subscription information: subscription status, product identifiers, purchase or renewal status, and receipt-related metadata processed through Apple and RevenueCat. We do not receive your full payment card details.',
            'Device, diagnostics, and usage data: app version, device type, operating system, crash reports, performance data, and security logs. Crash and session diagnostics may be collected through Sentry with text and images masked in replays. Match reminders are scheduled locally on your device; Champo does not currently collect push notification tokens.',
            'Support communications: messages, attachments, and contact details you send when requesting help.',
          ],
        },
        {
          title: 'How We Use Information',
          body: [
            'To provide the app experience, including authentication, league creation, prediction submission, standings, profile display, and member management.',
            'To operate subscriptions, restore purchases, enforce plan limits, and provide access to paid features.',
            'To send transactional messages such as email verification, password reset messages, important account notices, and replies to support requests.',
            'To secure the service, prevent abuse, debug errors, improve reliability, and understand how core features are used.',
            'To comply with legal obligations, App Store requirements, and enforce our Terms of Service.',
          ],
        },
        {
          title: 'Sharing and Service Providers',
          body: [
            'We do not sell your personal information.',
            'We share information only with providers needed to run the app, such as Supabase for authentication/database/storage, Apple and RevenueCat for in-app purchases, Sentry for diagnostics, and authentication providers such as Apple or Google when you choose those sign-in methods.',
            'Gemini and Tavily may be used to prepare AI-assisted match previews from public football information. The current implementation does not send account details, names, email addresses, profile images, league memberships, or predictions to these services.',
            'These providers may process information on our behalf and must protect it consistently with this policy and applicable law.',
            'We may disclose information if required by law, to protect rights and safety, or as part of a business transfer such as a merger or acquisition.',
          ],
        },
        {
          title: 'Data Retention and Deletion',
          body: [
            'Account and profile information is retained while your account is active. You can delete your account in Settings. We then delete your authentication account, profile details and profile images, remove the customer record held for us by RevenueCat, revoke Sign in with Apple authorization when applicable, and attempt to revoke a connected Google sign-in grant on supported devices.',
            'Past predictions, points, and the minimum league-member record needed to preserve standings are retained for as long as the related league history or service is maintained. They are de-identified by removing the user ID, profile image, and personal nickname; appear as “Deleted Player”; and cannot be used to identify or sign in to your former account.',
            'Deleting your Champo account does not cancel an Apple subscription. You must cancel it separately in your Apple Account subscription settings. Apple may retain transaction records under its own policy and legal obligations.',
            'Support communications are retained only as long as reasonably needed to resolve the request and meet security or legal obligations. Diagnostic, purchase, and transaction records are retained according to our configured provider retention periods and applicable legal requirements.',
            'You can request access, correction, export, or deletion of your personal data by contacting support@champoapp.com. Limited records may still be retained when required by law, security, billing, or fraud-prevention obligations.',
          ],
        },
        {
          title: 'Your Choices',
          body: [
            'You can update profile details in the app where supported.',
            'You may optionally enable local match reminders after reviewing an in-app explanation. You can change notification permission at any time in your device settings.',
            'You can manage or cancel Apple subscriptions from your Apple Account subscription settings.',
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
      updatedAt: 'Last updated: August 4, 2026',
      intro:
        'These Terms of Service govern your use of Champo. By creating an account, joining a league, submitting predictions, purchasing a subscription, or otherwise using the app, you agree to these terms.',
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
          title: 'Predictions and Football Data',
          body: [
            'Predictions are for entertainment and social competition. Champo does not provide betting, gambling, financial advice, or guaranteed match outcomes.',
            'Fixtures, scores, events, standings, team information, and related football data may come from third-party sources and may be delayed, incomplete, or inaccurate.',
            'We may correct scoring, rankings, or match data when errors are detected.',
          ],
        },
        {
          title: 'Subscriptions and Payments',
          body: [
            'Paid features may be offered through auto-renewable in-app subscriptions. Subscription details, price, duration, and renewal terms are shown before purchase.',
            'Purchases on iOS are processed by Apple through your Apple Account. Apple handles payment processing and may manage refunds according to Apple Media Services terms and App Store policies.',
            'Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period. You can manage or cancel subscriptions from your Apple Account subscription settings.',
            'If a payment cannot be completed, paid features may be unavailable until the subscription is restored or renewed.',
            'We may change free or paid features, plan limits, or pricing prospectively, subject to applicable law and App Store rules.',
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
            'The app may rely on third-party services such as Apple, Google, Supabase, RevenueCat, Sentry, Gemini, Tavily, notification services, and sports data providers. Your use of those services may also be governed by their own terms and policies.',
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
  },
  he: {
    privacy: {
      title: 'מדיניות פרטיות',
      updatedAt: 'עודכן לאחרונה: 4 באוגוסט 2026',
      intro:
        'Champo היא אפליקציית ניחושי כדורגל ליצירת ליגות, הצטרפות לחברים, שליחת ניחושים, צפייה בדירוגים וניהול מנויים. מדיניות זו מסבירה איזה מידע אנו אוספים, כיצד אנו משתמשים בו, ומהן הבחירות שעומדות לרשותך.',
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
            'מידע מנוי: סטטוס מנוי, מזהי מוצרים, סטטוס רכישה או חידוש ומטא-דאטה שקשור לקבלות, דרך Apple ו-RevenueCat. איננו מקבלים את פרטי כרטיס האשראי המלאים שלך.',
            'נתוני מכשיר, אבחון ושימוש: גרסת אפליקציה, סוג מכשיר, מערכת הפעלה, דוחות קריסה, נתוני ביצועים ולוגים לצורכי אבטחה. אבחון קריסות וסשנים עשוי להיאסף דרך Sentry עם הסתרת טקסט ותמונות. תזכורות למשחקים מתוזמנות מקומית במכשיר; Champo אינה אוספת כרגע אסימוני התראות Push.',
            'פניות תמיכה: הודעות, קבצים מצורפים ופרטי קשר שאתה שולח כאשר אתה מבקש עזרה.',
          ],
        },
        {
          title: 'כיצד אנו משתמשים במידע',
          body: [
            'כדי לספק את חוויית האפליקציה, כולל התחברות, יצירת ליגות, שליחת ניחושים, טבלאות דירוג, הצגת פרופיל וניהול חברים.',
            'כדי להפעיל מנויים, לשחזר רכישות, לאכוף מגבלות תוכנית ולספק גישה לתכונות בתשלום.',
            'כדי לשלוח הודעות תפעוליות כגון אימות דוא"ל, איפוס סיסמה, הודעות חשבון חשובות ותשובות לפניות תמיכה.',
            'כדי לאבטח את השירות, למנוע שימוש לרעה, לתקן תקלות, לשפר אמינות ולהבין כיצד משתמשים בתכונות המרכזיות.',
            'כדי לעמוד בדרישות חוק, בדרישות App Store ולאכוף את תנאי השירות שלנו.',
          ],
        },
        {
          title: 'שיתוף וספקי שירות',
          body: [
            'איננו מוכרים את המידע האישי שלך.',
            'אנו משתפים מידע רק עם ספקים שנדרשים להפעלת האפליקציה, כגון Supabase לאימות/מסד נתונים/אחסון, Apple ו-RevenueCat לרכישות בתוך האפליקציה, Sentry לאבחון תקלות, וספקי התחברות כגון Apple או Google כאשר אתה בוחר בהם.',
            'Gemini ו-Tavily עשויים לשמש להכנת תצוגות מקדימות של משחקים בעזרת AI, על בסיס מידע כדורגל ציבורי. במימוש הנוכחי איננו שולחים אליהם פרטי חשבון, שמות, כתובות דוא"ל, תמונות פרופיל, חברות בליגות או ניחושים.',
            'ספקים אלה עשויים לעבד מידע מטעמנו ונדרשים להגן עליו בהתאם למדיניות זו ולחוק החל.',
            'אנו עשויים לחשוף מידע אם הדבר נדרש לפי דין, כדי להגן על זכויות ובטיחות, או כחלק מהעברה עסקית כגון מיזוג או רכישה.',
          ],
        },
        {
          title: 'שמירת מידע ומחיקה',
          body: [
            'מידע החשבון והפרופיל נשמר כל עוד החשבון פעיל. ניתן למחוק את החשבון דרך ההגדרות. לאחר מכן אנו מוחקים את חשבון ההתחברות, פרטי הפרופיל ותמונות הפרופיל, מסירים את רשומת הלקוח ב-RevenueCat, מבטלים הרשאת Sign in with Apple כאשר הדבר רלוונטי, ומנסים לבטל הרשאת Google מחוברת במכשירים נתמכים.',
            'ניחושים וניקוד מהעבר, ורשומת החבר המינימלית שנדרשת לשמירת הדירוג, נשמרים כל עוד נשמרת היסטוריית הליגה הקשורה או שהשירות פעיל. הם עוברים הסרת זיהוי: מזהה המשתמש, תמונת הפרופיל והכינוי האישי מוסרים, והם מוצגים בשם „שחקן שנמחק”.',
            'מחיקת חשבון Champo אינה מבטלת מנוי Apple. יש לבטל אותו בנפרד בהגדרות המנויים בחשבון Apple. ‏Apple עשויה לשמור רשומות עסקה לפי המדיניות והחובות המשפטיות שלה.',
            'פניות תמיכה נשמרות רק כל עוד הדבר נדרש באופן סביר לטיפול בפנייה ולעמידה בחובות אבטחה או דין. נתוני אבחון, רכישה ועסקאות נשמרים לפי תקופות השמירה שהוגדרו אצל הספקים ולפי דרישות הדין.',
            'ניתן לבקש גישה, תיקון, ייצוא או מחיקה של המידע האישי שלך באמצעות פנייה אל support@champoapp.com. מידע מוגבל עשוי להישמר כאשר הדבר נדרש לפי דין או לצורכי אבטחה, חיוב ומניעת הונאה.',
          ],
        },
        {
          title: 'הבחירות שלך',
          body: [
            'ניתן לעדכן פרטי פרופיל באפליקציה במקומות שבהם הדבר נתמך.',
            'ניתן להפעיל תזכורות מקומיות למשחקים לאחר הצגת הסבר באפליקציה. אפשר לשנות את הרשאת ההתראות בכל עת בהגדרות המכשיר.',
            'ניתן לנהל או לבטל מנויי Apple דרך הגדרות המנויים בחשבון Apple שלך.',
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
      updatedAt: 'עודכן לאחרונה: 4 באוגוסט 2026',
      intro:
        'תנאי שימוש אלה מסדירים את השימוש שלך ב-Champo. יצירת חשבון, הצטרפות לליגה, שליחת ניחושים, רכישת מנוי או שימוש אחר באפליקציה מהווים הסכמה לתנאים אלה.',
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
          title: 'ניחושים ונתוני כדורגל',
          body: [
            'הניחושים מיועדים לבידור ולתחרות חברתית. Champo אינה מספקת הימורים, פעילות גיימבלינג, ייעוץ פיננסי או תוצאות משחק מובטחות.',
            'משחקים, תוצאות, אירועים, טבלאות, מידע קבוצות ונתוני כדורגל קשורים עשויים להגיע ממקורות צד שלישי ועלולים להיות באיחור, חלקיים או לא מדויקים.',
            'אנו עשויים לתקן ניקוד, דירוגים או נתוני משחק כאשר מתגלות שגיאות.',
          ],
        },
        {
          title: 'מנויים ותשלומים',
          body: [
            'תכונות בתשלום עשויות להיות מוצעות דרך מנויים מתחדשים בתוך האפליקציה. פרטי המנוי, המחיר, התקופה ותנאי החידוש מוצגים לפני הרכישה.',
            'רכישות ב-iOS מעובדות על ידי Apple דרך חשבון Apple שלך. Apple מטפלת בעיבוד התשלום ועשויה לנהל החזרים לפי תנאי Apple Media Services ומדיניות App Store.',
            'מנויים מתחדשים אוטומטית אלא אם הם מבוטלים לפחות 24 שעות לפני סוף התקופה הנוכחית. ניתן לנהל או לבטל מנויים דרך הגדרות המנויים בחשבון Apple שלך.',
            'אם תשלום אינו מושלם, תכונות בתשלום עשויות שלא להיות זמינות עד לשחזור או חידוש המנוי.',
            'אנו עשויים לשנות תכונות חינמיות או בתשלום, מגבלות תוכנית או תמחור באופן עתידי, בכפוף לחוק החל ולכללי App Store.',
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
            'האפליקציה עשויה להסתמך על שירותי צד שלישי כגון Apple, Google, Supabase, RevenueCat, Sentry, Gemini, Tavily, שירותי התראות וספקי נתוני ספורט. השימוש בשירותים אלה עשוי להיות כפוף גם לתנאים ולמדיניות שלהם.',
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
  },
};
