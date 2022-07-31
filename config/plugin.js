'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  cors: {
    enable: true,
    package: 'egg-cors',
  },
  mysql: {
    enable: true,
    package: 'egg-mysql',
  },

  redis: {
    enable: true,
    package: 'egg-redis',
  },

  validate: {
    enable: true,
    package: 'egg-validate',
  },

  swaggerdoc: {
    enable: true,
    package: 'egg-swagger-doc-x',
  },
};
