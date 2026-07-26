// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

// Everything the native app needs lives inside this project root: the shared
// domain modules are copied into src/shared by "npm run sync:shared", so no
// custom resolver or watch folders are required.
module.exports = getDefaultConfig(__dirname);
