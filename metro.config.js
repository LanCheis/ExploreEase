const path = require('path');
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Force zustand subpaths to CJS — the ESM .mjs files use import.meta which Metro can't handle
const zustandRoot = path.dirname(require.resolve('zustand/package.json'));
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('zustand')) {
    const subpath = moduleName.slice('zustand'.length) || '/index';
    const cjsFile = path.join(zustandRoot, subpath.replace(/^\//, '') + '.js');
    return { filePath: cjsFile, type: 'sourceFile' };
  }
  if (originalResolveRequest) return originalResolveRequest(context, moduleName, platform);
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
