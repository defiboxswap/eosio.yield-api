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
  const config = exports = {};

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
    schemes: [ 'http' ],
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
  return {
    ...config,
    ...userConfig,
  };
};
