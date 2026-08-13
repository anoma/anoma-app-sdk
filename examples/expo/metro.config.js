/* eslint-disable */

const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// arm-bindings' web entry imports index_bg.wasm as an asset.
config.resolver.assetExts.push("wasm");

config.watchFolders = [path.resolve(__dirname, "../..")];

module.exports = config;
