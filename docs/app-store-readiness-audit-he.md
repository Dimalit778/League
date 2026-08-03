# דוח מוכנות מלא להשקת Champo ב־App Store

**תאריך הבדיקה:** 2 באוגוסט 2026  
**גרסה שנבדקה:** `1.0.0`  
**Bundle ID:** `com.dimalit778.champo`  
**יעד:** הפצה עולמית, iPhone ו־iPad, אנגלית ועברית, מנוי PRO וניתוח AI פעילים ב־1.0  
**החלטה:** **NO-GO — אין להגיש עדיין ל־App Review**  
**ציון כולל:** **6.2/10**

> זהו audit הנדסי, מוצרי ותפעולי, ולא ייעוץ משפטי. סעיפי GDPR, UK GDPR, תנאי שימוש וזכויות תוכן צריכים לעבור אישור של עורך דין המתמחה במוצרי תוכנה ובשווקי היעד.

> **עדכון לאחר הבדיקה — 2 באוגוסט 2026:** המיגרציות של `SEC-01`, `DATA-01` וסכמת `PRIV-01` נפרסו ל־production ו־DB lint עבר ללא שגיאות. כתיבת ניחוש הועברה ל־RPC שמונע שינוי `points`/`is_finished`, בודק בעלות, תחרות ו־kickoff ומחשב מחדש ניקוד קנוני; שינוי `active`/`is_primary` הועבר ל־RPCs אטומיים עם מגבלת תוכנית ו־unique index לליגה ראשית אחת. גרסת `delete-account` החדשה עדיין לא נפרסה משום שחסרים Apple ו־RevenueCat API secrets; לכן מחיקת חשבון ותרחישי שני משתמשים נשארים **לא אומתו** עד השלמת התצורה ובדיקת E2E. נוסף גם hardening לניתוח AI ולנגישות/iPad: אין יותר ברירת מחדל מזויפת של 0:0, קיימים מצב “לא זמין”, זמן עדכון וגילוי נאות; נוספו רוחבי תוכן מותאמים, Dynamic Type, צבעי AA, labels/roles ומידות מגע. QA native מלא עדיין נדרש.

## תקציר מנהלים

Champo כבר נראית ומרגישה כמו מוצר אמיתי ולא כמו אב־טיפוס. לשפה העיצובית הכחולה־זהובה יש זהות חזקה, מבנה האפליקציה מסודר, ה־backend משתמש ב־RLS, לוגיקת הליגות והטורנירים עשירה, קיימים מצבי טעינה ושגיאה רבים, ה־session נשמר מוצפן, וה־iOS JavaScript bundle נבנה בהצלחה. כל 450 בדיקות Jest עוברות, TypeScript ו־lint נקיים, ונוסף CI לכל PR ו־push ל־main, כולל smoke test ל־iOS bundle. בהרצה הנוכחית Expo Doctor השלים 17 בדיקות מקומיות; שתי בדיקות הרשת לא אומתו כי הגישה ל־Expo API ול־React Native Directory נחסמה בסביבה.

עם זאת, הגרסה אינה מוכנה להגשה. קיימת פרצת שלמות נתונים קריטית שמאפשרת ללקוח זדוני לכתוב `points` ו־`is_finished` בניחוש לפני kickoff; מחיקת חשבון אינה מבטלת טוקן Sign in with Apple ואינה מוחקת בוודאות את קובץ תמונת הפרופיל; הדומיין וה־URLs המשפטיים אינם פעילים; אין דיווח/חסימה/מודרציה לתוכן משתמש; אין סט נכסי iPad וצילומי 6.9″; ולא ניתן היה לאמת build חתום, TestFlight, מוצרי IAP, webhooks, Privacy Labels וחשבון reviewer ב־App Store Connect.

המשמעות המעשית: המוצר טוב מספיק כדי להיכנס ל־release hardening, אך עדיין לא בטוח ולא שלם מספיק להפצה עולמית בתשלום.

### ששת חוסמי ההגשה

1. **שלמות ניקוד — אימות פריסה חסר:** התיקון עבר בדיקת PostgreSQL מקומית, אך המיגרציה טרם נפרסה ולא נבדקה עם שני משתמשי production/test.
2. **מחיקת חשבון — אימות פריסה חסר:** התיקון קיים מקומית, אך נדרשים secrets, פריסת migration/function ובדיקת E2E מול Apple, RevenueCat, Storage ו־Supabase production.
3. **פרטיות ומשפטי:** `champoapp.com` לא נפתר ב־DNS; המדיניות והתנאים עדיין ממותגים League Champion ומכילים מידע שגוי לגבי התראות.
4. **UGC — נפרס, QA תפעולי חסר:** קיימים דיווח על כינוי/תמונה/שם ליגה, חסימת משתמש, הסרת חבר ותור moderation לאדמין. נדרשים מבחן E2E עם שני משתמשים, SLA וכתובת support חיה לפני סגירה מלאה.
5. **iPad ונכסי חנות:** `supportsTablet` פעיל, אך אין בדיקת TestFlight מלאה ב־iPad ואין צילומי iPad 13″; גם אין סט 6.9″ תקין בשתי השפות.
6. **סביבת הפצה לא אומתה:** אין session פעיל ב־App Store Connect/RevenueCat ולכן build, IAP, entitlement, offering, webhook, Privacy Labels, DSA וחשבון reviewer עדיין שערי שחרור פתוחים.

## מקרא ומתודולוגיה

- **עבר:** קיימת ראיה ישירה בבדיקה סטטית, פקודה אוטומטית או smoke test.
- **נכשל:** נמצאה סתירה, תקלה או דרישה שלא מתקיימת.
- **לא אומת:** אין די ראיה; אין לפרש כעבר.
- **P0:** חוסם הגשה או סיכון קריטי לאבטחה/נתונים/דחייה.
- **P1:** חובה לפני השקה; עלול לפגוע קשות במשתמשים או בביקורת Apple.
- **P2:** חשוב ליציבות ולאיכות, אך ניתן לשקול לאחר סגירת P0/P1.
- **P3:** שיפור תחזוקה או polish.

הבדיקה כללה קריאת קוד ומיגרציות, השוואה לפרויקט Supabase המקושר, הרצת TypeScript/lint/Jest/coverage/Expo Doctor/Expo export/npm audit, בדיקת Expo config הסופי, בחינת Privacy Manifests של Pods, מדידת נכסים וצילומי מסך, smoke test של גרסת web במידות iPhone ו־iPad, ובדיקת דרישות Apple העדכניות. לאחר ה־audit בוצעו תיקוני קוד ממוקדים; שינויי AI/iPad/נגישות הם מקומיים ודורשים build חדש ו־QA native לפני הגשה.

לא היו sessions מחוברים ל־App Store Connect, RevenueCat או TestFlight. ה־smoke test ב־iPad בוצע בגרסת web והוא אינדיקציה בלבד, לא תחליף לבדיקה על build native.

## ציון וחוות דעת בעשר קטגוריות

