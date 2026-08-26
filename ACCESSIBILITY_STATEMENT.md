# Champo Accessibility Statement

Last reviewed: August 26, 2026

Champo is committed to making its native mobile experience usable by as many people as possible, including people who use assistive technologies. Accessibility is an ongoing product responsibility.

We aim to follow the applicable principles of Israel Standard 5568, the Equal Rights for Persons with Disabilities service-accessibility regulations, and WCAG 2.2 Level AA, while applying Apple and Android native accessibility guidance. This statement describes an internal code and automated-test review. It is not certification by an external accessibility professional.

Current accessibility measures include:

- VoiceOver and TalkBack semantics for shared buttons, links, tabs, switches, checkboxes, headings, dialogs, form controls, and status messages.
- Text scaling up to 200% through the shared typography system.
- English and Hebrew interfaces, including right-to-left layout.
- Touch targets of at least 48 points/dp in shared controls reviewed in this audit.
- Light and dark themes with automated WCAG AA checks for primary semantic text-color combinations.
- Text labels and state announcements so important actions do not rely only on color or icons.

The August 2026 internal review covered native navigation and settings flows, shared controls, authentication, league and match controls, dialogs, forms, dynamic text, Hebrew RTL behavior, and semantic color contrast. It included static inspection, component accessibility assertions, linting, TypeScript validation, the complete automated test suite, and an iOS simulator accessibility-tree and largest-text-size check of the public entry screen.

Known limitations may remain in dense football tables, tournament brackets, third-party sign-in and purchase interfaces, and externally supplied content. Manual testing with current VoiceOver and TalkBack versions remains part of ongoing release verification.

If you encounter an accessibility barrier, email [support@champoapp.com](mailto:support@champoapp.com). Please include the screen or action, device and operating-system version, assistive technology used, and a short description of the problem.

## הצהרת הנגישות של Champo

נבדק לאחרונה: 26 באוגוסט 2026

Champo מחויבת להפוך את חוויית המובייל המקורית שלה לשימושית עבור אנשים רבים ככל האפשר, לרבות אנשים המשתמשים בטכנולוגיות מסייעות. נגישות היא אחריות מוצר מתמשכת מבחינתנו.

אנו שואפים לפעול לפי העקרונות הרלוונטיים בתקן הישראלי ת״י 5568, בתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), ובהנחיות WCAG 2.2 ברמה AA, תוך יישום הנחיות הנגישות המקוריות של Apple ושל Android. הצהרה זו מתארת בדיקת קוד ובדיקות אוטומטיות פנימיות ואינה אישור של מורשה נגישות חיצוני.

התאמות הנגישות הנוכחיות כוללות:

- סמנטיקה ל-VoiceOver ול-TalkBack בכפתורים, קישורים, לשוניות, מתגים, תיבות סימון, כותרות, חלונות דו-שיח, שדות טופס והודעות מצב משותפים.
- הגדלת טקסט עד 200% באמצעות מערכת הטיפוגרפיה המשותפת.
- ממשק באנגלית ובעברית, כולל פריסה מימין לשמאל.
- אזורי מגע בגודל 48 נקודות/dp לפחות ברכיבים המשותפים שנבדקו בביקורת זו.
- ערכות עיצוב בהירה וכהה, עם בדיקות WCAG AA אוטומטיות לשילובי צבעי הטקסט הסמנטיים המרכזיים.
- תוויות טקסט והקראת מצבים, כך שפעולות חשובות אינן מסתמכות רק על צבע או סמל.

הבדיקה הפנימית מאוגוסט 2026 כללה ניווט ומסכי הגדרות מקוריים, רכיבים משותפים, התחברות, בקרי ליגות ומשחקים, חלונות דו-שיח, טפסים, טקסט דינמי, פריסה עברית מימין לשמאל וניגודיות צבעים סמנטית. הבדיקה כללה סקירה סטטית, בדיקות נגישות ברכיבים, lint, בדיקת TypeScript, הרצת חבילת הבדיקות המלאה ובדיקת עץ הנגישות וגודל הטקסט המרבי במסך הכניסה הציבורי בסימולטור iOS.

ייתכנו מגבלות בטבלאות כדורגל צפופות, תרשימי נוקאאוט, ממשקי התחברות ורכישה של צדדים שלישיים ובתוכן חיצוני. בדיקה ידנית בגרסאות עדכניות של VoiceOver ושל TalkBack ממשיכה להיות חלק מתהליך אימות הגרסאות.

אם נתקלתם בחסם נגישות, ניתן לפנות אל [support@champoapp.com](mailto:support@champoapp.com). מומלץ לציין את המסך או הפעולה, המכשיר וגרסת מערכת ההפעלה, הטכנולוגיה המסייעת שבה השתמשתם ותיאור קצר של הבעיה.

## References

- [React Native accessibility](https://reactnative.dev/docs/accessibility)
- [Apple accessibility guidance](https://developer.apple.com/design/human-interface-guidelines/accessibility/)
- [Android accessibility guidance](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Israel service-accessibility regulations](https://www.gov.il/BlobFolder/guide/accommodating_service_providing_rules/he/sitedocs_service_acessibility_regulations.pdf)
