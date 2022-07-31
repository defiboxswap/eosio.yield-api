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
   * @response 200 arrayarraystring (echart resp) eg:([ [ "category", "1656288000", "1656374400", "1656460800", "1656547200", "1656633600", "1656720000", "1656806400", "1656892800", "1656979200", "1657065600", "1657152000", "1657238400", "1657324800", "1657411200", "1657497600", "1657584000", "1657929600", "1658016000", "1658102400", "1658188800" ], [ "danchorsmart", 3242111.7502, 3163247.6657, 3047747.3533, 2928443.3282, 2968751.4166, 2997842.6333, 3032344.9437, 3086757.7146, 3141103.4799, 3195506.6116, 3272741.5088, 3325403.1844, 3350239.1679, 3290807.7602, 3188176.2396, 3042697.7216, 3176478.7035, 3239467.0285, 3354402.1296, 3371154.2174 ], [ "lend.defi", 1008052.7884, 979078.6383, 963741.2955, 941750.7212, 939882.8277, 943458.7325, 951918.5225, 934032.7217, 965133.1849, 971237.0656, 981815.0578, 994466.7533, 1004267.4295, 997753.7173, 975202.8444, 936947.9543, 968216.5068, 975833.9269, 992892.8375, 995441.4236 ], [ "lend.pizza", 433452.2236, 428626.0738, 421769.6099, 410336.8038, 409818.6988, 411590.9727, 414673.1045, 414794.0947, 424662.9721, 429802.1274, 432500.3646, 432271.7182, 430806.1605, 428150.6311, 424037.7655, 417030.0122, 422958.2352, 426033.647, 429526.4832, 429314.24 ], [ "swap.defi", 7046562.656, 6956275.3279, 6830337.3407, 6701633.6682, 6742878.1539, 6774891.9285, 6819606.8329, 6898205.3869, 6978445.8837, 7040941.3925, 7137542.7798, 7219222.888, 7230620.0669, 7158821.3346, 7091890.4011, 7041617.1753, 7219976.3327, 7301290.3311, 7450769.4246, 7468229.5029 ], [ "swap.ttr", 58577.9616, 58729.7869, 58082.8287, 55430.2783, 55424.4983, 55438.4946, 55478.0315, 55570.7966, 55665.3509, 55509.6205, 55133.3259, 55054.5065, 54992.036, 54819.0993, 53922.2028, 52705.6362, 52343.155, 52460.624, 52695.9942, 52729.0464 ] ])
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
   * @response 200 arrayarraystring (echart resp) eg:([ [ "category", "1656288000", "1656374400", "1656460800", "1656547200", "1656633600", "1656720000", "1656806400", "1656892800", "1656979200", "1657065600", "1657152000", "1657238400", "1657324800", "1657411200", "1657497600", "1657584000", "1657929600", "1658016000", "1658102400", "1658188800" ], [ "danchorsmart", 3242111.7502, 3163247.6657, 3047747.3533, 2928443.3282, 2968751.4166, 2997842.6333, 3032344.9437, 3086757.7146, 3141103.4799, 3195506.6116, 3272741.5088, 3325403.1844, 3350239.1679, 3290807.7602, 3188176.2396, 3042697.7216, 3176478.7035, 3239467.0285, 3354402.1296, 3371154.2174 ], [ "lend.defi", 1008052.7884, 979078.6383, 963741.2955, 941750.7212, 939882.8277, 943458.7325, 951918.5225, 934032.7217, 965133.1849, 971237.0656, 981815.0578, 994466.7533, 1004267.4295, 997753.7173, 975202.8444, 936947.9543, 968216.5068, 975833.9269, 992892.8375, 995441.4236 ], [ "lend.pizza", 433452.2236, 428626.0738, 421769.6099, 410336.8038, 409818.6988, 411590.9727, 414673.1045, 414794.0947, 424662.9721, 429802.1274, 432500.3646, 432271.7182, 430806.1605, 428150.6311, 424037.7655, 417030.0122, 422958.2352, 426033.647, 429526.4832, 429314.24 ], [ "swap.defi", 7046562.656, 6956275.3279, 6830337.3407, 6701633.6682, 6742878.1539, 6774891.9285, 6819606.8329, 6898205.3869, 6978445.8837, 7040941.3925, 7137542.7798, 7219222.888, 7230620.0669, 7158821.3346, 7091890.4011, 7041617.1753, 7219976.3327, 7301290.3311, 7450769.4246, 7468229.5029 ], [ "swap.ttr", 58577.9616, 58729.7869, 58082.8287, 55430.2783, 55424.4983, 55438.4946, 55478.0315, 55570.7966, 55665.3509, 55509.6205, 55133.3259, 55054.5065, 54992.036, 54819.0993, 53922.2028, 52705.6362, 52343.155, 52460.624, 52695.9942, 52729.0464 ] ])
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
