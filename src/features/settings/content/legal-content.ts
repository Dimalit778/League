import { SupportedLanguage } from "@/store/LanguageStore";

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
  emailLink: string;
};

export const legalContent: Record<
  SupportedLanguage,
  { privacy: LegalDocument; terms: LegalDocument; accessibility: LegalDocument }
> = {
  en: {
    privacy: {
      title: "Privacy Policy",
      updatedAt: "Last updated: August 27, 2026",
      intro:
        "Champo is a football prediction app for creating leagues, joining friends, submitting predictions, and viewing rankings. This Privacy Policy explains what information we collect, how we use and share it, how long we keep it, and the choices available to you.",
      sections: [
        {
          title: "Who We Are",
          body: [
            'Champo is operated by the developer responsible for the app ("Champo", "we", "us", or "our"). For privacy questions or requests, contact support@champoapp.com.',
          ],
        },
        {
          title: "Information We Collect",
          body: [
            "Account information: your name, email address, authentication-provider information, and basic profile details you provide when creating or managing your account.",
            "League and prediction information: leagues you create or join, nicknames, invite codes, predictions, points, rankings, and related in-app activity.",
            "Profile media: profile images or other images you choose to upload. Champo accesses images only when you choose to select or upload them through the system picker or another supported upload method.",
            "Device, diagnostic, and security information: app version, device type, operating system, crash and error information, technical logs, performance information, and other technical data reasonably needed to secure and maintain the service.",
            "Notification information: if you enable match reminders, we may store a push-notification token associated with your device so reminders can be delivered.",
            "Support communications: messages, attachments, and contact information you provide when contacting support.",
          ],
        },
        {
          title: "How We Use Information",
          body: [
            "To provide and operate Champo, including authentication, league creation and membership, predictions, rankings, profiles, reminders, and member-management features.",
            "To send service-related communications, such as email verification, password-reset messages, important account notices, and replies to support requests.",
            "To protect the service, prevent misuse, moderate user-submitted content, investigate reports, diagnose errors, and improve reliability and performance.",
            "To comply with applicable legal obligations and App Store or platform requirements, and to enforce our Terms of Service.",
          ],
        },
        {
          title: "Sharing and Service Providers",
          body: [
            "We do not sell your personal information.",
            "We use third-party service providers where reasonably necessary to operate Champo. These may include Supabase for authentication, database and storage services; Google Cloud Vision for automated profile-image safety checks; Sentry for crash and diagnostic monitoring; and Apple or Google when you choose to use their sign-in services.",
            "We may also use external AI and information services to prepare match-related content from public football information. Champo does not intentionally send your account details, email address, profile image, league membership, or predictions to those services for that purpose.",
            "Third parties that process user data for Champo are expected to handle it in accordance with applicable law and protections appropriate to their role.",
            "We may disclose information when required by law, when reasonably necessary to protect users, rights, safety, or the service, or in connection with a business reorganization, merger, acquisition, or sale of assets.",
          ],
        },
        {
          title: "Legal Bases for Processing (EEA and UK)",
          body: [
            "Where EEA or UK data-protection law applies, we process information as necessary to provide the service and perform our contract with you, to comply with legal obligations, and for legitimate interests such as security, fraud prevention, service maintenance, and improvement.",
            "Where consent is required, including for optional device permissions, you may withdraw that consent at any time. Withdrawal does not affect processing that was lawful before consent was withdrawn.",
          ],
        },
        {
          title: "Profile Image Moderation",
          body: [
            "When you choose to upload or replace a profile image, the image may be sent to Google Cloud Vision for automated content-safety screening before it is accepted or stored by Champo.",
            "The moderation request is intended to contain the image needed for the safety check and not your Champo email address, league membership, or predictions.",
            "Automated moderation may make mistakes. If your image is rejected and you believe the decision was incorrect, contact support@champoapp.com. You can continue using Champo without uploading a profile image.",
          ],
        },
        {
          title: "Diagnostics",
          body: [
            "We use Sentry and similar diagnostic tools to identify crashes, troubleshoot errors, monitor performance, protect the service, and improve reliability.",
            "Diagnostic information may include app version, device and operating-system details, error messages, stack traces, performance information, request identifiers, and other technical context related to a failure.",
            "We aim to minimize personal information included in diagnostic events and do not intentionally use diagnostic tools to collect profile images, league content, or predictions.",
          ],
        },
        {
          title: "Data Retention and Deletion",
          body: [
            "We keep personal information only for as long as reasonably necessary for the purposes described in this policy, including providing the service, maintaining league history, security, dispute resolution, and compliance with legal obligations.",
            "Account and profile information is generally kept while your account is active. You can request deletion through the in-app account-deletion feature or by contacting support@champoapp.com.",
            "When an account is deleted, we delete or de-identify account and profile information under our control, subject to limited information that may need to be retained for legal, security, fraud-prevention, or legitimate service-history purposes.",
            'Past predictions, points, and a minimal league-member record may be retained in de-identified form to preserve league standings and history. Where this applies, identifying account information is removed and the former member may appear as "Deleted Player".',
            "Operational and diagnostic records are deleted or rotated according to their purpose and reasonable retention practices. Support and moderation records are retained only as long as reasonably necessary to handle the issue, protect users and the service, and meet legal obligations.",
            "Backups, where maintained, may temporarily contain information that has already been deleted from active systems until the relevant backup is overwritten or expires under the applicable backup-retention cycle.",
            "You may request access, correction, export, or deletion of personal information by contacting support@champoapp.com. Some requests may be subject to identity verification or limitations required or permitted by law.",
          ],
        },
        {
          title: "Your Choices",
          body: [
            "You can update supported profile details within the app.",
            "You may choose whether to enable match reminders. Notification permissions can be changed at any time in your device settings.",
            "Where processing is based on consent, you may withdraw consent by changing relevant device permissions or app settings, or by contacting us where applicable.",
            "You may delete your account using the account-deletion option available in the app.",
          ],
        },
        {
          title: "Children",
          body: [
            "Champo is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided personal information to Champo, contact us so we can review the matter and take appropriate action.",
          ],
        },
        {
          title: "Security and International Processing",
          body: [
            "We use reasonable technical and organizational measures designed to protect information. However, no method of storage, transmission, or processing can be guaranteed to be completely secure.",
            "Some service providers may process information in countries other than your country of residence. Where required, we rely on appropriate safeguards for international data transfers under applicable law.",
          ],
        },
        {
          title: "Changes to This Policy",
          body: [
            "We may update this Privacy Policy to reflect changes to Champo, our service providers, legal requirements, or our data practices. If a change is material, we will provide notice where reasonably appropriate or legally required.",
          ],
        },
        {
          title: "Contact Us",
          body: [
            "For privacy questions, requests, or complaints, contact support@champoapp.com.",
          ],
        },
      ],
      footer: "Privacy questions and data requests:",
      emailLink: "support@champoapp.com",
    },

    terms: {
      title: "Terms of Service",
      updatedAt: "Last updated: August 27, 2026",
      intro:
        "These Terms of Service govern your use of Champo. By creating an account or using Champo, you agree to these terms. If you do not agree, do not use the service.",
      sections: [
        {
          title: "Eligibility and Accounts",
          body: [
            "You must be at least 13 years old to use Champo.",
            "You are responsible for keeping your account credentials secure and for activity performed through your account.",
            "You agree to provide reasonably accurate account information and to keep it up to date where the app allows you to do so.",
          ],
        },
        {
          title: "App Use",
          body: [
            "Champo allows users to create or join football prediction leagues, invite members, submit score predictions, view rankings, and follow football fixtures and standings.",
            "You may not misuse the app, interfere with its operation, attempt unauthorized access, abuse automated interfaces, scrape protected data, reverse engineer protected parts of the service except where permitted by law, or use Champo for unlawful activity.",
            "You are responsible for content you submit, including league names, nicknames, profile images, and predictions. You may not submit content that is illegal, abusive, infringing, deceptive, threatening, or otherwise harmful.",
            "We may apply automated or manual moderation measures, restrict visibility, remove content, remove members, or suspend or terminate accounts where reasonably necessary to protect users or the service or to enforce these terms.",
          ],
        },
        {
          title: "User-Generated Content and Community Standards",
          body: [
            "Champo does not permit objectionable or abusive user-generated content. These rules apply to profile images, league names, nicknames, and other content submitted through the app.",
            "You may not upload or submit content that is sexually explicit or pornographic; promotes or depicts unlawful violence, terrorism, or illegal activity; is hateful, harassing, threatening, or discriminatory; infringes intellectual-property, privacy, publicity, or other rights; impersonates another person or organization; or is otherwise unlawful or materially harmful.",
            "Do not use another person's image, a public figure's image, or copyrighted artwork as your profile image unless you have the right to do so.",
            "Champo may screen, review, reject, hide, remove, or replace user-submitted content when we reasonably believe it violates these standards or applicable law.",
            "Users can report objectionable content or abusive users and can block users through supported screens in the app. Reports may also be sent to support@champoapp.com.",
            "We review reports within a reasonable time based on their nature and severity and may remove content, restrict accounts, suspend users, or take other appropriate action. Serious matters may be reported to relevant authorities when required by law or reasonably necessary to protect safety.",
          ],
        },
        {
          title: "Your Content",
          body: [
            "You retain ownership of content you submit to Champo.",
            "You grant Champo a limited, non-exclusive license to host, store, display, process, reproduce as technically necessary, and moderate your content solely as needed to operate, secure, maintain, and improve the service.",
            "This license ends when the relevant content is deleted, except to the extent limited de-identified information is retained as described in the Privacy Policy or retention is otherwise required or permitted by law.",
          ],
        },
        {
          title: "Predictions and Football Data",
          body: [
            "Predictions and AI-assisted match information are provided for entertainment and social competition only. Champo does not provide betting, gambling, financial, or investment advice and does not guarantee match outcomes.",
            "Fixtures, scores, events, standings, team information, AI-assisted previews, and related football data may come from third-party sources and may be delayed, incomplete, inaccurate, or unavailable.",
            "Football data may be provided by Football-Data.org or other sports-data providers. Champo is an independent product and is not affiliated with, endorsed by, or sponsored by FIFA, UEFA, any league, competition, club, or team unless expressly stated otherwise.",
            "Names, logos, trademarks, and other third-party identifiers remain the property of their respective owners. Their appearance in Champo does not imply endorsement or affiliation.",
            "We may correct predictions scoring, rankings, or match information when errors are identified.",
          ],
        },
        {
          title: "Free Access",
          body: [
            "Champo is currently offered without subscriptions or paid upgrades.",
            "If paid features are introduced in the future, applicable pricing and purchase conditions will be presented before a purchase is made and these terms will be updated where appropriate.",
          ],
        },
        {
          title: "Privacy",
          body: [
            "Our Privacy Policy explains how Champo collects, uses, shares, retains, and deletes information and the choices available to you.",
          ],
        },
        {
          title: "Third-Party Services",
          body: [
            "Champo relies on third-party providers for services such as authentication, cloud infrastructure, diagnostics, content moderation, notifications, AI-assisted features, and football data.",
            "Third-party services may be subject to their own terms, privacy policies, availability, and technical limitations. Champo is not responsible for third-party services to the extent permitted by applicable law.",
          ],
        },
        {
          title: "Suspension and Termination",
          body: [
            "We may restrict, suspend, or terminate access to Champo where you materially violate these terms, create risk for users or the service, abuse the platform, or where we are required to do so by law.",
            "You may stop using Champo at any time and may delete your account through the supported in-app account-deletion feature.",
            "Certain limited records may remain after account deletion as described in the Privacy Policy.",
          ],
        },
        {
          title: "Availability and Disclaimers",
          body: [
            'Champo is provided on an "as is" and "as available" basis. To the extent permitted by law, we do not guarantee uninterrupted availability, error-free operation, or the accuracy or continued availability of third-party football data or AI-assisted content.',
            "Nothing in these terms excludes warranties, remedies, or consumer rights that cannot legally be excluded or limited.",
          ],
        },
        {
          title: "Limitation of Liability",
          body: [
            "To the maximum extent permitted by applicable law, Champo and its operator will not be liable for indirect, incidental, special, consequential, or punitive damages arising from use of the service, service interruptions, inaccurate third-party data, or user-submitted content.",
            "This limitation does not apply where liability cannot lawfully be excluded or limited.",
          ],
        },
        {
          title: "Apple App Store Terms",
          body: [
            "For iOS users, use of Champo is also subject to applicable Apple App Store terms and license conditions. Mandatory Apple terms apply where required for distribution through the App Store.",
          ],
        },
        {
          title: "Governing Law and General Terms",
          body: [
            "These terms are governed by the laws of the State of Israel, subject to mandatory consumer-protection or other rights that may apply in your country of residence.",
            "If any provision of these terms is found unenforceable, the remaining provisions will continue in effect. Failure to enforce a provision is not a waiver of the right to enforce it later.",
          ],
        },
        {
          title: "Changes and Contact",
          body: [
            "We may update these terms to reflect changes to Champo, legal requirements, or our operations. Material changes will be communicated where reasonably appropriate or legally required.",
          ],
        },
      ],
      footer: "Questions about these terms:",
      emailLink: "support@champoapp.com",
    },

    accessibility: {
      title: "Accessibility Statement",
      updatedAt: "Last reviewed: August 27, 2026",
      intro:
        "Champo is committed to making its mobile experience usable by as many people as reasonably possible, including people who use assistive technologies. Accessibility is an ongoing part of our product and release process.",
      sections: [
        {
          title: "Accessibility Approach",
          body: [
            "We aim to follow applicable accessibility requirements and relevant principles of Israel Standard 5568, the Equal Rights for Persons with Disabilities accessibility regulations, and WCAG 2.2 Level AA, while also considering Apple and Android accessibility guidance.",
            "This statement describes Champo's current accessibility approach and internal review. It is not a certification by an external accessibility professional and does not guarantee that every screen, device, operating-system version, or assistive-technology combination is free of accessibility barriers.",
          ],
        },
        {
          title: "Accessibility Features",
          body: [
            "Champo supports native accessibility features such as VoiceOver on iOS and TalkBack on Android through accessible labels, roles, states, headings, tabs, switches, checkboxes, and error announcements where implemented.",
            "The app supports English and Hebrew, including right-to-left layout for Hebrew, and is designed to support enlarged text across the shared typography system.",
            "Shared controls are designed with accessible touch targets, visible labels, light and dark themes, and semantic color combinations intended to maintain appropriate contrast.",
            "Important actions are designed not to rely only on color or icons, and form controls are intended to expose relevant labels, hints, validation information, and input behavior to assistive technologies.",
          ],
        },
        {
          title: "Review and Testing",
          body: [
            "Our internal accessibility review includes navigation, settings, shared controls, forms, authentication flows, match and league controls, dynamic text behavior, Hebrew right-to-left layouts, and semantic color contrast.",
            "Testing may include code review, automated component checks, linting and type checks, simulator or device testing, and manual checks with assistive technologies as part of release verification.",
          ],
        },
        {
          title: "Known Limitations",
          body: [
            "Dense football tables, tournament brackets, third-party sign-in interfaces, and content supplied by external providers may be less convenient with very large text or certain assistive-technology combinations.",
            "We continue to review accessibility issues and prioritize problems that materially prevent navigation, understanding, or completion of core actions.",
          ],
        },
        {
          title: "Accessibility Feedback",
          body: [
            "If you encounter an accessibility barrier, contact support@champoapp.com. If possible, include the screen or action involved, your device and operating-system version, the assistive technology used, and a short description of the issue.",
            "We will review accessibility feedback and make reasonable efforts to provide an accessible alternative and address verified issues as appropriate.",
          ],
        },
      ],
      footer: "Accessibility feedback:",
      emailLink: "support@champoapp.com",
    },
  },

  he: {
    privacy: {
      title: "מדיניות פרטיות",
      updatedAt: "עודכן לאחרונה: 27 באוגוסט 2026",
      intro:
        "Champo היא אפליקציית ניחושי כדורגל ליצירת ליגות, הצטרפות לחברים, שליחת ניחושים וצפייה בדירוגים. מדיניות פרטיות זו מסבירה איזה מידע אנו אוספים, כיצד אנו משתמשים ומשתפים בו, כמה זמן אנו שומרים אותו ומהן האפשרויות שעומדות לרשותכם.",
      sections: [
        {
          title: "מי אנחנו",
          body: [
            'Champo מופעלת על ידי המפתח האחראי לאפליקציה ("Champo", "אנחנו", "אנו" או "שלנו"). לשאלות או בקשות בנושא פרטיות ניתן לפנות אל support@champoapp.com.',
          ],
        },
        {
          title: "מידע שאנו אוספים",
          body: [
            "פרטי חשבון: שם, כתובת דוא״ל, מידע מספק ההתחברות ופרטי פרופיל בסיסיים שאתם מוסרים בעת יצירת החשבון או ניהולו.",
            "מידע על ליגות וניחושים: ליגות שאתם יוצרים או מצטרפים אליהן, כינויים, קודי הזמנה, ניחושים, נקודות, דירוגים ופעילות קשורה באפליקציה.",
            "מדיה בפרופיל: תמונת פרופיל או תמונות אחרות שאתם בוחרים להעלות. Champo ניגשת לתמונות רק כאשר אתם בוחרים לבחור או להעלות אותן באמצעות בורר המערכת או דרך העלאה נתמכת אחרת.",
            "מידע על המכשיר, אבחון ואבטחה: גרסת האפליקציה, סוג המכשיר, מערכת ההפעלה, מידע על קריסות ושגיאות, לוגים טכניים, נתוני ביצועים ומידע טכני נוסף שנדרש באופן סביר לאבטחה ולתחזוקה של השירות.",
            "מידע על התראות: אם תפעילו תזכורות למשחקים, אנו עשויים לשמור אסימון Push המשויך למכשיר כדי שנוכל לשלוח את התזכורות.",
            "פניות לתמיכה: הודעות, קבצים מצורפים ופרטי קשר שאתם מוסרים כאשר אתם פונים לתמיכה.",
          ],
        },
        {
          title: "כיצד אנו משתמשים במידע",
          body: [
            "כדי לספק ולהפעיל את Champo, כולל התחברות, יצירת ליגות והצטרפות אליהן, ניחושים, דירוגים, פרופילים, תזכורות וניהול חברים.",
            "כדי לשלוח הודעות הקשורות לשירות, כגון אימות דוא״ל, איפוס סיסמה, הודעות חשבון חשובות ותשובות לפניות תמיכה.",
            "כדי להגן על השירות, למנוע שימוש לרעה, למתן תוכן שנשלח על ידי משתמשים, לבדוק דיווחים, לאבחן תקלות ולשפר אמינות וביצועים.",
            "כדי לעמוד בחובות משפטיות, בדרישות App Store או פלטפורמות אחרות, ולאכוף את תנאי השימוש שלנו.",
          ],
        },
        {
          title: "שיתוף מידע וספקי שירות",
          body: [
            "איננו מוכרים את המידע האישי שלכם.",
            "אנו משתמשים בספקי שירות חיצוניים כאשר הדבר נדרש באופן סביר להפעלת Champo. ספקים אלה עשויים לכלול את Supabase לצורכי התחברות, מסד נתונים ואחסון; את Google Cloud Vision לבדיקות בטיחות אוטומטיות של תמונות פרופיל; את Sentry לניטור קריסות ואבחון תקלות; ואת Apple או Google כאשר אתם בוחרים להשתמש בשירותי ההתחברות שלהם.",
            "אנו עשויים להשתמש גם בשירותי AI ומידע חיצוניים לצורך יצירת תוכן הקשור למשחקים על בסיס מידע כדורגל ציבורי. לצורך זה Champo אינה שולחת בכוונה את פרטי החשבון, כתובת הדוא״ל, תמונת הפרופיל, החברות בליגות או הניחושים שלכם.",
            "ספקים שמעבדים מידע של משתמשים עבור Champo נדרשים לטפל בו בהתאם לדין החל ולרמת הגנה המתאימה לתפקידם.",
            "אנו עשויים למסור מידע אם הדבר נדרש לפי דין, אם הדבר נדרש באופן סביר להגנה על משתמשים, זכויות, בטיחות או השירות, או במסגרת שינוי מבני עסקי, מיזוג, רכישה או מכירת נכסים.",
          ],
        },
        {
          title: "בסיסים משפטיים לעיבוד מידע (EEA ובריטניה)",
          body: [
            "כאשר דיני הגנת המידע של ה-EEA או בריטניה חלים, אנו מעבדים מידע ככל שנדרש כדי לספק את השירות ולקיים את ההתקשרות איתכם, כדי לעמוד בחובות משפטיות, ולשם אינטרסים לגיטימיים כגון אבטחה, מניעת הונאה, תחזוקת השירות ושיפורו.",
            "כאשר נדרשת הסכמה, לרבות עבור הרשאות מכשיר אופציונליות, ניתן למשוך אותה בכל עת. משיכת ההסכמה אינה משפיעה על עיבוד שהיה חוקי לפני המשיכה.",
          ],
        },
        {
          title: "בדיקת תמונות פרופיל",
          body: [
            "כאשר אתם בוחרים להעלות או להחליף תמונת פרופיל, התמונה עשויה להישלח אל Google Cloud Vision לצורך בדיקת בטיחות אוטומטית לפני שהיא מאושרת או נשמרת ב-Champo.",
            "הבקשה לבדיקה מיועדת לכלול את התמונה הדרושה לבדיקת הבטיחות, ולא את כתובת הדוא״ל שלכם ב-Champo, החברות בליגות או הניחושים שלכם.",
            "בדיקה אוטומטית עלולה לטעות. אם תמונה נדחתה ולדעתכם ההחלטה שגויה, ניתן לפנות אל support@champoapp.com. ניתן להמשיך להשתמש ב-Champo גם ללא תמונת פרופיל.",
          ],
        },
        {
          title: "אבחון תקלות",
          body: [
            "אנו משתמשים ב-Sentry ובכלי אבחון דומים כדי לזהות קריסות, לאבחן תקלות, לנטר ביצועים, להגן על השירות ולשפר את אמינותו.",
            "מידע אבחוני עשוי לכלול את גרסת האפליקציה, פרטי המכשיר ומערכת ההפעלה, הודעות שגיאה, stack traces, נתוני ביצועים, מזהי בקשה והקשר טכני אחר הקשור לתקלה.",
            "אנו שואפים לצמצם מידע אישי שנכלל באירועי אבחון ואיננו משתמשים בכוונה בכלי האבחון לצורך איסוף תמונות פרופיל, תוכן ליגות או ניחושים.",
          ],
        },
        {
          title: "שמירת מידע ומחיקה",
          body: [
            "אנו שומרים מידע אישי רק למשך הזמן שנדרש באופן סביר למטרות המתוארות במדיניות זו, לרבות אספקת השירות, שמירת היסטוריית ליגה, אבטחה, פתרון מחלוקות ועמידה בחובות משפטיות.",
            "פרטי החשבון והפרופיל נשמרים בדרך כלל כל עוד החשבון פעיל. ניתן לבקש מחיקה באמצעות אפשרות מחיקת החשבון באפליקציה או בפנייה אל support@champoapp.com.",
            "כאשר חשבון נמחק, אנו מוחקים או מסירים זיהוי מפרטי החשבון והפרופיל שבשליטתנו, בכפוף למידע מוגבל שעשוי להישמר לצרכים משפטיים, אבטחה, מניעת הונאה או שמירת היסטוריית שירות לגיטימית.",
            "ניחושים, נקודות ורשומת חבר מינימלית עשויים להישמר בצורה שאינה מזהה כדי לשמר את טבלאות הדירוג והיסטוריית הליגה. במקרים אלה פרטי החשבון המזהים מוסרים והמשתמש לשעבר עשוי להופיע בשם „שחקן שנמחק”.",
            "רשומות תפעוליות ואבחוניות נמחקות או מתחלפות בהתאם למטרתן ולתקופות שמירה סבירות. פניות תמיכה ורשומות הקשורות למתן תוכן נשמרות רק כל עוד הדבר נדרש באופן סביר לטיפול בנושא, להגנה על משתמשים והשירות ולעמידה בחובות משפטיות.",
            "עותקי גיבוי, ככל שהם נשמרים, עשויים לכלול באופן זמני מידע שכבר נמחק מהמערכות הפעילות, עד שהגיבוי הרלוונטי נדרס או פג בהתאם למחזור השמירה החל עליו.",
            "ניתן לבקש גישה, תיקון, ייצוא או מחיקה של מידע אישי באמצעות פנייה אל support@champoapp.com. בקשות מסוימות עשויות להיות כפופות לאימות זהות או למגבלות שנדרשות או מותרות לפי דין.",
          ],
        },
        {
          title: "הבחירות שלכם",
          body: [
            "ניתן לעדכן באפליקציה פרטי פרופיל במקומות שבהם הדבר נתמך.",
            "ניתן לבחור אם להפעיל תזכורות למשחקים. את הרשאת ההתראות ניתן לשנות בכל עת בהגדרות המכשיר.",
            "כאשר עיבוד מידע מבוסס על הסכמה, ניתן למשוך את ההסכמה באמצעות שינוי ההרשאות הרלוונטיות במכשיר או בהגדרות האפליקציה, או באמצעות פנייה אלינו לפי העניין.",
            "ניתן למחוק את החשבון באמצעות אפשרות מחיקת החשבון הזמינה באפליקציה.",
          ],
        },
        {
          title: "ילדים",
          body: [
            "Champo אינה מיועדת לילדים מתחת לגיל 13. איננו אוספים ביודעין מידע אישי מילדים מתחת לגיל 13. אם לדעתכם ילד מתחת לגיל 13 מסר מידע אישי ל-Champo, פנו אלינו כדי שנוכל לבדוק את העניין ולנקוט פעולה מתאימה.",
          ],
        },
        {
          title: "אבטחה ועיבוד בינלאומי",
          body: [
            "אנו משתמשים באמצעים טכניים וארגוניים סבירים שנועדו להגן על המידע. עם זאת, אין שיטת אחסון, העברה או עיבוד שניתן להבטיח שהיא מאובטחת לחלוטין.",
            "חלק מספקי השירות עשויים לעבד מידע במדינות אחרות ממדינת המגורים שלכם. כאשר הדבר נדרש, אנו מסתמכים על אמצעי הגנה מתאימים להעברות מידע בינלאומיות בהתאם לדין החל.",
          ],
        },
        {
          title: "שינויים במדיניות",
          body: [
            "אנו עשויים לעדכן מדיניות פרטיות זו כדי לשקף שינויים ב-Champo, בספקי השירות, בדרישות משפטיות או באופן שבו אנו מטפלים במידע. אם השינוי מהותי, נמסור הודעה כאשר הדבר סביר או נדרש לפי דין.",
          ],
        },
      ],
      footer: "לשאלות פרטיות ובקשות מידע:",
      emailLink: "support@champoapp.com",
    },

    terms: {
      title: "תנאי שימוש",
      updatedAt: "עודכן לאחרונה: 27 באוגוסט 2026",
      intro:
        "תנאי שימוש אלה מסדירים את השימוש ב-Champo. ביצירת חשבון או בשימוש ב-Champo אתם מסכימים לתנאים אלה. אם אינכם מסכימים להם, אין להשתמש בשירות.",
      sections: [
        {
          title: "כשירות וחשבונות",
          body: [
            "עליכם להיות בני 13 לפחות כדי להשתמש ב-Champo.",
            "אתם אחראים לשמירה על פרטי ההתחברות לחשבון ולפעילות שמתבצעת באמצעותו.",
            "אתם מסכימים למסור פרטי חשבון מדויקים באופן סביר ולעדכן אותם כאשר האפליקציה מאפשרת זאת.",
          ],
        },
        {
          title: "שימוש באפליקציה",
          body: [
            "Champo מאפשרת ליצור או להצטרף לליגות ניחושי כדורגל, להזמין חברים, לשלוח ניחושי תוצאה, לצפות בדירוגים ולעקוב אחר משחקים וטבלאות.",
            "אין לעשות שימוש לרעה באפליקציה, להפריע לפעולתה, לנסות לקבל גישה לא מורשית, לנצל ממשקים אוטומטיים לרעה, לאסוף מידע מוגן באופן אוטומטי, לבצע הנדסה לאחור לחלקים מוגנים של השירות אלא אם הדבר מותר לפי דין, או להשתמש ב-Champo לפעילות בלתי חוקית.",
            "אתם אחראים לתוכן שאתם שולחים, כולל שמות ליגות, כינויים, תמונות פרופיל וניחושים. אין לשלוח תוכן בלתי חוקי, פוגעני, מפר זכויות, מטעה, מאיים או מזיק בדרך אחרת.",
            "אנו עשויים להפעיל אמצעי מתן אוטומטיים או ידניים, להגביל תצוגה, להסיר תוכן, להסיר חברים או להשעות או לסגור חשבונות כאשר הדבר נדרש באופן סביר להגנת המשתמשים או השירות או לאכיפת תנאים אלה.",
          ],
        },
        {
          title: "תוכן משתמשים וכללי קהילה",
          body: [
            "Champo אינה מתירה תוכן משתמשים פוגעני או התנהגות פוגענית. כללים אלה חלים על תמונות פרופיל, שמות ליגות, כינויים ותוכן אחר שנשלח באמצעות האפליקציה.",
            "אין להעלות או לשלוח תוכן מיני מפורש או פורנוגרפי; תוכן שמציג או מקדם אלימות בלתי חוקית, טרור או פעילות בלתי חוקית; תוכן שמבטא שנאה, הטרדה, איום או אפליה; תוכן שמפר זכויות קניין רוחני, פרטיות, פרסום או זכויות אחרות; תוכן שמתחזה לאדם או לארגון אחר; או תוכן בלתי חוקי או מזיק באופן מהותי בדרך אחרת.",
            "אין להשתמש בתמונה של אדם אחר, בתמונה של דמות ציבורית או ביצירה המוגנת בזכויות יוצרים כתמונת פרופיל, אלא אם יש לכם זכות לעשות זאת.",
            "Champo רשאית לבדוק, לסנן, לדחות, להסתיר, להסיר או להחליף תוכן שנשלח על ידי משתמשים כאשר יש לנו סיבה סבירה להאמין שהוא מפר כללים אלה או את הדין החל.",
            "משתמשים יכולים לדווח על תוכן פוגעני או על משתמשים פוגעניים ולחסום משתמשים דרך המסכים הנתמכים באפליקציה. ניתן גם לשלוח דיווח אל support@champoapp.com.",
            "אנו בוחנים דיווחים בתוך זמן סביר בהתאם לאופי ולחומרת המקרה, ועשויים להסיר תוכן, להגביל חשבונות, להשעות משתמשים או לנקוט פעולה מתאימה אחרת. מקרים חמורים עשויים להיות מדווחים לרשויות המוסמכות כאשר הדבר נדרש לפי דין או נחוץ באופן סביר להגנה על בטיחות.",
          ],
        },
        {
          title: "התוכן שלכם",
          body: [
            "הבעלות בתוכן שאתם שולחים ל-Champo נשארת שלכם.",
            "אתם מעניקים ל-Champo רישיון מוגבל ולא בלעדי לארח, לאחסן, להציג, לעבד, לשכפל ככל שנדרש מבחינה טכנית ולמתן את התוכן, אך ורק ככל שנדרש להפעלה, לאבטחה, לתחזוקה ולשיפור השירות.",
            "רישיון זה מסתיים כאשר התוכן הרלוונטי נמחק, למעט ככל שמידע מוגבל שעבר הסרת זיהוי נשמר בהתאם למדיניות הפרטיות או כאשר שמירה אחרת נדרשת או מותרת לפי דין.",
          ],
        },
        {
          title: "ניחושים ונתוני כדורגל",
          body: [
            "ניחושים ומידע על משחקים שנוצר או סוכם בסיוע AI נועדו לבידור ולתחרות חברתית בלבד. Champo אינה מספקת שירותי הימורים, גיימבלינג, ייעוץ פיננסי או ייעוץ השקעות ואינה מבטיחה תוצאות משחקים.",
            "משחקים, תוצאות, אירועים, טבלאות, מידע על קבוצות, תצוגות מקדימות בסיוע AI ונתוני כדורגל קשורים עשויים להגיע ממקורות חיצוניים ועלולים להיות באיחור, חלקיים, לא מדויקים או לא זמינים.",
            "נתוני כדורגל עשויים להינתן על ידי Football-Data.org או ספקי נתוני ספורט אחרים. Champo היא מוצר עצמאי ואינה מסונפת, מאושרת או ממומנת על ידי FIFA, UEFA, ליגה, תחרות, מועדון או קבוצה כלשהם, אלא אם נאמר אחרת במפורש.",
            "שמות, סמלים, סימני מסחר ומזהים אחרים של צדדים שלישיים הם קניינם של בעליהם. הופעתם ב-Champo אינה מעידה כשלעצמה על חסות, אישור או קשר מסחרי.",
            "אנו עשויים לתקן חישובי ניקוד, דירוגים או נתוני משחק כאשר מתגלות טעויות.",
          ],
        },
        {
          title: "גישה חינמית",
          body: [
            "Champo מוצעת כיום ללא מנויים או שדרוגים בתשלום.",
            "אם יתווספו בעתיד תכונות בתשלום, המחיר ותנאי הרכישה הרלוונטיים יוצגו לפני ביצוע רכישה, ותנאים אלה יעודכנו לפי הצורך.",
          ],
        },
        {
          title: "פרטיות",
          body: [
            "מדיניות הפרטיות שלנו מסבירה כיצד Champo אוספת, משתמשת, משתפת, שומרת ומוחקת מידע ומהן האפשרויות שעומדות לרשותכם.",
          ],
        },
        {
          title: "שירותי צד שלישי",
          body: [
            "Champo מסתמכת על ספקי שירות חיצוניים לצורך שירותים כגון התחברות, תשתיות ענן, אבחון תקלות, בדיקת תוכן, התראות, יכולות בסיוע AI ונתוני כדורגל.",
            "שירותים של צדדים שלישיים עשויים להיות כפופים לתנאים, למדיניות פרטיות, לזמינות ולמגבלות טכניות משלהם. Champo אינה אחראית לשירותי צד שלישי במידה המותרת לפי הדין החל.",
          ],
        },
        {
          title: "השעיה וסיום השימוש",
          body: [
            "אנו עשויים להגביל, להשעות או לסיים גישה ל-Champo אם תפרו באופן מהותי את התנאים, תיצרו סיכון למשתמשים או לשירות, תעשו שימוש לרעה בפלטפורמה או אם נידרש לכך לפי דין.",
            "ניתן להפסיק להשתמש ב-Champo בכל עת ולמחוק את החשבון באמצעות אפשרות מחיקת החשבון הנתמכת באפליקציה.",
            "מידע מוגבל מסוים עשוי להישאר לאחר מחיקת החשבון כפי שמתואר במדיניות הפרטיות.",
          ],
        },
        {
          title: "זמינות והסתייגויות",
          body: [
            "Champo מסופקת כפי שהיא וכפי שהיא זמינה. במידה המותרת לפי דין, איננו מתחייבים לזמינות רציפה, לפעולה ללא שגיאות או לדיוק או לזמינות מתמשכת של נתוני כדורגל חיצוניים או תוכן שנוצר בסיוע AI.",
            "אין בתנאים אלה כדי לשלול אחריות, תרופות או זכויות צרכניות שלא ניתן לשלול או להגביל לפי דין.",
          ],
        },
        {
          title: "הגבלת אחריות",
          body: [
            "במידה המרבית המותרת לפי הדין החל, Champo והמפעיל שלה לא יהיו אחראים לנזקים עקיפים, מקריים, מיוחדים, תוצאתיים או עונשיים הנובעים מהשימוש בשירות, מהפסקות שירות, ממידע חיצוני לא מדויק או מתוכן שנשלח על ידי משתמשים.",
            "הגבלה זו אינה חלה במקום שבו לא ניתן לפי דין לשלול או להגביל אחריות.",
          ],
        },
        {
          title: "תנאי App Store של Apple",
          body: [
            "למשתמשי iOS, השימוש ב-Champo כפוף גם לתנאים ולתנאי הרישיון הרלוונטיים של Apple App Store. תנאי Apple המחייבים יחולו ככל שנדרש לצורך הפצה דרך App Store.",
          ],
        },
        {
          title: "דין חל ותנאים כלליים",
          body: [
            "על תנאים אלה יחולו דיני מדינת ישראל, בכפוף לזכויות צרכניות מחייבות או לזכויות אחרות שעשויות לחול במדינת המגורים שלכם.",
            "אם הוראה כלשהי בתנאים אלה תימצא בלתי אכיפה, יתר ההוראות ימשיכו לעמוד בתוקף. הימנעות מאכיפת הוראה אינה מהווה ויתור על הזכות לאכוף אותה בעתיד.",
          ],
        },
        {
          title: "שינויים ויצירת קשר",
          body: [
            "אנו עשויים לעדכן תנאים אלה כדי לשקף שינויים ב-Champo, בדרישות משפטיות או באופן הפעלת השירות. על שינויים מהותיים נודיע כאשר הדבר סביר או נדרש לפי דין.",
          ],
        },
      ],
      footer: "לשאלות לגבי התנאים:",
      emailLink: "support@champoapp.com",
    },

    accessibility: {
      title: "הצהרת נגישות",
      updatedAt: "נבדק לאחרונה: 27 באוגוסט 2026",
      intro:
        "Champo מחויבת להפוך את חוויית המובייל שלה לשימושית עבור אנשים רבים ככל שניתן באופן סביר, לרבות אנשים המשתמשים בטכנולוגיות מסייעות. נגישות היא חלק מתמשך מתהליך הפיתוח וההפצה שלנו.",
      sections: [
        {
          title: "גישת הנגישות שלנו",
          body: [
            "אנו שואפים לפעול בהתאם לדרישות הנגישות החלות ולעקרונות הרלוונטיים בתקן הישראלי ת״י 5568, בתקנות הנגישות מכוח חוק שוויון זכויות לאנשים עם מוגבלות ובהנחיות WCAG 2.2 ברמה AA, תוך התחשבות גם בהנחיות הנגישות של Apple ושל Android.",
            "הצהרה זו מתארת את גישת הנגישות והבדיקות הפנימיות הנוכחיות של Champo. היא אינה מהווה אישור של גורם נגישות חיצוני ואינה מבטיחה שכל מסך, מכשיר, גרסת מערכת הפעלה או שילוב של טכנולוגיה מסייעת חפים מחסמי נגישות.",
          ],
        },
        {
          title: "התאמות נגישות באפליקציה",
          body: [
            "Champo תומכת בתכונות נגישות מקוריות כגון VoiceOver ב-iOS ו-TalkBack ב-Android באמצעות תוויות, תפקידים, מצבים, כותרות, לשוניות, מתגים, תיבות סימון והקראת שגיאות במקומות שבהם הדבר מיושם.",
            "האפליקציה תומכת באנגלית ובעברית, לרבות פריסה מימין לשמאל בעברית, ומתוכננת לתמוך בהגדלת טקסט במערכת הטיפוגרפיה המשותפת.",
            "רכיבי שליטה משותפים מתוכננים עם אזורי מגע נגישים, תוויות גלויות, ערכות עיצוב בהירה וכהה ושילובי צבעים סמנטיים שנועדו לשמור על ניגודיות מתאימה.",
            "פעולות חשובות מתוכננות כך שלא יסתמכו רק על צבע או סמל, ושדות טופס נועדו לחשוף לטכנולוגיות מסייעות תוויות, רמזים, מידע על שגיאות והתנהגות קלט רלוונטית.",
          ],
        },
        {
          title: "בדיקה ובחינה",
          body: [
            "בדיקות הנגישות הפנימיות שלנו כוללות ניווט, הגדרות, רכיבים משותפים, טפסים, תהליכי התחברות, בקרי משחקים וליגות, התנהגות של טקסט דינמי, פריסה בעברית מימין לשמאל וניגודיות צבעים סמנטית.",
            "הבדיקות עשויות לכלול סקירת קוד, בדיקות רכיבים אוטומטיות, lint ובדיקות טיפוסים, בדיקות בסימולטור או במכשיר ובדיקות ידניות עם טכנולוגיות מסייעות כחלק מתהליך אימות הגרסה.",
          ],
        },
        {
          title: "מגבלות ידועות",
          body: [
            "טבלאות כדורגל צפופות, תרשימי שלבי נוקאאוט, ממשקי התחברות של צדדים שלישיים ותוכן שמסופק על ידי ספקים חיצוניים עשויים להיות פחות נוחים עם טקסט גדול מאוד או בשילובים מסוימים של טכנולוגיות מסייעות.",
            "אנו ממשיכים לבחון בעיות נגישות ומתעדפים בעיות שמונעות באופן מהותי ניווט, הבנה או השלמה של פעולות מרכזיות.",
          ],
        },
        {
          title: "פניות בנושא נגישות",
          body: [
            "אם נתקלתם בחסם נגישות, ניתן לפנות אל support@champoapp.com. אם אפשר, ציינו את המסך או הפעולה הרלוונטיים, סוג המכשיר וגרסת מערכת ההפעלה, הטכנולוגיה המסייעת שבה השתמשתם ותיאור קצר של הבעיה.",
            "נבחן פניות בנושא נגישות ונעשה מאמצים סבירים לספק חלופה נגישה ולטפל בבעיות שאומתו, בהתאם לנסיבות.",
          ],
        },
      ],
      footer: "לפניות בנושא נגישות:",
      emailLink: "support@champoapp.com",
    },
  },
};
