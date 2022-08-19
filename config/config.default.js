/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  config.multipart = {
    mode: 'file',
    whitelist: [
      '.jpg',
      '.jpeg',
      '.png', 
      // animations
      '.gif', 
      '.webp'
    ],
    fileSize: '2mb',
    files: 1,
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1653875977514_1416';

  // add your middleware config here
  config.middleware = [];

  config.security = {
    csrf: {
      enable: false,
    },
  };
  config.cors = {
    origin: '*',
    allowMethods: 'GET,POST,OPTIONS',
    allowHeaders: '*',
  };
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };
  config.swaggerdoc = {
    schemes: [],
    enable: false,
    apiInfo: {
      version: '1.0.0',
      title: 'EOS Yield+ Functions',
      description: 'EOS Yield+ Api',
      contact: {
        email: 'raven@defibox.io',
      },
    },
  };
  config.lru = {
    enable: true,

    // for use with tracking overall storage size
    maxSize: 5000,
    sizeCalculation: (value, key) => {
      return 1;
    },

    // for use when you need to clean up something when objects
    // are evicted from the cache
    dispose: (value, key) => {
      freeFromMemoryOrWhatever(value);
    },

    // how long to live in ms
    ttl: 1000 * 60 * 60 * 24,

    // return stale items before removing from cache?
    allowStale: false,

    updateAgeOnGet: false,
    updateAgeOnHas: false,
  };
  config.pinata_url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  return {
    ...config,
    ...userConfig,
  };
};