| קטגוריה | ציון | סטטוס | חוות דעת |
|---|---:|---|---|
| ערך מוצר ובידול | 8.3 | עבר חלקית | הצעת הערך ברורה: ליגות פרטיות, ניחושים, דירוגים, מספר תחרויות ו־AI. שילוב חברתי + תוכן משחקים נותן סיבה לחזור לאפליקציה. |
| עיצוב ושפה חזותית | 8.2 | עבר חלקית | מיתוג כחול־זהב, כרטיסים, אייקונים והיררכיה עקביים ומרשימים. חלק מהמסכים צפופים והטיפוגרפיה הקטנה פוגעת בנגישות. |
| UX ומסעות מרכזיים | 6.7 | לא אומת במלואו | מסכי הכניסה נראים נקיים ומצבי loading/error רבים קיימים. המסעות המחוברים, מחיקה, PRO והתראות לא עברו E2E על build הפצה. |
| נגישות, RTL ולוקליזציה | 7.2 | עבר חלקית / QA native חסר | 565 מפתחות קיימים בכל שפה ללא חסרים; נוספו Dynamic Type, צבעי AA, RTL יציב, labels/roles/states ומידות מגע. עדיין חסר מעבר VoiceOver/AX Inspector מלא על iPhone ו־iPad. |
| איכות הנדסית וארכיטקטורה | 8.0 | עבר חלקית | feature slices, TanStack Query, Zustand ומפתחות query מרכזיים הם בסיס טוב. TypeScript, lint ו־Expo Doctor ירוקים; עדיין קיים drift תפעולי. |
| בדיקות, CI ואמינות | 7.7 | עבר חלקית | 450/450 בדיקות עוברות ונוסף CI ל־typecheck/lint/i18n/privacy/Expo Doctor/Jest/iOS export. coverage נשאר 56.72% שורות ואין E2E native. |
| Backend, DB ותפעול נתונים | 7.0 | עבר חלקית | migrations תואמות ו־DB lint נקי; יש אינדקסים ו־RLS. seed חסר, cron/backup/alerts לא אומתו וקיימת פונקציה פרוסה ללא מקור מקומי. |
| אבטחה ושלמות הרשאות | 4.8 | נכשל | אחסון session מוצפן וחלק מה־RPCs מוקשחים, אך שינוי ניקוד ושדות membership מהלקוח הם סיכונים מהותיים. |
| פרטיות, משפטי וציות | 4.2 | נכשל | קיימים טקסטים דו־לשוניים, אך הם מיושנים, URLs לא פעילים, מחיקה לא מלאה ו־Privacy Labels/Manifest לא הותאמו בפועל. |
| מוכנות App Store ותפעול השקה | 3.8 | לא אומת | אין ראיה ל־IPA/TestFlight/IAP production/metadata/screenshots/DSA/reviewer account מוכנים. |

### חוות דעתי על האפליקציה

החוזקה הגדולה של Champo היא שהיא מצליחה להפוך מוצר עתיר נתונים למשהו עם אופי. העיצוב לא גנרי, מסכי המשחקים והדירוגים מרגישים עשירים, ומבנה התחרויות השונות הוא יתרון שקשה לחקות במהירות. גם הבחירה לשמור עונה שלמה ב־cache ולחתוך תצוגות בצד הלקוח נכונה לחוויית מעבר מהירה בין fixtures ושלבים.

החולשה כרגע אינה ברעיון או בנראות אלא ב־last mile של מוצר מסחרי: הרשאות שלא מוגנות עד רמת column/business rule, פער בין מה שהקוד עושה למה שהמסמכים מצהירים, ומעט מדי ראיות מהבינארי הסופי. אם סוגרים את ה־P0/P1 ועושים סבב TestFlight מסודר, Champo יכולה להיראות בחנות כמו מוצר בשל מאוד לגרסה ראשונה.

## תוצאות בדיקות אוטומטיות

| בדיקה | תוצאה | סטטוס | הערה |
|---|---|---|---|
| `npm run typecheck` | exit 0 | עבר | ללא שגיאות TypeScript. |
| `npm run lint` | exit 0 | עבר | ללא שגיאות ESLint. |
| `npm run test:ci` | 72/72 suites; 450/450 tests | עבר | כל הבדיקות עוברות, כולל AI ללא 0:0 מזויף, 0:0 אמיתי, התאמת רוחב כרטיס ב־iPad, contrast tokens ו־Dynamic Type. |
| Jest coverage | 54.65% statements, 47.76% branches, 45.87% functions, 56.72% lines | נכשל | APIs, providers, auth/matches/members/notifications אינם מכוסים מספיק ביחס לסיכון. |
| `npm run audit:i18n` | 565/565 מפתחות | עבר | אין מפתחות חסרים בעברית או באנגלית; קיימות 29 קריאות דינמיות שדורשות smoke tests. |
| `npm run audit:ios-privacy` | exit 0 | עבר | tracking כבוי, שמונת סוגי המידע הנדרשים קיימים, Camera/Microphone/Face ID חסומים וה־avatar אינו מבקש broad library access. ה־gate נוסף ל־CI. |
| `npm run doctor` | 17 בדיקות עברו; 2 בדיקות רשת לא אומתו | לא אומת בהרצה הנוכחית | בדיקות config schema ו־React Native Directory דורשות גישה ל־Expo API שנחסמה בסביבה. אין כאן כשל חבילה מוכח, אך יש להריץ שוב ב־CI/מחשב עם רשת לפני build candidate. |
| `npx expo install --check` | תואם | עבר | גרסאות Expo תואמות למפת הגרסאות המקומית. |
| `npx expo export --platform ios` | bundle נוצר | עבר | Hermes bundle כ־11MB ו־38 assets; ה־smoke test רץ גם ללא `.env.local` ונוסף ל־CI. זה אינו archive חתום או IPA. |
| `npm audit --omit=dev` | 1 high, 12 moderate, 0 critical | נכשל | ה־high הוא `brace-expansion` DoS דרך שרשרת tooling; אין להריץ `npm audit fix` עיוור כי ההצעה מחזירה Expo לגרסה ישנה. |
| `supabase db lint --linked --level warning` | ללא שגיאות | עבר | התחברות ל־DB המקושר הצליחה. |
| `supabase migration list --linked` | 17/17 תואמות | עבר | אין drift במיגרציות עד `20260731184500`. |
| build native חתום / IPA | לא הורץ | לא אומת | נדרש EAS production build ובדיקה של ה־artifact. |
| React Doctor מקומי | לא הורץ | לא אומת | הרצת קוד צד שלישי עדכני נחסמה במדיניות האבטחה; קיים workflow ייעודי ב־GitHub אך תוצאתו לא אומתה. |

## ממצאים P0–P3

הערכת מאמץ: **S** עד חצי יום, **M** יום–שלושה, **L** ארבעה–שבעה ימי עבודה. ההערכה אינה כוללת זמני אישור Apple או עבודה משפטית חיצונית.

