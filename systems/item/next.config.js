const { withModuleFederation, MergeRuntime } = require('@module-federation/nextjs-mf');
const federationConfig = require('./federation.config.json');

module.exports = {
  future: {
    webpack5: true,
  },
  webpack: (config, options) => {
    const { buildId, dev, isServer, defaultLoaders, webpack } = options;

    withModuleFederation(config, options, federationConfig);

    config.plugins.push(new MergeRuntime());

    if (!isServer) {
      config.output.publicPath = `http://localhost:${federationConfig.port}/_next/`;
    }

    return config;
  },
};
