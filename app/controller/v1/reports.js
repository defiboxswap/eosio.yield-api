'use strict';
const BaseController = require('../base_controller');

/**
 * @Controller reports
 */
class ReportsController extends BaseController {
  /**
   * @Summary Get reports
   * @Router get /v1/reports
   * @Request query number pageNo page no
   * @Request query number pageSize page size
   * @response 200 report resp
   */
  async report_page() {
    const { app, ctx } = this;
    const db = app.mysql.get('yield');
    const rules = {
      pageNo: { type: 'number', required: false, min: 1 },
      pageSize: { type: 'number', required: false, max: 300 },
    };
    const params = {
      pageNo: ctx.request.query.pageNo ? parseInt(ctx.request.query.pageNo) : 1,
      pageSize: ctx.request.query.pageSize ? parseInt(ctx.request.query.pageSize) : 100,
    };
    // validate
    ctx.validate(rules, params);

    const sql = 'select * from report order by id desc limit :offset, :limit ';
    const data = await db.query(sql, {
      offset: (params.pageNo - 1) * params.pageSize,
      limit: params.pageSize,
    });

    super.success(data);
  }
}

module.exports = ReportsController;