| ID | חומרה | סטטוס | ממצא וראיה / דרך שחזור | השפעה | תיקון מומלץ | מאמץ |
|---|---|---|---|---|---|---:|
| SEC-01 | P0 | נפרס / אימות E2E חסר | `20260802100000_secure_prediction_writes.sql` נפרס ל־production; `upsert_own_prediction` נטען ב־PostgREST וחסום ל־anon. הוא מקבל רק scores ובודק משתמש, membership פעיל, תחרות, status ו־kickoff ומחשב ניקוד קנוני. | ללא מבחן משתמש מחובר עדיין אין ראיה מלאה לכל מסלול השמירה ב־production. | לבצע שמירה לפני kickoff, ניסיון שינוי אחרי kickoff וזיוף membership/points עם שני משתמשים לפני סימון “עבר”. | S |
| PRIV-01 | P0 | נפרס חלקית / לא אומת | מיגרציית האנונימיזציה נפרסה, אך גרסת `delete-account` החדשה לא נפרסה משום שחסרים Apple ו־RevenueCat API secrets. | ה־Edge Function הישן אינו מממש את תהליך האנונימיזציה המלא; אין לבצע מבחן מחיקה עד השלמת התצורה והפריסה. | להגדיר secrets, לפרוס את הפונקציה, ולבצע deletion test עם email/Apple, ליגה בבעלות, מנוי פעיל, avatar וניחושים; לאמת RevenueCat/Storage/Auth/DB. | M |
| LEGAL-01 | P0 | נכשל | `champoapp.com` לא נפתר ב־DNS ו־Review Notes עדיין מכילים `[YOUR_DOMAIN]`. מסמכי הפרטיות המקומיים עודכנו ל־Champo, `support@champoapp.com` ותזכורות מקומיות, אך עדיין קיימים שרידי League Champion במסכי עזרה/metadata. | אין Privacy Policy URL/Support URL פונקציונליים; סיבת דחייה ישירה לפי App Completeness ו־Privacy. | להפעיל HTTPS ב־`champoapp.com`; לפרסם `/privacy`, `/terms`, `/support`, `/privacy-choices`; להשלים ניקוי מיתוג ולבדוק קישורים מחוץ לחשבון. | M + משפטי |
| UGC-01 | P0 | נפרס / אימות E2E ותפעול חסרים | `20260802120000_add_ugc_moderation.sql` נפרס ל־production. משתמש יכול לדווח על nickname/avatar/league name לפי קטגוריה, לחסום ולהסיר חסימה דרך Settings; חסימה מסתירה membership, predictions ו־leaderboard. בעל ליגה מסיר חבר דרך RPC אטומי. אדמין מקבל תור pending/resolved/dismissed ויכול לדחות, להסיר תוכן או חבר. RPCs קיימים ב־PostgREST וחסומים ל־anon. | ללא מבחן שני משתמשים, SLA ו־support URL פעיל עדיין אין ראיה תפעולית מלאה ל־Guideline 1.2. | להריץ E2E report/block/unblock/remove/moderate, להגדיר owner תפעולי ו־SLA, ולפרסם support/contact לפני סימון “עבר”. | L |
| STORE-01 | P0 | לא אומת | App Store Connect פתח מסך login; לא היה session. build, TestFlight, metadata, age rating, content rights, App Privacy, DSA, agreements וחשבון reviewer לא נבדקו. | לא ניתן להוכיח יכולת הגשה או רכישה. | לבצע checklist הדשבורד תחת חשבון Admin/App Manager ולצרף ראיות לכל שער; אין לסמן Go לפני שכל השורות עברו. | M |
| STORE-02 | P0 | תוקן חלקית / QA ונכסים חסרים | `supportsTablet:true`; נוספו רוחבי תוכן 672/896, כרטיסי משחק מוגבלים ל־640, bottom tabs מוגבלים ל־720, hero רספונסיבי ומרכוז RTL יציב. smoke web ב־1024×1366 הציג landing ממורכז וללא runtime errors. עדיין אין QA native portrait/landscape ואין צילומי iPad 13″; רוב הנכסים הקיימים אינם במידות הנדרשות. | בסיס ה־layout מותאם יותר, אך ללא build native ונכסי חנות אי אפשר לסגור את שער ה־iPad. | להריץ TestFlight על iPad קטן ו־13″ בעברית/אנגלית, portrait/landscape ו־Dynamic Type; לתקן מסכים שנשברים ולצלם 2064×2752/2048×2732. | M–L |
| PRIV-02 | P0 | תוקן בקוד / App Store ו־IPA לא אומתו | `ios.privacyManifests` ו־`ios/league/PrivacyInfo.xcprivacy` מצהירים כעת על Name, Email, Photos, Gameplay/Other User Content, User ID, Purchase History ו־Product Interaction, עם linking/purposes ו־tracking=false. manifests של RevenueCat ו־Sentry נמצאו ב־Pods. נוצרה מטריצת App Privacy מדויקת ב־`docs/app-store-connect-app-privacy-he.md`. | הסתירה המקומית נסגרה; עדיין אין ראיה שה־IPA הסופי ממזג את כל manifests ושאותן בחירות הוזנו ב־App Store Connect. | ליצור archive, להפיק Xcode Privacy Report, להשוות למטריצה ולהזין את אותן תשובות ב־App Store Connect. | S–M |
| QA-01 | P1 | עבר | mocks והציפיות המיושנות עודכנו לאחר שינויי assets, מסכים משפטיים, מגבלות ליגה ושלבי טורניר; 72 suites ו־450 tests עוברים. | release gate ירוק. | לשמור את `npm run test:ci` כחובה ב־CI. | S |
| DATA-01 | P1 | נפרס / אימות E2E חסר | `20260802110000_secure_league_membership_state.sql` נפרס ל־production; הוא מסיר הרשאת UPDATE רחבה, מגן על `active`/`is_primary`, מוסיף unique partial index ו־check ש־primary חייב להיות active, ומעביר את השינויים ל־RPCs אטומיים. ה־RPCs נטענו ב־PostgREST וחסומים ל־anon. | נדרש מבחן מחובר עם שני משתמשים ובקשות מקבילות לפני סגירה מלאה. | לבדוק שינוי ישיר שנחסם, בחירת membership זר, חריגה ממגבלת תוכנית ושתי בקשות מקבילות, ורק אז לסמן “עבר”. | M |
| OPS-01 | P1 | נכשל | function בשם `sync-matches-and-update-competitions` פרוסה ב־Supabase אך אין לה directory מקומי. לא נמצאו cron schedules במיגרציות, רק extension `pg_cron`. | production אינו ניתן לשחזור מלא; שינוי ידני עלול ללכת לאיבוד. | לייצא/להחזיר את הפונקציה למקור או למחוק אותה מהפריסה לאחר אימות; לנהל schedules כקוד ולתעד owner, cadence ו־alert. | M |
| NOTIF-01 | P1 | תוקן בקוד / לא אומת במכשיר | `NotificationProvider` קורא את סטטוס המערכת ללא prompt. Settings מציג Enabled/Blocked/Not requested/Unavailable, מציג הסבר לפני opt-in, ומפנה ל־Open Settings כשהבקשה אינה זמינה. המדיניות ו־Review Notes עודכנו לתזכורות מקומיות ללא push token. | אין עוד prompt אוטומטי או סטטוס מטעה; נותר לאמת את התנהגות iOS/Android בבינארי. | לבדוק allow/deny/change, חזרה מ־Settings, שפה, logout והקשה על תזכורת ב־TestFlight/device. | S |
| BRAND-01 | P1 | נכשל | binary נקרא Champo, אך landing page, legal, Sentry project ו־review notes עדיין League Champion; package נקרא `league`. | בלבול reviewer/משתמש, אמון נמוך ו־metadata לא עקבי. | לבצע inventory של כל string, URL, email, deep link, dashboard/project name ונכס חנות; להחליף רק היכן שנדרש ולשמור redirects. | S–M |
| AUTH-01 | P1 | נכשל | `AuthLegalLinks.tsx` קיים אך לא משולב ב־`AuthScreen`; אין קישורי Privacy/Terms במסך signup. בחירת שפה זמינה רק לאחר login והברירה היא English. | שקיפות נמוכה לפני יצירת חשבון; onboarding עברי חלש. | להציג קישורים גלויים ותמצית הסכמה לפני Sign up; לבחור שפה לפי locale ולאפשר החלפה במסך הראשון. | S–M |
| AI-01 | P1 | תוקן בקוד / E2E חסר | כרטיס AI זמין רק כשיש summary, שני scores תקינים ו־`ai_generated_at` תקין. נתונים חלקיים מציגים “לא זמין” ללא score; 0:0 אמיתי נשמר. מוצגים זמן עדכון וגילוי נאות דו־לשוני שהניתוח עשוי לטעות ואינו ייעוץ הימורים. placeholder ה־PRO אינו מציג עוד טקסט ניתוח מזויף. | הסיכון לתחזית מזויפת נסגר ברמת ה־UI וה־resolver. timeout/provider failure והתרעננות נתונים עדיין לא נבדקו מול השירות החי. | לבצע E2E ל־success/no-data/timeout/error בעברית ובאנגלית ולוודא ש־`ai_generated_at` נכתב בכל generation מוצלח. | S |
| A11Y-01 | P1 | תוקן חלקית / QA native חסר | light primary שונה ל־`#7A5800` וכל semantic text tokens נבדקים אוטומטית ל־4.5:1. `Text` מאפשר Dynamic Type עד 2×; טקסטים זעירים מרכזיים הועלו; score inputs ופעולות מרכזיות הם 44–48pt; נוספו VoiceOver labels/roles/states ל־tabs, avatars, leaderboard, league cards ופעולות נוספות; direction ומרכוז RTL חוזקו. | baseline נגישות טוב יותר וסיכוני contrast/touch מרכזיים נסגרו בקוד. ללא VoiceOver, AX5, Reduce Motion ומקלדת על build native אין ראיה למסע מלא. | לעבור AX Inspector ו־VoiceOver על שני מכשירים, AX5 בעברית/אנגלית, dark/light, portrait/landscape ומקלדת חיצונית. | M |
| I18N-01 | P1 | עבר חלקית | `Member Details` קיים באנגלית ובעברית ומשמש בכותרת המסך; audit של 565/565 מפתחות עבר. 29 calls דינמיים אינם ניתנים לאימות סטטי מלא. | הסיכון למפתח גולמי ירד; עדיין נדרשים smoke tests למסכים דינמיים ו־RTL. | להוסיף snapshot/smoke בעברית לכל route ולהפחית dynamic keys בהדרגה. | S |
| IOS-01 | P1 | תוקן בקוד / IPA לא אומת | `expo-image-picker` מוגדר עם Camera/Microphone=false ו־`expo-secure-store` עם Face ID=false. מפתחות Camera, Microphone, Face ID ו־Photo Add הוסרו מה־Info.plist native; נותר רק Photo Library עבור בחירת avatar. בחירת תמונה משתמשת ב־system picker ללא בקשת broad library permission מקדימה. | הרשאות שאינן חלק מהמסע הוסרו מה־config ומה־native project. artifact production עדיין עלול להשתנות בעקבות prebuild/plugins. | לבדוק את `Info.plist`, entitlements וה־PrivacyInfo מתוך ה־IPA החתום ולוודא שאין usage descriptions או capabilities מיותרים. | S |
| IAP-01 | P1 | לא אומת | ה־provider נופל מ־production key ל־test key. בסביבה המקומית נמצא רק `EXPO_PUBLIC_REVENUECAT_TEST_KEY`; EAS production secrets, offering, entitlement `PRO`, products, pricing, locales ו־webhook לא נבדקו. | build production יכול להתחבר ל־Test Store או להציג paywall ריק. | ב־production לא לאפשר fallback ל־test key; לאמת key לפי store, מוצרי Apple, subscription group, offering ו־webhook Sandbox/Production. | M |
| IAP-02 | P1 | עבר חלקית / לא אומת | Restore ו־Manage Subscription קיימים, sync server עם cooldown קיים. לא נבדקו purchase/cancel/renew/expire/billing retry/refund/duplicate webhook/offline על Sandbox. | entitlement עלול להישאר שגוי או לא להיפתח אחרי רכישה. | להריץ מטריצת Sandbox מלאה עם לפחות שני Apple IDs ו־webhook replay; לתעד idempotency ו־source of truth. | M |
| PERF-01 | P2 | נכשל | iOS export יצר Hermes bundle כ־11MB. קיימות תמונות רבות בגודל 1–2MB ומשפחות icon fonts מלאות. avatar נטען ב־quality 1 + base64 ללא resize. | startup, memory ו־upload איטיים, במיוחד במכשירים חלשים וברשת סלולרית. | למדוד cold start/memory ב־release; להמיר תמונות ל־WebP/HEIF היכן שאפשר; לבצע resize/compression native; לצמצם fonts/assets. | M |
| QA-02 | P2 | תוקן חלקית | ה־workflow מריץ typecheck, lint, audit:i18n, privacy audit, Expo Doctor, Jest ו־iOS bundle export לכל PR ו־push ל־main. React Doctor עודכן ל־v2 עם full history ו־commit status. coverage נשאר 56.72% lines ואין Detox/Maestro. | רוב הרגרסיות הסטטיות, היחידתיות ושגיאות bundling ייחסמו מוקדם; מסעות native עדיין אינם מכוסים. | להוסיף Maestro למסעות auth/league/prediction/delete ו־coverage thresholds מדורגים לאזורים קריטיים. | M–L |
| DEP-01 | P2 | תוקן חלקית / בדיקת רשת חסרה | התלות הישירה `expo-modules-core` הוסרה. בהרצה הנוכחית 17 בדיקות Expo Doctor עברו ושתי בדיקות חיצוניות לא אומתו בגלל חסימת רשת; `npm audit` עדיין מדווח על 1 high ו־14 moderate בכלל עץ התלויות. | לא נמצא כשל מקומי חדש; נותרו אימות package metadata וסיכון supply-chain/tooling. | להריץ Doctor ב־CI עם רשת, לבצע triage ידני ועדכוני patch ממוקדים; לא להשתמש ב־force/downgrade. | M |
| DB-01 | P2 | נכשל | `supabase/config.toml` מפנה ל־`./seed.sql`, אך הקובץ אינו קיים. | `supabase db reset` מאפס אינו ניתן לשחזור כפי שהוגדר. | להוסיף seed idempotent ונטול secrets או להסיר את ההפניה; להריץ reset נקי ב־CI. | S–M |
| DB-02 | P2 | לא אומת | לא נמצאה ראיה ל־PITR/backups, restore drill, DB alerts, quotas או ניטור job freshness. | תקלה או נתוני ספורט ישנים עלולים להימשך ללא גילוי. | לתעד RPO/RTO, להפעיל backups/PITR בהתאם לתוכנית, לבצע restore drill, alert על sync lag/error rate/DB saturation. | M |
| WEB-01 | P2 | תוקן חלקית | נוספה אסטרטגיית רוחב רספונסיבית ומרכוז יציב גם ב־RTL; smoke ב־1024×1366 עבר ללא runtime errors. `global.css` עדיין מסיר outlines. | חוויית tablet web השתפרה, אך ניווט מקלדת עלול להיות ללא focus indicator ברור. | להחזיר `:focus-visible` ברור ולבצע keyboard traversal. | S |
| PRIV-03 | P2 | נכשל | המדיניות מזכירה זכויות access/export, אך אין export עצמי או workflow תפעולי מזוהה; זמני retention כלליים בלבד ואין controller/legal basis מפורשים. | מענה GDPR/UK GDPR לא עקבי ולא ניתן להוכחה. | להגדיר DSAR workflow, export machine-readable, retention schedule, lawful bases, controller/contact, transfer safeguards ו־subprocessor list. | M + משפטי |
| IMG-01 | P2 | תוקן חלקית / לא אומת | מחיקת חשבון מוחקת מקומית את ה־avatar הנוכחי וקבצים ישנים לפי prefix. ה־bucket עדיין ציבורי לקריאה ו־constraints על MIME/size ב־production לא אומתו. | קבצים שלא תואמים לשיטת השמות או מגבלות upload חלשות עדיין עלולים לגרום לחשיפה/עלות. | לאמת deletion ב־Storage production; לשקול private/signed URLs; להוסיף MIME/size/image decode validation ו־orphan sweep תקופתי. | M |
| MAINT-01 | P3 | נכשל | שני מפתחות תרגום לא בשימוש, `componenets` typo, שם package `league`, Supabase CLI 2.105 כש־2.111 זמינה. Metro web גם דיווח על require cycle ב־layout/UI ועל props מיושנים של `shadow*` ו־`pointerEvents`. | רעש תחזוקתי, סיכון initialization בקצה ובלבול מיתוג. | cleanup ללא שינוי התנהגות לאחר ההשקה הקריטית; לשבור את ה־cycle ולהחליף APIs מיושנים. | S–M |

