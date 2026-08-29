# תסריט בדיקה למכשיר אמיתי — לפני העלאה ל‑App Store

תאריך: 2026-08-28 · בילד: production (`eas build --profile production`) · מכשיר: iPhone אמיתי (לא סימולטור)

> חלק מהבדיקות (Push, מודרציה, reset password) **חייבות מכשיר אמיתי + שרת פרוס**. סמן `[x]` תוך כדי.
> אם משהו נכשל — רשום בעמודת "ממצא" ואל תגיש עד שיירוק.

### פרטי סבב הבדיקה (מלא לפני שמתחילים)

| שדה | ערך |
|-----|-----|
| דגם מכשיר | iPhone ___________ |
| גרסת iOS | ___________ |
| מקור בילד | TestFlight build # ___________ |
| runtimeVersion | 1.0.0 |
| שפה שנבדקה | he / en (סמן) |
| נבדק ע"י | ___________ |
| תאריך סבב | ___________ |

### מקרא עמודת "אימות"

- 🔍**DB** — ניתן לאמת מול Supabase דרך MCP/SQL (`run_sql` על `keuavfvgwhwckqordjbp`), לא רק בעין.
- 📋**Logs** — ניתן לאמת מול Edge Function Logs בדשבורד (event `function.request_failed` / הצלחה).
- 👁 — בדיקה ויזואלית במכשיר בלבד.

שאילתות DB מוכנות לשורות המסומנות 🔍 נמצאות בנספח בתחתית.

---

## 0. תנאי סף לפני הבדיקה (חובה לוודא שבוצעו)

- [ ] `supabase functions deploy send-match-reminders --no-verify-jwt` הורץ, והפונקציה מציגה `verify_jwt: false` 📋(אמת ב‑MCP `list_edge_functions`)
- [ ] מפתח APNs הוגדר (`eas credentials` → iOS → Push Notifications)
- [ ] Vault `sync_secret` == env `SYNC_SECRET` של הפונקציה (זהים)
- [ ] `GOOGLE_VISION_API_KEY` מוגדר + billing מקושר ל‑Google Cloud
- [ ] `champo://resetPassword` נמצא ב‑Supabase Auth → Redirect URLs
- [ ] `subscriptions_enabled = false` — גם EAS prod env וגם `app_config` 🔍DB
- [ ] הבילד הותקן ממקור production (TestFlight), לא dev client

---

## 1. Onboarding + Auth

| # | צעד | צפוי | סטטוס | ממצא |
|---|-----|------|:-----:|------|
| 1.1 | הרשמה עם אימייל חדש | חשבון נוצר, מסך verify email | [ ] | |
| 1.2 | אימות אימייל (deep link מהמייל) | האפליקציה נפתחת ומאמתת | [ ] | |
| 1.3 | Sign in with Apple | התחברות מצליחה | [ ] | |
| 1.4 | Sign in with Google | התחברות מצליחה | [ ] | |
| 1.5 | **Reset password** — בקש איפוס, פתח את הלינק מהמייל | האפליקציה נפתחת דרך `champo://resetPassword`, מאפשר סיסמה חדשה | [ ] | |
| 1.6 | Logout | חזרה למסך הכניסה; `notification_token` נמחק (ראה 4.4) | [ ] | |

## 2. ליגות (Free 1.0 — ללא paywall)

| # | צעד | צפוי | סטטוס | ממצא |
|---|-----|------|:-----:|------|
| 2.1 | יצירת ליגה | נוצרת, הופכת primary 🔍DB | [ ] | |
| 2.2 | הצטרפות לליגה עם קוד | הצטרפות מצליחה 🔍DB | [ ] | |
| 2.3 | ליגה מלאה | הודעה "This league is full." (**בלי** "Upgrade") | [ ] | |
| 2.4 | ניווט בין טאבים אחרי כניסה לליגה | טעינה מיידית, ללא spinner ארוך (warm start) | [ ] | |
| 2.5 | **אין שום אזכור של Season Pass / Pro / רכישה** בכל האפליקציה | לא קיים | [ ] | |

## 3. משחקים + ניחושים + מודרציה

| # | צעד | צפוי | סטטוס | ממצא |
|---|-----|------|:-----:|------|
| 3.1 | טאב Matches — נטען | תצוגה נכונה לפי תחרות | [ ] | |
| 3.2 | פתיחת פרטי משחק | header מיידי, טאבים עובדים | [ ] | |
| 3.3 | שמירת ניחוש לפני kickoff | נשמר, מוצג נכון בפתיחה חוזרת 🔍DB | [ ] | |
| 3.4 | ניסיון ניחוש אחרי kickoff | חסום (נעול) 👁 | [ ] | |
| 3.5 | **העלאת אווטאר תקין** | עובר מודרציה, נשמר, מוצג 📋Logs | [ ] | |
| 3.6 | **העלאת אווטאר בעייתי** (לבדיקת SafeSearch) | נדחה בהודעה, לא נשמר 📋Logs | [ ] | |

## 4. Push Notifications (iOS בלבד — הקריטי)

