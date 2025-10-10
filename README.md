# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## FOOTBALL Api
1. League 
  - GET /leagues -> get season and metadata
2. Rounds -
  - GET /fixtures/rounds?league={id}&season={yyyy} → list rounds.
  - GET /fixtures/rounds?league={id}&season={yyyy}&current=true → current round.
3. By Round -
  - GET /fixtures?league={id}&season={yyyy}&round={Round Name}
4.  By Ids (max 20) -
  - GET /fixtures?ids=123-456-789
5. League Standings -
  - GET /standings?league={id}&season={yyyy}
6. Teams
  - GET /teams?league={id}&season={yyyy}
7. Live & post-match details
  - GET /fixtures/events?fixture={fixtureId} --> (goals, cards, subs).
  - GET /fixtures/lineups?fixture={fixtureId} --> (XI & benches).
  - GET /fixtures/players?fixture={fixtureId} --> (per-player stats for that match).
  App boot / daily cron (season + rounds cache)

/leagues → store currentSeason.

/fixtures/rounds?league&season&current=true&dates=true → store rounds, current_round, optional date ranges. 
api-football
+1

Matches page (filter by round)

When user selects a round: /fixtures?league&season&round.

Live pulse (matchday syncing)

Every 1–3 min around kickoffs:

/fixtures?date=YYYY-MM-DD to pull today’s fixtures for your 6 leagues, then

If you need richer UI for a visible match card, call events/lineups/players for those fixtureIds only. 
api-football

Finalize + scoring

Keep polling today’s fixtures until status becomes FT/AET/PEN (from /fixtures?...).

Once finished, mark predictions and compute points (your Edge Function).

If you need a cleanup pass, you can refetch by ids (batches of 20) to guarantee final stats. 