## אבטחה ו־Backend — מסקנה מפורטת

### מה עבר

- RLS פעיל בטבלאות המרכזיות.
- קריאת ליגות פרטיות מוגבלת לחברים/owner/admin; חיפוש לפי join code עובר ב־security-definer RPC שמחזיר מידע מוגבל.
- יצירה והצטרפות לליגה עוברות RPCs עם מגבלות תוכנית וקיבולת; direct insert נשלל ממשתמש רגיל.
- כתיבת ניחוש לאחר kickoff חסומה ברמת DB.
- `user_subscriptions` קריאה בלבד למשתמש; כתיבות מבוצעות עם service role.
- RevenueCat webhook בודק secret, ו־sync authenticated כולל cooldown אטומי.
- session של Supabase נשמר ב־MMKV מוצפן עם key אקראי ב־Keychain/Keystore; במקרה כשל המנגנון נכשל בצורה סגורה לזיכרון בלבד.
- 17 migrations מקומיות תואמות ל־production המקושר ו־DB lint נקי.

### מה עדיין דורש מבחן דינמי

יש להריץ suite עם שני משתמשים, שתי ליגות ו־tokens אמיתיים נגד סביבת staging: קריאת נתונים חוצת ליגה, שינוי owner/admin, שינוי subscription, שינוי `points`, שינוי `is_primary`, העלאת קובץ בשם של member אחר, invocation ישירה לכל Edge Function, ניסיונות rate-limit ו־requests סביב millisecond של kickoff. הבדיקה הסטטית מצאה את SEC-01 ו־DATA-01, ולכן אין להסתפק ב־RLS enabled כראיית אבטחה.

