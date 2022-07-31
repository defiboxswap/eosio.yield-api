'use strict';

const Service = require('egg').Service;
const { convert_now_line_id, sparkline } = require('../lib/util');
const DurationType = require('../lib/enums/duration_type');

/**
 * line service
 */
class LineService extends Service {
  /**
   * @param  name protocol name eg: swap.defi
   * @param  line_type enum:day,8h
   * @param  duration enum:day,8h
   **/
  async list(params) {
    const { app, ctx } = this;
    const db = app.mysql.get('yield');
    const from = this.getFrom(ctx, params.line_type, params.duration);
    const cache_key = JSON.stringify({ query_name: 'line_protocol', from, ...params });
    // get history line
    let history_result = await ctx.service.cache.lru_computeIfAbsent(cache_key, async () => {
      let sql = `select * from line_protocol_${params.line_type} where line_id >= :from `;
      if (params.name) {
        sql += ' and name = :name';
      }
      return await db.query(sql, { from, name: params.name });
    });
    // get latest line
    let sql = 'select * from protocol where is_delete = 0 and period > 0 ';
    if (params.name) {
      sql += ' and name = :name ';
    }
    sql += ' order by period asc';
    const latest_result = await db.query(sql, { name: params.name });

    const result = [...history_result];
    for (const item of latest_result) {
      result.push({
        agg_rewards: item.agg_rewards,
        line_id: convert_now_line_id(params.line_type, item.period),
        name: item.name,
        tvl_eos: item.tvl_eos,
        tvl_usd: item.tvl_usd,
        tvl_eos_change: item.tvl_eos_change_day,
        tvl_usd_change: item.tvl_usd_change_day,
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
    const from = this.getFrom(ctx, params.line_type, params.duration);
    const cache_key =
      'protocol_stat_line_query_' + JSON.stringify({ query_name: 'line_protocol_stat', from, ...params });
    // get history line
    let history_result = await ctx.service.cache.lru_computeIfAbsent(cache_key, async () => {
      let sql = `select * from line_protocol_stat_${params.line_type} where line_id >= :from `;
      return await db.query(sql, { from });
    });

    // get latest line
    let sql = 'select * from protocol_stat where period > 0 ';
    const latest_result = await db.query(sql, {});

    const result = [...history_result];
    for (const item of latest_result) {
      result.push({
        agg_protocol_count: item.agg_protocol_count,
        agg_rewards: item.agg_rewards,
        line_id: convert_now_line_id(params.line_type, item.period),
        tvl_eos: item.tvl_eos,
        tvl_usd: item.tvl_usd,
        tvl_eos_change: item.tvl_eos_change_day,
        tvl_usd_change: item.tvl_usd_change_day,
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
    const from = this.getFrom(ctx, params.line_type, params.duration);
    // get history line
    const cache_key = JSON.stringify({ query_name: 'line_protocol_category', from, ...params });
    let history_result = await ctx.service.cache.lru_computeIfAbsent(cache_key, async () => {
      let sql = `select * from line_protocol_category_stat_${params.line_type} where line_id >= :from `;
      if (params.category) {
        sql += ' and category = :category';
      }
      return await db.query(sql, { from, category: params.category });
    });

    // get latest line
    let sql = 'select * from protocol_category_stat where period > 0 ';
    if (params.category) {
      sql += ' and category = :category ';
    }
    sql += ' order by period asc';
    const latest_result = await db.query(sql, { category: params.category });

    const result = [...history_result];
    for (const item of latest_result) {
      result.push({
        agg_protocol_count: item.agg_protocol_count,
        agg_rewards: item.agg_rewards,
        line_id: convert_now_line_id(params.line_type, item.period),
        category: item.category,
        tvl_eos: item.tvl_eos,
        tvl_usd: item.tvl_usd,
        tvl_eos_change: item.tvl_eos_change_day,
        tvl_usd_change: item.tvl_usd_change_day,
        agg_rewards: item.agg_rewards,
        agg_rewards_change: item.agg_rewards_change,
      });
    }
    return result;
  }

  /**
   * @param  name protocol name
   * @param  tvl_type tvl type enum:tvl_eos,tvl_usd
   **/
  async sparkline(params) {
    const { app } = this;
    const db = app.mysql.get('yield');
    const from = convert_now_line_id('10m') - 7*86400;
    let values = (
      await db.query(
        `select ${params.tvl_type} as tvl from line_protocol_10m where name =? 
         and line_id >= ? and (line_id - ?) % 3600 = 0 `,
        [params.name, from, from]
      )
    ).map(({ tvl }) => tvl);
    
    return sparkline({values});
  }

  getFrom(ctx, line_type, duration) {
    const rules = {
      duration: { type: 'number', required: true, max: DurationType[line_type].max_line_search_day },
    };
    const params = {
      duration: duration ? duration : DurationType[line_type].max_line_search_day,
    };
    ctx.validate(rules, params);
    return convert_now_line_id(line_type) - (params.duration - 1) * 86400;
  }
}
module.exports = LineService;
