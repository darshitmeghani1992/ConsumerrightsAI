# Expo pinned to SDK 54

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

Pinned to SDK 54, not the newest SDK, on purpose: the App Store/Play Store build of Expo Go people
actually install only supports one SDK at a time, and new SDKs sit in app-store review for a while
after release — so "latest SDK" in the code and "latest Expo Go you can install" can be several
versions apart. Don't assume; check the exact "Supported SDK" your Expo Go build reports (Expo Go →
profile/settings tab) before bumping anything. Check `node_modules/expo/bundledNativeModules.json` for
the exact compatible version of every expo-* / react-native-* package for that SDK.