| # | צעד | צפוי | סטטוס | ממצא |
|---|-----|------|:-----:|------|
| 4.1 | הפעלת התראות בהגדרות האפליקציה | בקשת הרשאה מ‑iOS, אישור 👁 | [ ] | |
| 4.2 | ודא ב‑DB: `users.notification_token` נכתב למשתמש | טוקן קיים 🔍DB | [ ] | |
| 4.3 | **קבלת התראת תזכורת** ~60 דק' לפני משחק בליגה הראשית | push מגיע למכשיר 📋Logs 🔍DB | [ ] | |
| 4.4 | Logout → בדוק DB | `notification_token` = null 🔍DB | [ ] | |
| 4.5 | ביטול הרשאה ברמת iOS | הטוקן נמחק בפתיחה הבאה 🔍DB | [ ] | |

> **בדיקה מהירה של 4.3 בלי לחכות למשחק אמיתי:** הרץ ידנית `select net.http_post(...send-match-reminders...)` עם ה‑`x-sync-secret`, או `supabase functions invoke send-match-reminders` עם ה‑header. אם חוזר 401 → הבאג של `verify_jwt` עדיין קיים. אם 200 ואין קריסה → תקין. לבדיקת קצה־לקצה, כוונן זמנית `kick_off` של משחק לחלון ה‑~60 דק' וודא שה‑`match_push_reminders` נכתב (idempotency).

## 5. Stats / Leaderboard / Profile

| # | צעד | צפוי | סטטוס | ממצא |
|---|-----|------|:-----:|------|
| 5.1 | טאב Stats | נתונים נכונים | [ ] | |
| 5.2 | Leaderboard (Friends / All) | דירוג נכון, toggle עובד | [ ] | |
| 5.3 | Rank tab | תצוגה תקינה | [ ] | |
| 5.4 | Report user + Block/Unblock | פועל; BlockedUsers מתעדכן | [ ] | |

## 6. שפה + RTL + Theme

| # | צעד | צפוי | סטטוס | ממצא |
|---|-----|------|:-----:|------|
| 6.1 | מעבר לעברית | כל הטקסטים מתורגמים, אין מפתחות גולמיים | [ ] | |
| 6.2 | פריסת RTL | יישור/כיוון נכונים בכל המסכים | [ ] | |
| 6.3 | Light / Dark theme | שני המצבים תקינים (זכור: iOS מאלץ dark על alerts/keyboard) | [ ] | |

## 7. משפטי / חשבון

| # | צעד | צפוי | סטטוס | ממצא |
|---|-----|------|:-----:|------|
| 7.1 | Terms + Privacy במסך ההגדרות | נפתחים, **בלי** Season Pass | [ ] | |
| 7.2 | Help / FAQ | ללא סעיף "Subscription & Premium" | [ ] | |
| 7.3 | **Delete account** | מוחק/מאנונימז את החשבון, מנתק 🔍DB | [ ] | |

---

## סבב אחרון לפני `submit:ios`

- [ ] אין קריסות בכל הזרימות למעלה
- [ ] כל תנאי הסף בסעיף 0 ירוקים
- [ ] `npx tsc --noEmit` → exit 0
- [ ] `node scripts/audit-ios-privacy.cjs` → passed
- [ ] `node scripts/audit-i18n.cjs` → exit 0
- [ ] מספר גרסה/בילד תקינים (`autoIncrement` יטפל ב‑buildNumber)

**רק כשהכל ירוק:** `npm run submit:ios`

---

## נספח — שאילתות אימות (Supabase MCP `run_sql`, project `keuavfvgwhwckqordjbp`)

> החלף `TEST_USER_ID` / `LEAGUE_CODE` בערכי הסבב. שמות עמודות אומתו מול `database.types.ts`.

**סעיף 0 — flags:**
```sql
-- subscriptions חייב false
select subscriptions_enabled from app_config;
```

**2.1 / 2.2 — חברות בליגה:**
```sql
select lm.user_id, lm.is_primary, lm.active, l.name, l.competition_id
from league_members lm
join leagues l on l.id = lm.league_id
where lm.user_id = 'TEST_USER_ID';
```

**3.3 — ניחוש נשמר:**
```sql
select id, match_id, home_score, away_score, points
from predictions
where league_member_id in (
  select id from league_members where user_id = 'TEST_USER_ID'
)
order by created_at desc limit 5;
```

**4.2 — טוקן נכתב אחרי הפעלת התראות:**
```sql
select id, notification_token is not null as has_token
from users where id = 'TEST_USER_ID';
```

**4.3 — התראה נשלחה (idempotency):**
```sql
-- אחרי הרצת send-match-reminders: אמור להופיע rows חדשים
select match_id, recipient_count, sent_at
from match_push_reminders
order by sent_at desc limit 10;
```

**4.4 / 4.5 — הטוקן נמחק אחרי logout / ביטול הרשאה:**
```sql
select id, notification_token from users where id = 'TEST_USER_ID';
-- notification_token אמור להיות null
```

**7.3 — מחיקת חשבון (אנונימיזציה):**
```sql
-- אחרי delete account — הרשומה מאונונמזת/מוסרת (ראה migration anonymize_deleted_accounts)
select id, email, display_name, notification_token
from users where id = 'TEST_USER_ID';
```

**בדיקה ידנית של הפונקציה (במקום להמתין למשחק):**
```bash
supabase functions invoke send-match-reminders --no-verify-jwt --header "x-sync-secret: $SYNC_SECRET"
```
תשובת 401 → באג ה‑`verify_jwt` עדיין קיים. 200 → תקין.

