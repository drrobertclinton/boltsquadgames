# Bolt Squad app (iPhone, iPad, Android)

The store apps wrap the same game as boltsquadgames.com. `npm run sync` copies `../index.html` into `www/`, swaps the CDN files for local copies so the app works offline, removes the web-only "beta" and "at launch" price notes, and copies everything into the Android and iOS projects.

- App ID: `com.vilasi.boltsquad`, name "Bolt Squad", version 1.1.0 (Android versionCode 7, iOS build 5). 1.1 adds paid photo passes: see store/LISTING.md "Version 1.1"
- Capacitor 8. Android targets SDK 36. iOS 15+, iPhone and iPad.
- The app serves itself as `boltsquadgames.com` (see `capacitor.config.json`), so cloud saves, the leaderboard, face pictures and the Idea Box work exactly like the website. That also means **a simulator or test phone writes to the live leaderboard**: hide any test players afterwards.
- Store text, age rating and privacy answers: `store/LISTING.md`. Screenshots and icons: `store/`.

## Build on the Mac

```
cd boltsquadgames/app
npm install
npm run sync
```

**Android (Google Play, Vilasi, Inc.)**
1. `npx cap open android`, then in Android Studio: Build > Generate Signed App Bundle.
2. First time only: create a new upload key and keep it with the other app keys in `~/Desktop/Vilasi App Readiness/Bolt Squad/`. Never lose it.
3. Play Console > Create app "Bolt Squad" (Game, Free) > Testing > Internal testing > upload `android/app/release/app-release.aab`.

**iPhone and iPad (Apple Developer, Vilasi org)**
1. `npx cap open ios`, select the App target > Signing & Capabilities > Team: Vilasi, Inc. (automatic signing registers the bundle ID).
2. Product > Archive > Distribute App > App Store Connect > Upload.
3. App Store Connect > Apps > + New App "Bolt Squad", bundle `com.vilasi.boltsquad`, SKU `boltsquad`.

For each new version, bump `versionCode`/`versionName` in `android/app/build.gradle` and the build number in Xcode.

## Regenerating icons and splash
Art lives in `assets/` (made from `resources/icon.png`). Run `npm run assets`.
