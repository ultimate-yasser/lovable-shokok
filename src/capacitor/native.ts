import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

/**
 * Native-only bootstrap for the Android (Capacitor) shell.
 * Safe no-op when the bundle runs in a normal browser.
 */
export function initNativeShell() {
  if (!Capacitor.isNativePlatform()) return;

  void StatusBar.setStyle({ style: Style.Dark }).catch(() => undefined);
  void StatusBar.setBackgroundColor({ color: "#1f8f86" }).catch(() => undefined);

  // Hardware back button: go back in history, exit only from the first screen.
  void App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack && window.history.length > 1) window.history.back();
    else void App.exitApp();
  });

  window.setTimeout(() => {
    void SplashScreen.hide().catch(() => undefined);
  }, 300);
}
