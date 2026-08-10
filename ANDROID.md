# Shokok — Android build (Capacitor)

The Android app ships the same offline web app inside a Capacitor WebView.
No server, no network: fonts, icons and data (IndexedDB) are all local.

## Requirements

- Node 20+ and Bun
- Android Studio (Giraffe or newer) with Android SDK 34+
- JDK 17

## 1. Install dependencies

```bash
bun install
```

## 2. Build the offline web bundle

```bash
bun run build:android
```

Outputs a static bundle into `dist-android/` (hash routing, self-hosted Cairo
fonts, no service worker).

## 3. Add the Android platform (first time only)

```bash
bunx cap add android
```

## 4. Sync the bundle into Android

```bash
bun run android:sync      # build:android + cap sync android
```

Run this again after every code change.

## 5. Generate app icons and splash screens

Source images live in `resources/` (`icon.png`, `splash.png`).

```bash
bun run android:assets
```

## 6. Run or build the APK

```bash
bun run android:open      # opens Android Studio
```

In Android Studio: Run ▶ to install on a device/emulator, or
**Build > Build Bundle(s)/APK(s) > Build APK(s)** for a debug APK.

Release build from the CLI:

```bash
cd android
./gradlew assembleRelease      # APK
./gradlew bundleRelease        # AAB for Play Store
```

Sign the release with your own keystore (`android/app/build.gradle` →
`signingConfigs`).

## Notes

- App id: `com.shokok.app`, app name: `Shokok`.
- Arabic RTL is the default; language and theme are stored in IndexedDB.
- PDF report export uses the WebView print dialog (Android print → Save as PDF).
- Everything works with the device fully offline after installation.