## UX, עיצוב ונגישות

### חוזקות

- היררכיה ויזואלית ברורה, CTA זהוב בולט ומסכי נתונים בעלי אופי.
- שפה עיצובית עקבית בין Home, matches, standings, profile ו־settings.
- shared components מרכזיים מספקים בדרך כלל אזורי מגע סביב 44pt ו־accessibility props בסיסיים.
- קיימים dark/light, Hebrew/English, skeletons, empty/error states ו־network banner.
- מסך sign-in ב־390×844 היה נקי, קריא ולא נשבר ב־smoke test.

### סיכונים

- במסכי טבלאות וסטטיסטיקה עדיין צריך לבדוק truncation בפועל ב־AX5, אף שהטקסטים הזעירים המרכזיים הוגדלו.
- contrast tokens עומדים כעת ב־4.5:1 בבדיקה אוטומטית; צבעים hardcoded במסכים שטרם נסקרו נשארים יעד ל־AX/visual audit.
- לא בוצע מסע מלא בעברית לפני login, ושפת ברירת המחדל היא English ללא locale detection.
- שינוי RTL מפעיל reload; יש לבדוק שמצב טופס/מסע לא הולך לאיבוד.
- iPad web ב־1024×1366 עבר לאחר התאמת max-width, hero, tabs וכרטיסים. native portrait/landscape עדיין לא אומת ולכן נשאר release gate.

### בדיקות נגישות חובה

- VoiceOver לפי סדר פוקוס בכל מסך, כולל tabs, score steppers, modal, charts ו־paywall.
- Dynamic Type ב־AX5 לפחות, עברית ואנגלית, portrait ו־landscape ב־iPad.
- Reduce Motion, Bold Text, Increase Contrast, grayscale ו־dark/light.
- keyboard traversal ב־iPad עם מקלדת חיצונית וב־web.
- כל icon-only action עם label/hint/state; alerts מודיעים על שינוי ולא מסתמכים רק על צבע.
- אזור מגע 44×44 לפחות וטקסט גוף מעשי 14–16pt ומעלה.

## מטריצת App Privacy מומלצת

יש לבחור **Yes, we collect data from this app**. המטריצה להלן היא ברירת מחדל שמרנית לפי הקוד וה־SDKs הנוכחיים; יש לאמת אותה מול payloads מה־IPA, הגדרות Sentry/RevenueCat ו־App Store Connect לפני Publish.

