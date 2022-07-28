'use strict';
const BaseController = require('../base_controller');
const Constatns = require('../../lib/constants');

/**
 * @Controller lines
 */
class LinesController extends BaseController {
  /**
   * @Summary Get lines for protocol.
   * @Router get /v1/lines/{line_type}
   * @Request query string name protocol name
   * @Request path string *line_type enum:week,day,8h
   * @Request query number duration Maximum search days for line_type <br> 8h: 90 <br> day: 180 <br> week: 360
   * @response 200 line resp
   **/
  async list() {
    const { ctx } = this;
    const rules = {
      name: { type: 'string', required: false, trim: true },
      line_type: { type: 'enum', required: true, trim: true, values: Constatns.skip_10m_durations },
      duration: { type: 'number', required: false, convertType: 'number' },
    };
    const params = {
      name: ctx.request.query.name,
      line_type: ctx.params.line_type,
      duration: ctx.request.query.duration,
    };
    // validate
    ctx.validate(rules, params);
    const result = await ctx.service.line.list(params);
    super.success(result);
  }

  /**
   * @Summary Get lines for protocol stat.
   * @Router get /v1/lines/{line_type}/stats
   * @Request path string *line_type enum:week,day,8h
   * @Request query number duration Maximum search days for line_type <br> 8h: 90 <br> day: 180 <br> week: 360
   * @response 200 line_stat resp
   **/
  async stat_list() {
    const { ctx } = this;
    const rules = {
      line_type: { type: 'enum', required: true, trim: true, values: Constatns.skip_10m_durations },
      duration: { type: 'number', required: false, convertType: 'number' },
    };
    const params = {
      line_type: ctx.params.line_type,
      duration: ctx.request.query.duration,
    };
    // validate
    ctx.validate(rules, params);
    const result = await ctx.service.line.stat_list(params);
    super.success(result);
  }

  /**
   * @Summary Get lines for protocol category stat.
   * @Router get /v1/lines/{line_type}/categorystats
   * @Request query string category
   * @Request path string *line_type enum:week,day,8h
   * @Request query number duration Maximum search days for line_type <br> 8h: 90 <br> day: 180 <br> week: 360
   * @response 200 line_category_stat resp
   **/
  async category_stat_list() {
    const { ctx } = this;
    const rules = {
      category: { type: 'string', required: false, trim: true },
      line_type: { type: 'enum', required: true, trim: true, values: Constatns.skip_10m_durations },
      duration: { type: 'number', required: false, convertType: 'number' },
    };
    const params = {
      category: ctx.request.query.category,
      line_type: ctx.params.line_type,
      duration: ctx.request.query.duration,
    };
    // validate
    ctx.validate(rules, params);
    const result = await ctx.service.line.category_stat_list(params);
    super.success(result);
  }
}

module.exports = LinesController;
