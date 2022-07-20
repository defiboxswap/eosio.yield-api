'use strict';

module.exports = {
  mysql: {
    clients: {
      history: {
        host: '127.0.0.1',
        port: '30002',
        user: 'root',
        password: '123456',
        database: 'history_yield',
        debug: false,
      },
      yield: {
        host: '127.0.0.1',
        port: '30002',
        user: 'root',
        password: '123456',
        database: 'yield',
        debug: false,
      },
    },
    default: {

    },
    // Whether to load to app, enabled by default
    app: true,
    // Whether to load the file to the Agent. The default value is disabled
    agent: false,
  },
  swaggerdoc: {
    enable: true,
  }
};
