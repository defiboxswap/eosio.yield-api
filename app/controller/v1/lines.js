'use strict';
const BaseController = require('../base_controller');

/**
 * @Controller lines
 */
class LinesController extends BaseController {
  /**
   * @Summary Get lines for protocol.
   * @Router get /v1/lines/{duration}
   * @Request query string name protocol name
   * @Request path string *duration enum:day,8h
   * @response 0 line resp
   **/
  async list() {
    const { ctx } = this;
    const rules = {
      name: { type: 'string', required: false, trim: true},
      duration: { type: 'enum', required: true, trim: true, values: ['day', '8h' ] },
    };
    const params = {
      name: ctx.request.query.name,
      duration: ctx.params.duration,
    };
    // validate
    ctx.validate(rules, params);
    const result = await ctx.service.line.list(params);
    super.success(result);
  }

  /**
   * @Summary Get lines for protocol stat.
   * @Router get /v1/line/{duration}/stats
   * @Request path string *duration enum:day,8h
   * @response 0 line_stat resp
   **/
  async stat_list() {
    const { ctx } = this;
    const rules = {
      duration: { type: 'enum', required: true, trim: true, values: ['day', '8h'] },
    };
    const params = {
      duration: ctx.params.duration,
    };
    // validate
    ctx.validate(rules, params);
    const result = await ctx.service.line.stat_list(params);
    super.success(result);
  }

  /**
   * @Summary Get lines for protocol category stat.
   * @Router get /v1/line/{duration}/categorystats
   * @Request query string category
   * @Request path string *duration enum:day,8h
   * @response 0 line_category_stat resp
   **/
  async category_stat_list() {
    const { ctx } = this;
    const rules = {
      category: { type: 'string', required: false, trim: true },
      duration: { type: 'enum', required: true, trim: true, values: ['day', '8h'] },
    };
    const params = {
      duration: ctx.params.duration,
      category: ctx.request.query.category,
    };
    // validate
    ctx.validate(rules, params);
    const result = await ctx.service.line.category_stat_list(params);
    super.success(result);
  }
}

module.exports = LinesController;