| Data Type ב־Apple | נאסף | Linked to User | Tracking | Purpose | ראיה / הערה |
|---|---|---|---|---|---|
| Contact Info — Name | כן | כן | לא | App Functionality | `public.users`, ספקי auth וכינויי ליגה. |
| Contact Info — Email Address | כן | כן | לא | App Functionality | Supabase Auth ופרופיל. |
| User Content — Photos or Videos | כן | כן | לא | App Functionality | avatar ב־Supabase Storage. |
| User Content — Other User Content | כן | כן | לא | App Functionality | שמות ליגה וכינויים. |
| User Content — Gameplay Content | כן | כן | לא | App Functionality | ניחושים, תוצאות ודירוגים במשחק החברתי. |
| Identifiers — User ID | כן | כן | לא | App Functionality, Analytics | UUID של Supabase נשלח כ־RevenueCat App User ID. |
| Purchases — Purchase History | כן | כן | לא | App Functionality, Analytics | RevenueCat מחייב disclosure; בגלל custom user ID הנתון ניתן לקישור למשתמש. |
| Usage Data — Product Interaction | כן | לא לפי config נוכחי | לא | Analytics, App Functionality | Sentry navigation tracing + Mobile Replay מתעדים אינטראקציות; `sendDefaultPii:false` והטקסט/תמונות/vectors masked. |
| Diagnostics — Crash Data | כן | לא לפי config נוכחי | לא | App Functionality | Sentry manifest; `sendDefaultPii:false`. |
| Diagnostics — Performance Data | כן | לא לפי config נוכחי | לא | App Functionality | traces sample 20%; Sentry manifest. |
| Diagnostics — Other Diagnostic Data | כן | לא לפי config נוכחי | לא | App Functionality | Sentry manifest. |
| Identifiers — Device ID | לא לפי הראיות | — | לא | — | אין IDFA/ATT, attribution integration או RevenueCat advertising identifier. |
| Location / Contacts / Health / Financial Info / Browsing / Search / Sensitive Info | לא | — | לא | — | לא נמצאה גישה בקוד. Apple receipt אינה Financial Info; היא Purchase History. |

**Tracking:** לא נמצאה פעילות tracking across apps/sites ולא נמצא שימוש ב־IDFA, ולכן ATT אינו נדרש לפי הראיות הנוכחיות. אם יופעלו attribution/ads/integrations בעתיד, יש לעדכן את ה־labels וה־ATT לפני שחרור.

יש ליישר ארבע שכבות בדיוק: (1) התנהגות האפליקציה, (2) מדיניות הפרטיות, (3) Privacy Manifests ממוזגים בבינארי, (4) App Privacy ב־App Store Connect. Apple דורשת לכלול גם את מה שאוספים צדדים שלישיים; RevenueCat עצמה מציינת ש־Purchase History חובה, ושימוש ב־custom App User ID מחייב בדרך כלל User ID ו־Linked.

## משפטי, פרטיות והפצה עולמית

לפני השקה עולמית יש להשלים:

- זהות בעל המידע/controller, כתובת ופרטי קשר פעילים.
- lawful basis לכל מטרה, קטגוריות data, recipients/subprocessors והעברות בינלאומיות.
- retention schedule מספרי או קריטריונים ברורים לכל account, logs, predictions, avatars, subscriptions, support ו־backups.
- תהליך access/rectification/erasure/restriction/objection/portability ומענה מתועד; GDPR ו־UK GDPR כוללים זכויות מחיקה וניידות מידע.
- גיל מינימום אחיד בין onboarding, policy, terms ו־Age Rating. האפליקציה אינה Kids app.
- גילוי נאות ש־AI הוא preview בידורי, עשוי לטעות ואינו עצת הימורים; מידע ספורט עשוי להיות מושהה.
- אישור זכויות להצגת לוגואים, שמות קבוצות, fixtures, תמונות ונתוני ספק בכל 175 storefronts שנבחרים. App Store Connect דורש Content Rights.
- DSA trader status: בגלל מנוי בתשלום קיימת אינדיקציה חזקה לפעילות מסחרית; יש לבצע self-assessment משפטי. אם trader, Apple תציג כתובת/טלפון/email ותדרוש אימות.
- תמיכה פעילה בעברית ובאנגלית, SLA לדיווח UGC וכתובת support אמיתית.

## Apple, build ו־binary audit

### עבר

- `usesAppleSignIn:true` ו־Sign in with Apple מוצג לצד Google ב־iOS.
- `usesNonExemptEncryption:false` מוגדר; יש לאשר שהאפליקציה משתמשת רק בהצפנה פטורה/סטנדרטית לפני מענה export compliance.
- iOS JS/Hermes export הושלם.
- icon שנוצר בעץ native המקומי הוא 1024×1024 ללא alpha, אף שקובץ המקור גדול יותר ובעל ערוץ alpha.
- RevenueCat paywall, restore ו־manage subscription קיימים בקוד.

### לא אומת וחייב לעבור מה־IPA הסופי

- archive חתום ב־Distribution, provisioning, APNs environment ו־Sign in with Apple entitlement.
- Info.plist ללא Camera/Microphone/Face ID/Photo Add אם אינם בשימוש.
- PrivacyInfo.xcprivacy ממוזג, signatures של required SDKs והיעדר warnings ב־App Store upload.
- icon בכל appearance, splash, display name, version/build, URL schemes ו־deep links.
- install נקי ושדרוג TestFlight על iOS 15.4 ועל iOS/iPadOS העדכניים.
- login Apple/Google במכשיר אמיתי, email verification ו־password reset דרך `champo://resetPassword`.
- paywall production מציג title, duration, localized price, renewal terms, Privacy ו־Terms; restore עובד.
- Sentry symbols/source maps והפרדת environment/release.

## נכסי App Store ו־metadata מוצעים

### שדות מוצעים

| שדה | English | עברית |
|---|---|---|
| Name | Champo | Champo |
| Subtitle | Football Prediction Leagues | ליגות ניחושי כדורגל |
| Primary Category | Sports | ספורט |
| Secondary Category | Games — Sports | משחקים — ספורט |
| Keywords | `football,soccer,predictions,league,friends,scores,fixtures,leaderboard,champions` | `כדורגל,ניחושים,ליגה,חברים,תוצאות,משחקים,טבלה,אלופות` |
| Support URL | `https://champoapp.com/support` | אותו URL עם locale או עמוד דו־לשוני |
| Marketing URL | `https://champoapp.com` | אותו URL |
| Privacy URL | `https://champoapp.com/privacy` | URL מקומי או עמוד דו־לשוני |
| Privacy Choices URL | `https://champoapp.com/privacy-choices` | אותו URL |

### תיאור קצר מוצע באנגלית

> Champo turns every football match into a competition with friends. Create or join private prediction leagues, submit exact-score picks before kickoff, follow fixtures and standings, and climb the leaderboard. Explore supported domestic and international competitions, review your prediction stats, and unlock more leagues, competitions, and AI match previews with Champo PRO. Predictions are for entertainment only; no betting or real-money prizes.

### תיאור קצר מוצע בעברית

> Champo הופכת כל משחק כדורגל לתחרות עם חברים. יוצרים או מצטרפים לליגת ניחושים פרטית, שולחים ניחוש תוצאה לפני שריקת הפתיחה, עוקבים אחר משחקים וטבלאות ומטפסים בדירוג. אפשר לצפות בסטטיסטיקות אישיות, לעקוב אחר תחרויות מקומיות ובינלאומיות ולפתוח ליגות, תחרויות וניתוחי משחק מבוססי AI עם Champo PRO. הניחושים מיועדים לבידור בלבד; אין הימורים או פרסים כספיים.

