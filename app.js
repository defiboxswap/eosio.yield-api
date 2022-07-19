'use strict';
const { sleep } = require('./app/lib/utils/util');


class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  async didReady() {
    const { app } = this;
    app.logger.info('===>>> app.js didReady');
    app.logger.info('http://127.0.0.1:5051/swagger-ui.html');
    app.globalStatus = 1;
  }

  async beforeClose() {
    const { ctx, app } = this;
    app.logger.info('===>>> app.js beforeClose');
    app.globalStatus = 0;
    await sleep(2000);
  }
}

module.exports = AppBootHook;
