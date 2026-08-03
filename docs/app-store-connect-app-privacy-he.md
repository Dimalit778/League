# Champo — מטריצת App Privacy ל־App Store Connect

**עודכן:** 2 באוגוסט 2026  
**גרסה:** 1.0.0  
**Tracking:** לא  
**ATT / `NSUserTrackingUsageDescription`:** לא נדרש לפי הקוד וה־SDKs הנוכחיים

המסמך משקף את הקוד הנוכחי: Supabase Auth/Database/Storage, RevenueCat עם Supabase UUID כ־App User ID, ו־Sentry עם tracing ו־Mobile Replay כאשר טקסטים ותמונות מוסתרים. יש לבחור ב־App Store Connect: **Yes, we collect data from this app**.

## הבחירות המדויקות

| קטגוריה ב־App Store Connect | נאסף | Linked to User | Tracking | Purposes לבחירה | מקור באפליקציה |
|---|---|---|---|---|---|
| Contact Info → Name | כן | כן | לא | App Functionality | שם מלא מספק auth וכינויים בפרופיל/ליגות. |
| Contact Info → Email Address | כן | כן | לא | App Functionality | הרשמה, התחברות, אימות ואיפוס סיסמה דרך Supabase Auth. |
| User Content → Photos or Videos | כן | כן | לא | App Functionality | תמונת פרופיל אופציונלית ב־Supabase Storage. |
| User Content → Gameplay Content | כן | כן | לא | App Functionality | ניחושים, ניקוד, חברות בליגה ודירוגים. |
| User Content → Other User Content | כן | כן | לא | App Functionality | שמות ליגה, כינויים, פרטי דיווח ותוכן moderation. |
| Identifiers → User ID | כן | כן | לא | App Functionality; Analytics | UUID של Supabase ומזהי member; ה־UUID נשלח ל־RevenueCat כ־custom App User ID. |
| Purchases → Purchase History | כן | כן | לא | App Functionality; Analytics | RevenueCat, App Store receipts, entitlement ומידע מנוי המקושר ל־User ID. |
| Usage Data → Product Interaction | כן | לא | לא | App Functionality; Analytics | Sentry navigation tracing ו־Mobile Replay; `sendDefaultPii:false`, וטקסטים/תמונות/vectors מוסתרים. |
| Diagnostics → Crash Data | כן | לא | לא | App Functionality | Sentry crash reporting. |
| Diagnostics → Performance Data | כן | לא | לא | App Functionality | Sentry traces ונתוני ביצועים. |
| Diagnostics → Other Diagnostic Data | כן | לא | לא | App Functionality | אבחון שגיאות, גרסת אפליקציה/OS ומידע טכני תומך. |

## קטגוריות שאין לבחור כרגע

- Contact Info: Phone Number, Physical Address, Other User Contact Info.
- Health & Fitness, Financial Info ו־Sensitive Info.
- Precise/Coarse Location, Contacts, Emails or Text Messages ו־Audio Data.
- Browsing History, Search History, Advertising Data ו־Device ID.
- Tracking, Third-Party Advertising ו־Developer’s Advertising or Marketing.

Apple אינה מחשיבה פרטי כרטיס אשראי כמידע שהאפליקציה אוספת כאשר התשלום מוזן ומעובד מחוץ לאפליקציה ואין למפתח גישה אליו. יש לסמן Purchase History, לא Payment Info.

## התאמה ל־Privacy Manifest

ה־manifest של target האפליקציה מצהיר על איסוף first-party ועל החיבור של RevenueCat/Sentry:

- linked: Name, Email Address, Photos or Videos, Gameplay Content, Other User Content, User ID, Purchase History.
- not linked: Product Interaction.
- tracking: `false` בכל הסוגים ובשורש ה־manifest.

ה־SDK manifests מוסיפים בדוח הממוזג של Xcode:

- RevenueCat: Purchase History ו־UserDefaults required-reason API.
- Sentry: Crash Data, Performance Data, Other Diagnostic Data ו־required-reason APIs.

לפני Submit יש ליצור archive חתום ב־Xcode/EAS, להפיק ממנו Privacy Report ולוודא שאין data type או tracking domain שלא מופיעים במטריצה הזו.

## תנאים שמחייבים שינוי לפני שחרור

- הפעלת פרסום, attribution, IDFA, data broker או שיתוף למדידת פרסום: לעדכן Tracking/Device ID ולהוסיף ATT לפני build.
- הוספת analytics SDK נוסף או ביטול masking ב־Sentry Replay: לבדוק מחדש Product Interaction, User Content ו־Linked to User.
- שליחת email/name כ־RevenueCat customer attributes: לעדכן את הראיות והמדיניות, גם אם הקטגוריות כבר מסומנות.
- איסוף push token בעתיד: לבדוק מחדש Identifiers/Device ID והצהרת מדיניות ההתראות.
- הסרת Sentry Replay מה־build: אפשר לבחון הסרת Product Interaction לאחר אימות שאין analytics אחר שאוסף אותו.

## URLs להזנה

- Privacy Policy URL: `https://champoapp.com/privacy-policy/`
- Privacy Choices URL: `https://champoapp.com/privacy-choices/`

Privacy Policy URL הוא חובה. Privacy Choices URL הוא אופציונלי; אם מזינים אותו, גם הוא חייב להיות ציבורי, ב־HTTPS ונגיש ללא התחברות.

## מקורות

- [Apple — App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)
- [Apple — Privacy manifest files](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files)
- [Apple — Describing data use in privacy manifests](https://developer.apple.com/documentation/bundleresources/describing-data-use-in-privacy-manifests)
- [RevenueCat — Apple App Privacy](https://www.revenuecat.com/docs/platform-resources/apple-platform-resources/apple-app-privacy)