### תוכנית צילומי מסך

Apple מאפשרת 1–10 screenshots לכל גודל. עבור יעד ההשקה שנבחר יש להכין לפחות:

- 6.9″ portrait: 1290×2796 או אחת המידות המאושרות המקבילות.
- iPad 13″ portrait: 2064×2752 או 2048×2732; להוסיף landscape אם החוויה נתמכת.
- סט נפרד English ו־Hebrew, ללא ערבוב שפות.
- מומלץ 6 פריימים: My Leagues, Create/Join, Match + Prediction, Fixtures/Stages, Leaderboard, Stats/Profile + PRO/AI.
- overlay copy קצר ולא מטעה; אין להציג פיצ'ר שלא קיים או מחיר קשיח שאינו מחיר storefront.
- ללכוד מ־TestFlight production-like data, ללא אימיילים/קודים/משתמשים אמיתיים.

## Review Notes מוכנים להדבקה

יש להדביק רק לאחר החלפת כל ה־placeholders ואחרי שהדומיין, החשבון והמנוי נבדקו:

```text
Champo is a social football score-prediction app. Users create or join private leagues, submit exact-score predictions before kickoff, and compare leaderboard results. There is no betting, wagering, cash entry, or real-money prize.

REVIEW ACCOUNT
Email: [APP_REVIEWER_EMAIL]
Password: [APP_REVIEWER_PASSWORD]
The account is email-verified and belongs to an active private league with sample members, scheduled matches, completed predictions, and leaderboard history.

CORE REVIEW PATH
1. Sign in with the review account.
2. Open My Leagues and select the primary league.
3. Open Matches, select a scheduled match, and create or edit a prediction before kickoff.
4. Open Rank and Stats to review scoring and history.
5. Open Settings > Subscription to view Champo PRO and Restore Purchases.
6. Open Settings > Delete Account to access in-app account deletion.

SUBSCRIPTIONS
Champo PRO is an auto-renewable subscription fulfilled through Apple In-App Purchase and RevenueCat. It unlocks additional leagues, league sizes, competitions, and AI match previews. Restore Purchases is available in Settings > Subscription. Manage Subscription opens Apple's subscription management page.

AI MATCH PREVIEWS
The match detail screen may show an AI-generated sports preview based on current public match/team information. It is clearly labeled, may be unavailable when source data is insufficient, and is provided for entertainment only. It does not provide betting odds, gambling advice, or guaranteed outcomes.

NOTIFICATIONS
Champo uses local notifications only for upcoming-match reminders. It does not register for or collect remote push notification tokens. Permission is requested in context when the user enables reminders and can be managed from Settings.

USER CONTENT AND SAFETY
League names, nicknames, and profile images are user-generated. Users can report content/users, block content, leave a league, and league owners can remove members. Reports are reviewed through our moderation process at https://champoapp.com/support.

ACCOUNT DELETION
Settings > Delete Account permanently deletes the account and associated personal data, revokes Sign in with Apple authorization where applicable, and explains that deleting an account does not cancel an active Apple subscription.

LINKS
Privacy Policy: https://champoapp.com/privacy
Terms of Service: https://champoapp.com/terms
Support: https://champoapp.com/support
Privacy Choices: https://champoapp.com/privacy-choices

If a scheduled fixture has already kicked off during review, please select another future fixture. The backend and sample league will remain available throughout the review period.
```

## מטריצת תרחישי קבלה

| תרחיש | סטטוס נוכחי | תנאי מעבר |
|---|---|---|
| install נקי על iPhone קטן/גדול | לא אומת | launch ללא crash, splash תקין, onboarding מלא. |
| upgrade דרך TestFlight | לא אומת | session, theme, language ו־primary league נשמרים; migrations מקומיות תקינות. |
| iPad portrait/landscape | עבר חלקית / native לא אומת | baseline רספונסיבי ו־smoke web 1024×1366 עברו; כל המסעות עדיין חייבים לעבור native ללא שטחים חריגים/truncation. |
| English/Hebrew + RTL | עבר חלקית | כל route, alerts, dates, football stages ו־paywall מקומיים; אין key גולמי. |
| dark/light | עבר חלקית | ניגודיות תקינה וללא hardcoded colors בכל מסך. |
| VoiceOver/Dynamic Type | עבר סטטית / native לא אומת | קיימים scaling defaults ו־labels/roles/states מרכזיים; נדרש AX audit מלא, focus order ו־AX5 ללא חסימת פעולה. |
| email signup + verification | לא אומת E2E | קוד/קישור, resend, expiry, offline ושגיאות ברורות. |
| Apple login | לא אומת native | login ראשון/חוזר, Hide My Email, logout, deletion + revoke. |
| Google login | לא אומת native | login/cancel/error/logout ו־Apple option נשאר זמין. |
| reset password | לא אומת | deep link מ־cold/warm state וסיסמה חדשה עובדת. |
| create/join league FREE/PRO | עבר חלקית | UI + DB limits, capacity, duplicate, invalid code, concurrency. |
| leave/owner transfer/delete league | לא אומת | אין orphan owner; primary membership מתעדכן אטומית. |
| cross-user/cross-league RLS | לא אומת דינמית | כל קריאה/כתיבה זדונית מחזירה 401/403/0 rows. |
| prediction before kickoff | נכשל אבטחתית | רק score fields ניתנים לכתיבה; `points` וכל owner fields מוגנים. |
| lock בדיוק ב־kickoff | עבר סטטית / לא אומת דינמית | server time הוא source of truth; tests לפני/בדיוק/אחרי. |
| scoring consistency | לא אומת | exact/result/miss, corrections, postponed/abandoned, duplicate finish event. |
| PRO purchase Sandbox | לא אומת | purchase, entitlement, DB sync ו־UI נפתחים פעם אחת. |
| cancel/renew/expire/refund/grace | לא אומת | entitlement עקבי בכל מעבר ומכשיר. |
| restore purchases | עבר בקוד / לא אומת | reinstall, משתמש חדש/ישן, Apple ID זהה/שונה. |
| duplicate/late RevenueCat webhook | לא אומת | idempotent, אין downgrade מאירוע ישן, alert בשגיאה. |
| offline subscription | עבר חלקית | cached entitlement לא נפתח למשתמש אחר; הודעה ברורה. |
| notification allow/deny/change | עבר בקוד / לא אומת במכשיר | status אמיתי, pre-prompt, Open Settings וסנכרון reminders הוטמעו; נדרש device/TestFlight QA. |
| notification language/logout/tap | עבר בקוד / לא אומת | reschedule בשפה, cancel ב־logout, deep link נכון. |
| AI success עברית/אנגלית | עבר סטטית | תוכן מסומן, מקורות/זמן, ללא odds/guarantees. |
| AI timeout/provider error/no data | עבר בקוד / provider E2E חסר | Unavailable state קיים; אין 0:0 מזויף או blank card. נדרש timeout/error מול ספק חי. |
| account deletion מלאה | נכשל | DB/Auth/Storage/Apple token נמחקים; billing מוסבר; audit log לא מכיל PII מיותר. |
| signed production IPA | לא אומת | upload ללא privacy/SDK/entitlement warnings; install/TestFlight תקין. |
| App Review reviewer account | לא אומת | account יציב, data קיים, credentials פעילים לכל זמן הביקורת. |

