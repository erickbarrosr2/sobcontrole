import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.03aa75e7a50c48378d00ada956dda580',
  appName: 'simple-cents-flow',
  webDir: 'dist',
  server: {
    url: 'https://03aa75e7-a50c-4837-8d00-ada956dda580.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: "default"
    }
  }
};

export default config;