import { Capacitor } from '@capacitor/core';

/** True only inside the Capacitor shell, not in a normal browser tab. */
export const isNativeApp = (): boolean => Capacitor.isNativePlatform();

/**
 * Wires up the native shell: styles the status bar and dismisses the splash
 * once React has painted. Imports are dynamic so the browser build never pulls
 * the plugin code in. Safe to call on the web, where it is a no-op.
 */
export async function initNativeShell(): Promise<void> {
  if (!isNativeApp()) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Light });

    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#fcf9f8' });
    }
  } catch {
    // Status bar styling is cosmetic — never block startup over it.
  }

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch {
    // If the plugin is missing the splash auto-hides; nothing to recover.
  }
}

/**
 * Routes the Android hardware back button through the app's own history.
 * Returns a cleanup function. `onBack` should return true when it consumed the
 * press; returning false lets the app exit from a root screen.
 */
export function registerHardwareBack(onBack: () => boolean): () => void {
  if (!isNativeApp()) return () => {};

  let remove: (() => void) | undefined;
  let cancelled = false;

  void (async () => {
    const { App } = await import('@capacitor/app');
    const handle = await App.addListener('backButton', () => {
      if (!onBack()) {
        void App.exitApp();
      }
    });

    if (cancelled) {
      void handle.remove();
      return;
    }
    remove = () => void handle.remove();
  })();

  return () => {
    cancelled = true;
    remove?.();
  };
}