## Checklist להגשה

### חוסם הגשה — חובה לסגור לפני build candidate

- [ ] SEC-01: להגן על שדות הניקוד ולהוסיף adversarial DB tests.
- [ ] PRIV-01: מחיקה מלאה, Apple revoke, avatar cleanup והסבר מנוי.
- [ ] UGC-01: report/block/moderation/contact פעילים.
- [ ] `champoapp.com` פעיל ב־HTTPS עם Privacy/Terms/Support/Choices בשתי שפות.
- [ ] כל League Champion/placeholder URL/email הוחלף או הופנה באופן תקין.
- [ ] החלטת iPad מיושמת; לפי היקף זה — QA והתאמת iPad, לא הסרת התמיכה.
- [x] Jest ירוק: 450/450; TypeScript, lint, i18n, privacy ו־iOS bundle export ירוקים.
- [ ] להריץ Expo Doctor עם גישת רשת ולוודא 19/19 לפני build candidate.
- [x] Privacy Manifest ומטריצת App Privacy תואמים לקוד ול־SDK manifests המקומיים.
- [ ] להפיק Xcode Privacy Report מה־IPA ולהזין את המטריצה ב־App Store Connect.

### חובה לפני השקה

- [ ] EAS production build ללא test RevenueCat fallback.
- [ ] TestFlight clean install + upgrade על iPhone קטן/גדול ו־iPad.
- [ ] Sandbox IAP matrix מלאה ו־webhook replay.
- [ ] Apple/Google/email/reset flows במכשיר אמיתי.
- [ ] VoiceOver, Dynamic Type, contrast, RTL, dark/light.
- [ ] notification permission/status/docs תואמים בקוד; נדרש אימות TestFlight של allow/deny/change.
- [x] AI unavailable, זמן עדכון וגילוי נאות ללא 0:0 מזויף.
- [ ] AI provider timeout/error E2E ותוקף freshness ב־production.
- [ ] שני משתמשים/שתי ליגות: RLS ו־business rules adversarial.
- [ ] cron, monitoring, backup/PITR ו־restore drill מתועדים.
- [ ] store metadata EN/HE, content rights, age rating, encryption, DSA trader status.
- [ ] צילומי 6.9″ ו־iPad 13″ בשתי שפות, icon ו־subscription artwork/metadata.
- [ ] reviewer account + review notes נבדקו יום לפני Submit.
- [ ] Sentry release/symbols/environment ו־alerts מופעלים.

### אפשר לאחר 1.0 אם אין regression

- [ ] העלאת line coverage מדורגת מעל 70% והרחבת E2E.
- [ ] אופטימיזציית bundle/fonts/assets ותמונות profile.
- [ ] cleanup של dead translations, typo directories ושם package.
- [ ] שיפור web/tablet רחב מעבר למסכי ההגשה.
- [ ] dashboards מוצריים, funnel ו־A/B של onboarding/paywall ללא tracking לא מוצהר.

## סדר פעולות מומלץ עד העלאה

### שלב 1 — אבטחה וציות, 2–5 ימים

1. תיקון SEC-01 ו־DATA-01 עם migration ובדיקות שני משתמשים.
2. פריסת delete-account שכבר תוקן מקומית, הגדרת secrets והרצת E2E ל־Apple, Storage, RevenueCat ואנונימיזציית DB.
3. UGC report/block/moderation.
4. הפעלת domain, מסמכים משפטיים ותיקון מיתוג/התראות/AI.

**Exit criteria:** אין P0 קוד/משפטי פתוח, DB tests ירוקים וה־URLs חיים.

### שלב 2 — release hardening, 3–7 ימים

1. triage לתלויות שנותרו והרחבת CI ל־native E2E/export.
2. notification device QA, AI empty/error state, auth legal/language.
3. iPad responsive native + accessibility + RTL/light/dark.
4. performance pass ותמונות.

**Exit criteria:** candidate build עובר automated gates ו־device matrix ללא P1 פתוח.

### שלב 3 — מסחר ובינארי, 2–4 ימים

1. RevenueCat + App Store IAP production, Sandbox lifecycle ו־webhooks.
2. EAS production archive, IPA inspection, Privacy Manifest ו־Sentry symbols.
3. clean install/upgrade TestFlight וחשבון reviewer.

**Exit criteria:** כל שורת TestFlight/IAP/IPA מסומנת עבר עם ראיה.

### שלב 4 — Store Connect והגשה, 1–2 ימים

1. App Privacy, age rating, content rights, encryption ו־DSA.
2. metadata, screenshots, subscription localization ו־URLs.
3. הדבקת Review Notes ובדיקה שה־backend/sample data יישארו פעילים.
4. Submit, ניטור App Review/Sentry/Supabase ויכולת תגובה מהירה.

## החלטת Go/No-Go

**NO-GO נכון ל־1 באוגוסט 2026.**

אפשר לשנות ל־**GO** רק כאשר:

- כל P0 נסגר ונבדק מחדש;
- אין P1 פתוח שמשפיע על אבטחה, תשלום, מחיקה, iPad, accessibility או App Review;
- automated suite ירוק;
- TestFlight production candidate עבר את מטריצת המכשירים והמסעות;
- App Store Connect, RevenueCat, Privacy Labels, DSA ו־IAP אומתו בפועל;
- הדומיין, המדיניות, התמיכה וחשבון reviewer פעילים.

לפי מצב הקוד הנוכחי, הערכת עבודה ריאלית היא **כשבועיים ממוקדים** לצוות קטן, בתוספת זמן משפטי וזמני Apple. אין צורך לבנות מחדש את המוצר; נדרש סבב hardening ותפעול השקה ממושמע.

## מקורות רשמיים

- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Apple — Offering account deletion in your app](https://developer.apple.com/support/offering-account-deletion-in-your-app/)
- [Apple — Manage App Privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/)
- [Apple — App Privacy data types](https://developer.apple.com/app-store/app-privacy-details/)
- [Apple — Third-party SDK privacy requirements](https://developer.apple.com/support/third-party-SDK-requirements/)
- [Apple — Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)
- [Apple — App information requirements](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information)
- [Apple — Age rating](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/)
- [Apple — EU DSA trader requirements](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/)
- [Apple — Auto-renewable subscriptions](https://developer.apple.com/app-store/subscriptions/)
- [RevenueCat — Apple App Privacy](https://www.revenuecat.com/docs/platform-resources/apple-platform-resources/apple-app-privacy)
- [European Commission — GDPR rights](https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en)
- [ICO — UK GDPR right to erasure](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-erasure/)
- [ICO — UK GDPR data portability](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-data-portability/)
