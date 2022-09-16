'use strict';
const LRU = require('lru-cache');
const { sleep } = require('./app/lib/util');

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  async didLoad() {
    const { app } = this;
    // init lru cache
    if (app.config.lru.enable) {
      app.lru = new LRU(app.config.lru);
    }
  }

  async serverDidReady() {
    const { app } = this;
    app.logger.info('===>>> app.js serverDidReady');
    app.logger.info('http://127.0.0.1:5051/swagger-ui.html');
  }

  async beforeClose() {
    const { app } = this;
    app.logger.info('===>>> app.js beforeClose');
    await sleep(2000);
  }
}

module.exports = AppBootHook;
