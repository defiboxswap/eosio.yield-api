'use strict';
const BaseController = require('../base_controller');
const { group_data } = require('../../lib/util');
const Constatns = require('../../lib/constants');

/**
 * @Controller echart
 */
class EchartController extends BaseController {
  /**
   * @Summary Get echart data for protocol.
   * @Router get /v1/echart/lines/{line_type}
   * @Request query string *tvl_type enum:tvl_usd,tvl_eos
   * @Request path string *line_type enum:week,day,8h
   * @Request query number duration Maximum search days for line_type <br> 8h: 90 <br> day: 180 <br> week: 360
   * @response 200 chart_result resp
   **/
  async list() {
    const { ctx } = this;
    const rules = {
      tvl_type: { type: 'enum', trim: true, required: true, values: ['tvl_usd', 'tvl_eos'] },
      line_type: { type: 'enum', required: true, trim: true, values: Constatns.skip_10m_durations },
      duration: { type: 'number', required: false, convertType: 'number' },
    };
    const params = {
      tvl_type: ctx.request.query.tvl_type,
      line_type: ctx.params.line_type,
      duration: ctx.request.query.duration,
    };
    // validate
    ctx.validate(rules, params);
    const result = await ctx.service.line.list(params);
    const data = group_data(result, 'line_id', 'name', params.tvl_type);
    super.success(data);
  }

  /**
   * @Summary Get echart data for protocol category stat.
   * @Router get /v1/echart/lines/{line_type}/categorystats
   * @Request query string *tvl_type enum:tvl_usd,tvl_eos
   * @Request path string *line_type enum:week,day,8h
   * @Request query number duration Maximum search days for line_type <br> 8h: 90 <br> day: 180 <br> week: 360
   * @response 200 chart_result resp
   **/
  async category_stat_list() {
    const { ctx } = this;
    const rules = {
      tvl_type: { type: 'enum', trim: true, required: true, values: ['tvl_usd', 'tvl_eos'] },
      line_type: { type: 'enum', required: true, trim: true, values: Constatns.skip_10m_durations },
      duration: { type: 'number', required: false, convertType: 'number' },
    };
    const params = {
      tvl_type: ctx.request.query.tvl_type,
      line_type: ctx.params.line_type,
      duration: ctx.request.query.duration,
    };
    // validate
    ctx.validate(rules, params);
    const result = await ctx.service.line.category_stat_list(params);
    const data = group_data(result, 'line_id', 'category', params.tvl_type);
    super.success(data);
  }
}

module.exports = EchartController;
