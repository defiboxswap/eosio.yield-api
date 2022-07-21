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
   * @Request query string *tvl_type enum:tvl_usd,tvl_eos
   * @response 200 chart_result resp
  **/
  async list() {
    const { ctx } = this;
    const rules = {
      duration: { type: 'enum', required: true, trim: true, values: [ 'day', '8h' ] },
      tvl_type: { type: 'enum', trim: true, required: true, values: [ 'tvl_usd', 'tvl_eos' ] },
    };
    const params = {
      duration: ctx.params.duration,
      tvl_type: ctx.request.query.tvl_type,
    };
    // validate
    ctx.validate(rules, params);
    const result = await ctx.service.line.list(params);
    const data = group_data(result, 'line_id', 'name', params.tvl_type);
    super.success(data);
  }
  
  /**
   * @Summary Get echart data for protocol category stat.
   * @Router get /v1/echart/lines/{duration}/categorystats
   * @Request path string *duration enum:day,8h
   * @Request query string *tvl_type enum:tvl_usd,tvl_eos
   * @response 200 chart_result resp
  **/
  async category_stat_list() {
    const { ctx } = this;
    const rules = {
      duration: { type: 'enum', required: true, trim: true, values: [ 'day', '8h' ] },
      tvl_type: { type: 'enum', trim: true, required: true, values: [ 'tvl_usd', 'tvl_eos' ] },
    };
    const params = {
      duration: ctx.params.duration,
      tvl_type: ctx.request.query.tvl_type,
    };
    // validate
    ctx.validate(rules, params);
    const result = await ctx.service.line.category_stat_list(params);
    const data = group_data(result, 'line_id', 'category', params.tvl_type);
    super.success(data);
  }
}

module.exports = EchartController;
