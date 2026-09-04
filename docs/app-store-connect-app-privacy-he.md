# Champo — הכנת App Privacy לגרסה 1.0 החינמית

עודכן: 31 באוגוסט 2026. זהו מיפוי טכני לקוד הנוכחי, ולא אישור משפטי או אישור שהשאלון כבר מולא ב־App Store Connect.

המסמך הקודם תיאר מנויים ו־Sentry Replay. הוא אינו תואם לגרסת 1.0 הנוכחית: `SUBSCRIPTIONS_ENABLED` כבוי כברירת מחדל, `PurchasesProvider` אינו מגדיר RevenueCat כאשר הוא כבוי, ולא הוגדרה אינטגרציית Replay. תזכורות משחק כן משתמשות ב־push token, לפי בחירת המשתמש. חובה לוודא שדגל המנויים נשאר כבוי בסביבת הבנייה המוגשת.

## מיפוי האיסוף הנוכחי

| סוג מידע | קישור למשתמש | שימוש / ראיה |
|---|---|---|
| Name | כן | שמות ספק התחברות וכינויים; תפקוד האפליקציה. |
| Email Address | כן | התחברות, אימות ואיפוס סיסמה דרך Supabase. |
| Photos or Videos | כן | אווטאר אופציונלי; אחסון ובדיקת בטיחות תמונה. אין הקלטת קול. |
| Gameplay Content | כן | ניחושים, חברות בליגה, נקודות ודירוגים. |
| Other User Content | כן | שמות ליגה, כינויים ודיווחי בטיחות. |
| User ID | כן | מזהי חשבון וחברות. ה־manifest מצהיר App Functionality ו־Analytics; יש להתאים לשימוש בפועל ובספקים לפני הגשה. |
| Device ID | כן | push token לתזכורות מרחוק, רק אחרי הרשאה; App Functionality. |
| Product Interaction | ה־manifest מצהיר לא מקושר | Sentry navigation tracing פעיל; Analytics ו־App Functionality. Replay וצילומי מסך אינם מופעלים. יש לבדוק אירוע אבחון ממשי וספק לפני קביעה סופית של היעדר קישור. |
| Crash Data / Performance Data / Other Diagnostic Data | מיועד ללא זיהוי ישיר | Sentry; `sendDefaultPii:false`, הסרת user, פרטי בקשה ונתונים רגישים ב־`scrubSentryEvent`. יש לאמת גם מזהים בנתיבי מסך ונתוני SDK בדוח הבינארי. |
| Purchase History | לא נאסף על ידי מסלול 1.0 החינמי | אין רכישות או מסך מנויים פעיל. SDK RevenueCat עדיין כלול בפרויקט; יש לבדוק את ה־Privacy Report הממוזג ואת התנהגות הבינארי לפני בחירת תשובות סופיות. |

Tracking מוגדר `false` בקוד וב־manifest של האפליקציה. לא אותרה הפעלת IDFA/ATT. אין להוסיף הצהרות על פרסום או רכישות רק משום שהן הופיעו במסמך הישן; השאלון צריך לשקף איסוף בפועל, כולל ספקים.

## בדיקות חובה לפני מילוי סופי

- ליצור archive חתום של אותה גרסה שמגישים, ולהפיק Privacy Report ב־Xcode. בניית simulator אינה מחליפה זאת.
- לוודא שכל manifest של SDK ושימוש ב־required-reason APIs תואמים לדוח הממוזג.
- לבדוק אירוע Sentry אמיתי ללא חשיפת דוא״ל, token, כינוי או מזהה פרטי שלא הוצהר.
- לבדוק הרשאת התראות ורישום/הסרת push token על מכשיר אמיתי.
- לוודא הסרה מלאה של המידע המזהה בחשבון ייעודי למחיקה, כולל ספק Apple אם קיים.
- לאמת ששאלון App Store Connect ומדיניות הפרטיות הציבורית תואמים לקוד ולספקים.

## כתובות להגשה

- [מדיניות פרטיות](https://champoapp.com/privacy-policy/)
- [אפשרויות פרטיות](https://champoapp.com/privacy-choices/)
- [תמיכה](https://champoapp.com/support/)

זמינות הכתובות הציבוריות לא אושרה בבדיקה זו: כלי הגלישה לא הצליח לפתוח אותן. זו מגבלת בדיקה ואינה הוכחה שהאתר אינו פעיל. יש לבדוק גישה ציבורית ב־HTTPS ללא התחברות לפני הגשה.

## מקורות וראיות

- `app.json`, `src/app/_layout.tsx`, `src/lib/sentryPrivacy.ts`, `src/providers/PurchasesProvider.tsx`, `src/lib/notifications/pushToken.ts`.
- [Apple — App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/), נבדק ב־31 באוגוסט 2026: יש לדווח על האיסוף של האפליקציה ושל ספקיה, לשמור את התשובות מעודכנות ולספק מדיניות פרטיות ציבורית.

הפעלת מנויים, analytics נוספים, פרסום או Replay מחייבת מיפוי מחדש לפני שחרור.
