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
      updatedAt: 'Last updated: May 25, 2026',
      intro:
        'League Champion is a football prediction app for creating leagues, joining friends, submitting predictions, viewing rankings, and managing subscriptions. This policy explains what information we collect, how we use it, and the choices available to you.',
      sections: [
        {
          title: 'Information We Collect',
          body: [
            'Account information: name, email address, authentication provider details, and basic profile details you provide when signing in or managing your account.',
            'League and prediction content: leagues you create or join, nicknames, invite codes, predictions, scores, rankings, and related in-app activity.',
            'Profile media: avatar images or other photos you choose to upload. Photo library access is requested only when you choose to add or update profile media.',
            'Subscription information: subscription status, product identifiers, purchase or renewal status, and receipt-related metadata processed through Apple and RevenueCat. We do not receive your full payment card details.',
            'Device, diagnostics, and usage data: app version, device type, operating system, crash reports, performance data, notification tokens, and security logs. Crash and session diagnostics may be collected through Sentry with text and images masked in replays.',
            'Support communications: messages, attachments, and contact details you send when requesting help.',
          ],
        },
        {
          title: 'How We Use Information',
          body: [
            'To provide the app experience, including authentication, league creation, prediction submission, standings, profile display, and member management.',
            'To operate subscriptions, restore purchases, enforce plan limits, and provide access to paid features.',
            'To send service messages such as account notices, league updates, match reminders, subscription updates, and support responses.',
            'To secure the service, prevent abuse, debug errors, improve reliability, and understand how core features are used.',
            'To comply with legal obligations, App Store requirements, and enforce our Terms of Service.',
          ],
        },
        {
          title: 'Sharing and Service Providers',
          body: [
            'We do not sell your personal information.',
            'We share information only with providers needed to run the app, such as Supabase for authentication/database/storage, Apple and RevenueCat for in-app purchases, Sentry for diagnostics, notification services, and authentication providers such as Apple or Google when you choose those sign-in methods.',
            'These providers may process information on our behalf and must protect it consistently with this policy and applicable law.',
            'We may disclose information if required by law, to protect rights and safety, or as part of a business transfer such as a merger or acquisition.',
          ],
        },
        {
          title: 'Data Retention and Deletion',
          body: [
            'We keep account, league, prediction, and subscription records for as long as needed to provide the service, maintain league history, meet legal obligations, resolve disputes, and prevent abuse.',
            'You can request access, correction, export, or deletion of your personal data by contacting support@leaguechampion.app.',
            'After a deletion request, we delete or anonymize personal data unless retention is required for legal, security, billing, fraud-prevention, or legitimate operational reasons.',
          ],
        },
        {
          title: 'Your Choices',
          body: [
            'You can update profile details in the app where supported.',
            'You can manage push notifications from your device settings.',
            'You can manage or cancel Apple subscriptions from your Apple Account subscription settings.',
            'Where consent is required, you may withdraw it by changing device permissions, app settings, or contacting us.',
          ],
        },
        {
          title: 'Children',
          body: [
            'League Champion is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe a child provided personal information, contact us and we will take appropriate steps to delete it.',
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
          body: ['For privacy questions or data requests, contact support@leaguechampion.app.'],
        },
      ],
      footer:
        'This policy is intended to support App Store review requirements and user transparency. It is not legal advice.',
    },
    terms: {
      title: 'Terms of Service',
      updatedAt: 'Last updated: May 25, 2026',
      intro:
        'These Terms of Service govern your use of League Champion. By creating an account, joining a league, submitting predictions, purchasing a subscription, or otherwise using the app, you agree to these terms.',
      sections: [
        {
          title: 'Eligibility and Accounts',
          body: [
            'You must be at least 13 years old to use League Champion.',
            'You are responsible for keeping your account credentials secure and for activity that occurs under your account.',
            'You agree to provide accurate account information and to keep it up to date.',
          ],
        },
        {
          title: 'App Use',
          body: [
            'League Champion lets users create or join football prediction leagues, invite members, submit score predictions, view rankings, and follow football fixtures and standings.',
            'You may not misuse the app, interfere with its operation, attempt unauthorized access, scrape data, reverse engineer protected parts of the service, or use the app for unlawful activity.',
            'You are responsible for content you submit, including league names, nicknames, profile images, and predictions. Do not submit content that is illegal, abusive, infringing, misleading, or harmful.',
          ],
        },
        {
          title: 'Predictions and Football Data',
          body: [
            'Predictions are for entertainment and social competition. League Champion does not provide betting, gambling, financial advice, or guaranteed match outcomes.',
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
            'The app may rely on third-party services such as Apple, Google, Supabase, RevenueCat, Sentry, notification services, and sports data providers. Your use of those services may also be governed by their own terms and policies.',
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
          title: 'Changes and Contact',
          body: [
            'We may update these terms from time to time. Continued use after the effective date of updated terms means you accept the updated terms.',
            'For questions about these terms, contact support@leaguechampion.app.',
          ],
        },
      ],
      footer: 'These terms are intended for product transparency and App Store compliance. They are not legal advice.',
    },
  },
  he: {
    privacy: {
      title: 'מדיניות פרטיות',
      updatedAt: 'עודכן לאחרונה: 25 במאי 2026',
      intro:
        'League Champion היא אפליקציית ניחושי כדורגל ליצירת ליגות, הצטרפות לחברים, שליחת ניחושים, צפייה בדירוגים וניהול מנויים. מדיניות זו מסבירה איזה מידע אנו אוספים, כיצד אנו משתמשים בו, ומהן הבחירות שעומדות לרשותך.',
      sections: [
        {
          title: 'מידע שאנו אוספים',
          body: [
            'מידע חשבון: שם, כתובת אימייל, פרטי ספק התחברות ופרטי פרופיל בסיסיים שאתה מוסר בעת התחברות או ניהול החשבון.',
            'תוכן ליגות וניחושים: ליגות שאתה יוצר או מצטרף אליהן, כינויים, קודי הזמנה, ניחושים, ניקוד, דירוגים ופעילות קשורה באפליקציה.',
            'מדיה בפרופיל: תמונת פרופיל או תמונות אחרות שאתה בוחר להעלות. גישה לספריית התמונות מתבקשת רק כאשר אתה בוחר להוסיף או לעדכן מדיה בפרופיל.',
            'מידע מנוי: סטטוס מנוי, מזהי מוצרים, סטטוס רכישה או חידוש ומטא-דאטה שקשור לקבלות, דרך Apple ו-RevenueCat. איננו מקבלים את פרטי כרטיס האשראי המלאים שלך.',
            'נתוני מכשיר, אבחון ושימוש: גרסת אפליקציה, סוג מכשיר, מערכת הפעלה, דוחות קריסה, נתוני ביצועים, אסימוני התראות ולוגים לצורכי אבטחה.',
            'פניות תמיכה: הודעות, קבצים מצורפים ופרטי קשר שאתה שולח כאשר אתה מבקש עזרה.',
          ],
        },
        {
          title: 'כיצד אנו משתמשים במידע',
          body: [
            'כדי לספק את חוויית האפליקציה, כולל התחברות, יצירת ליגות, שליחת ניחושים, טבלאות דירוג, הצגת פרופיל וניהול חברים.',
            'כדי להפעיל מנויים, לשחזר רכישות, לאכוף מגבלות תוכנית ולספק גישה לתכונות בתשלום.',
            'כדי לשלוח הודעות שירות כגון הודעות חשבון, עדכוני ליגה, תזכורות משחקים, עדכוני מנוי ותשובות תמיכה.',
            'כדי לאבטח את השירות, למנוע שימוש לרעה, לתקן תקלות, לשפר אמינות ולהבין כיצד משתמשים בתכונות המרכזיות.',
            'כדי לעמוד בדרישות חוק, בדרישות App Store ולאכוף את תנאי השירות שלנו.',
          ],
        },
        {
          title: 'שיתוף וספקי שירות',
          body: [
            'איננו מוכרים את המידע האישי שלך.',
            'אנו משתפים מידע רק עם ספקים שנדרשים להפעלת האפליקציה, כגון Supabase לאימות/מסד נתונים/אחסון, Apple ו-RevenueCat לרכישות בתוך האפליקציה, Sentry לאבחון תקלות, שירותי התראות וספקי התחברות כגון Apple או Google כאשר אתה בוחר בהם.',
            'ספקים אלה עשויים לעבד מידע מטעמנו ונדרשים להגן עליו בהתאם למדיניות זו ולחוק החל.',
            'אנו עשויים לחשוף מידע אם הדבר נדרש לפי דין, כדי להגן על זכויות ובטיחות, או כחלק מהעברה עסקית כגון מיזוג או רכישה.',
          ],
        },
        {
          title: 'שמירת מידע ומחיקה',
          body: [
            'אנו שומרים רשומות חשבון, ליגות, ניחושים ומנויים כל עוד נדרש כדי לספק את השירות, לשמור היסטוריית ליגה, לעמוד בחובות משפטיות, לפתור מחלוקות ולמנוע שימוש לרעה.',
            'ניתן לבקש גישה, תיקון, ייצוא או מחיקה של המידע האישי שלך באמצעות פנייה אל support@leaguechampion.app.',
            'לאחר בקשת מחיקה, נמחק או נאפשר אנונימיזציה של מידע אישי, אלא אם נדרשת שמירה לצורכי חוק, אבטחה, חיוב, מניעת הונאה או פעילות תפעולית לגיטימית.',
          ],
        },
        {
          title: 'הבחירות שלך',
          body: [
            'ניתן לעדכן פרטי פרופיל באפליקציה במקומות שבהם הדבר נתמך.',
            'ניתן לנהל התראות Push דרך הגדרות המכשיר.',
            'ניתן לנהל או לבטל מנויי Apple דרך הגדרות המנויים בחשבון Apple שלך.',
            'כאשר נדרשת הסכמה, ניתן למשוך אותה באמצעות שינוי הרשאות מכשיר, הגדרות באפליקציה או פנייה אלינו.',
          ],
        },
        {
          title: 'ילדים',
          body: [
            'League Champion אינה מיועדת לילדים מתחת לגיל 13. איננו אוספים ביודעין מידע אישי מילדים מתחת לגיל 13. אם לדעתך ילד מסר מידע אישי, פנה אלינו ונפעל למחיקתו לפי הצורך.',
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
          body: ['לשאלות פרטיות או בקשות מידע, ניתן לפנות אל support@leaguechampion.app.'],
        },
      ],
      footer: 'מדיניות זו נועדה לתמוך בדרישות App Store ובשקיפות מול משתמשים. היא אינה ייעוץ משפטי.',
    },
    terms: {
      title: 'תנאי שימוש',
      updatedAt: 'עודכן לאחרונה: 25 במאי 2026',
      intro:
        'תנאי שימוש אלה מסדירים את השימוש שלך ב-League Champion. יצירת חשבון, הצטרפות לליגה, שליחת ניחושים, רכישת מנוי או שימוש אחר באפליקציה מהווים הסכמה לתנאים אלה.',
      sections: [
        {
          title: 'כשירות וחשבונות',
          body: [
            'עליך להיות בן 13 לפחות כדי להשתמש ב-League Champion.',
            'אתה אחראי לשמירה על פרטי ההתחברות שלך ולפעילות שמתבצעת בחשבונך.',
            'אתה מסכים למסור פרטי חשבון מדויקים ולעדכן אותם לפי הצורך.',
          ],
        },
        {
          title: 'שימוש באפליקציה',
          body: [
            'League Champion מאפשרת ליצור או להצטרף לליגות ניחושי כדורגל, להזמין חברים, לשלוח ניחושי תוצאה, לצפות בדירוגים ולעקוב אחר משחקים וטבלאות.',
            'אין לעשות שימוש לרעה באפליקציה, להפריע לפעולתה, לנסות גישה לא מורשית, לגרד נתונים, לבצע הנדסה לאחור לחלקים מוגנים של השירות או להשתמש בה לפעילות בלתי חוקית.',
            'אתה אחראי לתוכן שאתה מוסר, כולל שמות ליגות, כינויים, תמונות פרופיל וניחושים. אין לשלוח תוכן בלתי חוקי, פוגעני, מפר זכויות, מטעה או מזיק.',
          ],
        },
        {
          title: 'ניחושים ונתוני כדורגל',
          body: [
            'הניחושים מיועדים לבידור ולתחרות חברתית. League Champion אינה מספקת הימורים, פעילות גיימבלינג, ייעוץ פיננסי או תוצאות משחק מובטחות.',
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
            'האפליקציה עשויה להסתמך על שירותי צד שלישי כגון Apple, Google, Supabase, RevenueCat, Sentry, שירותי התראות וספקי נתוני ספורט. השימוש בשירותים אלה עשוי להיות כפוף גם לתנאים ולמדיניות שלהם.',
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
          title: 'שינויים ויצירת קשר',
          body: [
            'אנו עשויים לעדכן תנאים אלה מעת לעת. המשך שימוש לאחר מועד התחילה של תנאים מעודכנים מהווה הסכמה לתנאים המעודכנים.',
            'לשאלות לגבי תנאים אלה, ניתן לפנות אל support@leaguechampion.app.',
          ],
        },
      ],
      footer: 'תנאים אלה נועדו לשקיפות מוצרית ולעמידה בדרישות App Store. הם אינם ייעוץ משפטי.',
    },
  },
};
