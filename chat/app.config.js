module.exports = {
  expo: {
    name: "chat",
    slug: "chat",
    owner: "kyrsach",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#000000",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.cursach.chat",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#000000",
      },
      package: "com.cursach.chat",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
      eas: {
        projectId: "596cdf23-56e8-48b3-b083-8a1773228ee1",
      },
    },
    plugins: ["expo-router"],
  },
};
