# ORGROOM Android Version

This ORGROOM build is Android-ready as an installable Progressive Web App (PWA).

## What is included

- Android-style mobile layout for screens up to 800px wide.
- Native-app-style bottom navigation.
- Portrait-first mobile experience.
- Safe-area support for Android devices with gesture/navigation areas.
- 16px form controls to prevent Android browser zoom on inputs.
- Full-screen standalone display when installed from a supported browser.
- ORGROOM app icon, manifest, theme color, and offline shell cache.
- Existing desktop layout and reservation functionality are preserved.

## Install on Android

1. Run the ORGROOM system normally with `npm install` and `npm run dev`.
2. Make the ORGROOM frontend reachable from the Android phone on the same network.
3. Open the ORGROOM web address in Chrome on Android.
4. Use Chrome's **Install app** / **Add to Home screen** option.
5. Launch ORGROOM from the Android home screen. It opens in the standalone app-style layout.

For the backend/database features, the Android phone must be able to reach the ORGROOM API server. The existing API and database logic are intentionally unchanged.
