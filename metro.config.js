const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver = { ...config.resolver, unstable_enablePackageExports: true };
module.exports = mergeConfig(config, {});
