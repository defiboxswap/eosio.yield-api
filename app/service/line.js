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
    const { app, ctx } = this;
    const db = app.mysql.get('yield');
    const from = this.getFrom(params.duration);
    const cache_key = JSON.stringify({query_name: "line_protocol", from, ...params});
    // get history line
    let history_result = await ctx.service.cache.lru_computeIfAbsent( cache_key, async () => {
      let sql = `select * from line_protocol_${params.duration} where line_id >= :from `;
      if (params.name) {
        sql += ' and name = :name';
      }
      return await db.query(sql, { from, name: params.name });
    });
    // get latest line
    let sql = 'select * from protocol where is_delete = 0 and period > 0 '
    if (params.name) {
      sql += ' and name = :name '
    }
    sql += ' order by period asc'
    const latest_result = await db.query(sql, { name: params.name });

    const result = [...history_result];
    for (const item of latest_result) {
      result.push({
        agg_rewards: item.agg_rewards,
        line_id: convert_now_line_id(params.duration, item.period),
        name: item.name,
        tvl_eos: item.tvl_eos,
        tvl_usd: item.tvl_usd,
        tvl_eos_change: item.tvl_eos_change,
        tvl_usd_change: item.tvl_usd_change, 
        agg_rewards: item.agg_rewards,
        agg_rewards_change: item.agg_rewards_change,
      });
    }
    return result;
  }

  /**
   * @param  duration enum:day,8h
   **/
  async stat_list(params) {
    const { app, ctx } = this;
    const db = app.mysql.get('yield');
    const from = this.getFrom(params.duration);
     const cache_key = "protocol_stat_line_query_" + JSON.stringify({query_name: "line_protocol_stat", from, ...params});
    // get history line
    let history_result = await ctx.service.cache.lru_computeIfAbsent( cache_key, async () => {
      let sql = `select * from line_protocol_stat_${params.duration} where line_id >= :from `;
      return await db.query(sql, { from });
    });
    
    // get latest line
    let sql = 'select * from protocol_stat where period > 0 '
    const latest_result = await db.query(sql, { });

    const result = [...history_result];
    for (const item of latest_result) {
      result.push({
        agg_protocol_count: item.agg_protocol_count,
        agg_rewards: item.agg_rewards,
        line_id: convert_now_line_id(params.duration, item.period),
        tvl_eos: item.tvl_eos,
        tvl_usd: item.tvl_usd,
        tvl_eos_change: item.tvl_eos_change,
        tvl_usd_change: item.tvl_usd_change,
        agg_rewards: item.agg_rewards,
        agg_rewards_change: item.agg_rewards_change,
      });
    }
    return result;
  }

  /**
   * @param  category protocol category eg: swap lending
   * @param  duration enum:day,8h
   **/
  async category_stat_list(params) {
    const { app, ctx } = this;
    const db = app.mysql.get('yield');
    const from = this.getFrom(params.duration);
    // get history line
    const cache_key = JSON.stringify({query_name: "line_protocol_category", from, ...params});
    let history_result = await ctx.service.cache.lru_computeIfAbsent( cache_key, async () => {
      let sql = `select * from line_protocol_category_stat_${params.duration} where line_id >= :from `;
      if (params.category) {
        sql += ' and category = :category';
      }
      return await db.query(sql, { from, category: params.category });
    });

    // get latest line
    let sql = 'select * from protocol_category_stat where period > 0 '
    if (params.category) {
      sql += ' and category = :category '
    }
    sql += ' order by period asc'
    const latest_result = await db.query(sql, { category: params.category });

    const result = [...history_result];
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
        agg_rewards: item.agg_rewards,
        agg_rewards_change: item.agg_rewards_change,
      });
    }
    return result;
  }

  // day Queries the data of the last 365 days    (31536000 seconds)
  // 8h  Queries the data of the last 180 days    (15552000 seconds)
  // 10m Queries the data of the last 15  days    (1296000  seconds)
  getFrom(duration) {
    if (duration === 'day') {
      return convert_now_line_id(duration) - 31536000;
    } else if (duration === '8h') {
      return convert_now_line_id(duration) - 15552000;
    } else if (duration === '10m') {
      return convert_now_line_id(duration) - 1296000;
    }
  }
}
module.exports = LineService;
