import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.teedeux.mart',
  appName: 'Teedeux Mart',
  // Capacitor ships whatever Vite emits; run `npm run build` before syncing.
  webDir: 'dist',
  backgroundColor: '#fcf9f8',

  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#9c3f00',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#fcf9f8',
    },
  },

  ios: {
    contentInset: 'never',
  },
};

export default config;
