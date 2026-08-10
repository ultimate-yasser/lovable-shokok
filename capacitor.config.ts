import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.shokok.app",
  appName: "Shokok",
  // Static, fully offline bundle produced by `bun run build:android`.
  webDir: "dist-android",
  android: {
    allowMixedContent: false,
    backgroundColor: "#f6faf8",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#1f8f86",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#1f8f86",
    },
  },
};

export default config;
