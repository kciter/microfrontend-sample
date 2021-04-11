const { withModuleFederation, MergeRuntime } = require('@module-federation/nextjs-mf');
const path = require('path');
const fs = require('fs');

const getSystemList = () => {
  const systemsDirectory = path.resolve(__dirname, '../systems');
  return fs
    .readdirSync(systemsDirectory, { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .map((dir) => dir.name);
};

module.exports = {
  future: {
    webpack5: true,
  },
  webpack: (config, options) => {
    const { buildId, dev, isServer, defaultLoaders, webpack } = options;
    const mfConf = {
      name: 'app',
      library: { type: config.output.libraryTarget, name: 'app' },
      filename: 'static/runtime/remoteEntry.js',
      remotes: Object.assign(
        {},
        ...getSystemList().map((dirName) => {
          return { [dirName]: isServer ? path.resolve(__dirname, `../systems/${dirName}/.next/server/static/runtime/remoteEntry.js`) : dirName };
        }),
      ),
      exposes: {},
      shared: [],
    };

    withModuleFederation(config, options, mfConf);

    // config.plugins.push(new MergeRuntime());

    if (!isServer) {
      config.output.publicPath = 'http://localhost:3000/_next/';
    }

    return config;
  },
  webpackDevMiddleware: (config) => {
    return config;
  },
};
