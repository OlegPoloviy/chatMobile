const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,
  sourceExts: ["jsx", "js", "ts", "tsx", "json", "cjs", "mjs"],
  extraNodeModules: {
    stream: require.resolve("stream-browserify"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    net: require.resolve("react-native-tcp"),
    tls: require.resolve("react-native-tcp"),
    fs: require.resolve("react-native-fs"),
    path: require.resolve("path-browserify"),
    zlib: require.resolve("browserify-zlib"),
    url: require.resolve("url"),
    assert: require.resolve("assert"),
    buffer: require.resolve("buffer"),
    util: require.resolve("util"),
    crypto: require.resolve("crypto-browserify"),
    os: require.resolve("os-browserify"),
    "nanoid/non-secure": path.resolve(
      __dirname,
      "node_modules/nanoid/non-secure.js"
    ),
  },
};

module.exports = config;
