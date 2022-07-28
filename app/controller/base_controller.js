'use strict';

const { Controller } = require('egg');
class BaseController extends Controller {

  success(data, dataKey = 'data', message) {
    message = message || 'success';
    this.ctx.body = {
      code: 200,
      message,
      [dataKey]: data,
    };
  }
  error(code, message) {
    if (typeof code === 'object') {
      const msgInfo = code;
      code = msgInfo.errorCode;
      message = msgInfo.message;
    } else {
      code = code || 500;
      message = message || 'error';
    }
    this.ctx.body = {
      code,
      message,
    };
  }
}
module.exports = BaseController;
