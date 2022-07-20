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
}
module.exports = BaseController;
