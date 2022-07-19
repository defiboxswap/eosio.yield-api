'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const { convert_now_line_id } = require('../lib/utils/util');

/**
 * line service
 */
class LineService extends Service {
  /**
   * @param  name protocol name eg: swap.defi
   * @param  duration enum:day,8h
   **/
  async list(params) {
    const { app } = this;
    const db = app.mysql.get('yield');
    const from = this.getFrom(params.duration);
    let sql = `select * from line_protocol_${params.duration} where line_id >= :from `;
    if (params.name) {
      sql += ' and name = :name';
    }
    const result = await db.query(sql, { from, name: params.name });
    // get latest line
    sql = 'select * from protocol where is_delete = 0 and period > 0 '
    if (params.name) {
      sql += ' and name = :name '
    }
    const latest_result = await db.query(sql, { name: params.name });
    for (const item of latest_result) {
      result.push({
        agg_rewards: item.agg_rewards,
        line_id: convert_now_line_id(params.duration, item.period),
        name: item.name,
        tvl_eos: item.tvl_eos,
        tvl_usd: item.tvl_usd,
        tvl_eos_change: item.tvl_eos_change,
        tvl_usd_change: item.tvl_usd_change,
      });
    }
    return result;
  }

  /**
   * @param  duration enum:day,8h
   **/
  async stat_list(params) {
    const { app } = this;
    const db = app.mysql.get('yield');
    const from = this.getFrom(params.duration);
    let sql = `select * from line_protocol_stat_${params.duration} where line_id >= :from `;
    const result = await db.query(sql, { from });
    // get latest line
    sql = 'select * from protocol_stat where period > 0 '
    const latest_result = await db.query(sql, { });
    for (const item of latest_result) {
      result.push({
        agg_protocol_count: item.agg_protocol_count,
        agg_rewards: item.agg_rewards,
        line_id: convert_now_line_id(params.duration, item.period),
        tvl_eos: item.tvl_eos,
        tvl_usd: item.tvl_usd,
        tvl_eos_change: item.tvl_eos_change,
        tvl_usd_change: item.tvl_usd_change,
      });
    }
    return result;
  }

  /**
   * @param  category protocol category eg: swap lending
   * @param  duration enum:day,8h
   **/
  async category_stat_list(params) {
    const { app } = this;
    const db = app.mysql.get('yield');
    const from = this.getFrom(params.duration);
    let sql = `select * from line_protocol_category_stat_${params.duration} where line_id >= :from `;
    if (params.category) {
      sql += ' and category = :category';
    }
    const result = await db.query(sql, { from, category: params.category });
    // get latest line
    sql = 'select * from protocol_category_stat where period > 0 '
    if (params.category) {
      sql += ' and cagetory = :category '
    }
    const latest_result = await db.query(sql, { category: params.category });
    for (const item of latest_result) {
      result.push({
        agg_protocol_count: item.agg_protocol_count,
        agg_rewards: item.agg_rewards,
        line_id: convert_now_line_id(params.duration, item.period),
        category: item.category,
        tvl_eos: item.tvl_eos,
        tvl_usd: item.tvl_usd,
        tvl_eos_change: item.tvl_eos_change,
        tvl_usd_change: item.tvl_usd_change,
      });
    }
    return result;
  }

  getFrom(duration) {
    if (duration === 'day') {
      return moment().subtract(1, 'years').unix();
    } else if (duration === '8h') {
      return moment().subtract(6, 'months').unix();
    } else if (duration === '10m') {
      return moment().subtract(15, 'days').unix();
    }
  }
}
module.exports = LineService;
