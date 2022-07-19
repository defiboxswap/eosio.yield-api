'use strict';
const BaseController = require('../base_controller');
const { group_data } = require('../../lib/utils/util');

/**
 * @Controller echart
 */
class EchartController extends BaseController {

  /**
   * @Summary Get echart data for protocol.
   * @Router get /v1/echart/lines/{duration}
   * @Request path string *duration enum:day,8h
   * @response 0 chart_result resp
  **/
  async list() {
    const { ctx } = this;
    const rules = {
      duration: { type: 'enum', required: true, trim: true, values: [ 'day', '8h' ] },
    };
    const params = {
      duration: ctx.params.duration,
    };
    // validate
    ctx.validate(rules, params);
    const result = await ctx.service.line.list(params);
    const data = group_data(result, 'line_id', 'name', 'tvl_usd');
    super.success(data);
  }
  
  /**
   * @Summary Get echart data for protocol category stat.
   * @Router get /v1/echart/line/{duration}/categorystats
   * @Request path string *duration enum:day,8h
   * @response 0 chart_result resp
  **/
  async category_stat_list() {
    const { ctx } = this;
    const rules = {
      duration: { type: 'enum', required: true, trim: true, values: [ 'day', '8h' ] },
    };
    const params = {
      duration: ctx.params.duration,
    };
    // validate
    ctx.validate(rules, params);
    const result = await ctx.service.line.category_stat_list(params);
    const data = group_data(result, 'line_id', 'category', 'tvl_usd');
    super.success(data);
  }
}

module.exports = EchartController;
