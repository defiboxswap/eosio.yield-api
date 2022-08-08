'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const Util = require('../lib/util');
const DurationType = require('../lib/enums/duration_type');
const Constants = require('../lib/constants');
/**
 * oracle_yield log service
 */
class OracleYieldService extends Service {
  /**
   * handle action for account {oracle.yield } name {updatelog}
   * @param {*} action action data
   * @param {json} data log data
   * @param {*} conn sql connection
   */
  async updatelog(action, data, conn) {
    const name = data.protocol;
    const category = data.category;
    const period = moment(data.period + '+00:00').unix();

    // get protocol
    const protocol = await conn.get('protocol', { name });
    // get protocol stat
    const protocol_stat = await conn.get('protocol_stat');
    // get protocol category stat
    const protocol_category_stat = await conn.get('protocol_category_stat', { category });

    const { last_period_line_ids, last_period_line_map } = await this.batchGetLastLines(conn, period, name, category);

    let protocol_row = {
      id: protocol.id,
      period,
    };
    let protocol_category_stat_row = {
      id: protocol_category_stat.id,
      period,
    };
    let protocol_stat_row = {
      id: protocol_stat.id,
      period,
    };
    for (const line_id of last_period_line_ids) {
      const options = last_period_line_map[line_id];
      const result = await this.saveLines(conn, data, protocol, protocol_stat, protocol_category_stat, period, options);

      const line_type = options.line_type;
      // skip 10m change
      if (line_type === '10m') continue;

      const tvl_eos_change = 'tvl_eos_change_' + line_type;
      const tvl_usd_change = 'tvl_usd_change_' + line_type;
      protocol_row[tvl_eos_change] = result.protocol.tvl_eos_change;
      protocol_row[tvl_usd_change] = result.protocol.tvl_usd_change;

      protocol_stat_row[tvl_eos_change] = result.protocol_stat.tvl_eos_change;
      protocol_stat_row[tvl_usd_change] = result.protocol_stat.tvl_usd_change;

      protocol_category_stat_row[tvl_eos_change] = result.protocol_category_stat.tvl_eos_change;
      protocol_category_stat_row[tvl_usd_change] = result.protocol_category_stat.tvl_usd_change;

      if (line_type === 'day') {
        protocol_row.tvl_eos = result.protocol.tvl_eos;
        protocol_row.tvl_usd = result.protocol.tvl_usd;
        protocol_row.agg_rewards_change = result.protocol.agg_rewards_change;

        protocol_category_stat_row.tvl_eos = result.protocol_category_stat.tvl_eos;
        protocol_category_stat_row.tvl_usd = result.protocol_category_stat.tvl_usd;
        protocol_category_stat_row.agg_rewards_change = result.protocol_category_stat.agg_rewards_change;

        protocol_stat_row.tvl_eos = result.protocol_stat.tvl_eos;
        protocol_stat_row.tvl_usd = result.protocol_stat.tvl_usd;
        protocol_stat_row.agg_rewards_change = result.protocol_stat.agg_rewards_change;
      }
    }

    // update protocol
    await conn.update('protocol', protocol_row);
    // update protocol gategory stat
    await conn.update('protocol_category_stat', protocol_category_stat_row);
    // update protocol stat
    await conn.update('protocol_stat', protocol_stat_row);
  }

  /** ************************************************************** private function **********************************************/
  /**
   *
   * @param {*} conn db connect
   * @param {*} name   protocol name
   * @param {*} category   protocol category
   * @param {*} period current period
   * @returns
   */
  async batchGetLastLines(conn, period, name, category) {
    const last_period_line_ids = [];
    const last_period_line_map = {};
    for (const line_type of Constants.all_durations) {
      const duration = DurationType[line_type].duration;
      // Obtain the data week/1d/8h/10m ago for tvl_eos_change/tvl_usd_change
      const last_period_line_id = period - duration - 600;
      last_period_line_ids.push(last_period_line_id);
      last_period_line_map[last_period_line_id] = { line_type };
    }
    (
      await conn.query(
        'select line_id, tvl_eos, tvl_usd, agg_rewards from line_protocol_10m where line_id in (?) and name = ?',
        [last_period_line_ids, name]
      )
    ).forEach(s => {
      last_period_line_map[s.line_id].last_period_protocol = s;
    });
    (
      await conn.query(
        'select line_id, tvl_eos, tvl_usd, agg_rewards from line_protocol_category_stat_10m where line_id in (?) and category = ? ',
        [last_period_line_ids, category]
      )
    ).forEach(s => {
      last_period_line_map[s.line_id].last_period_protocol_category_stat = s;
    });

    (
      await conn.query(
        'select line_id, tvl_eos, tvl_usd, agg_rewards from line_protocol_stat_10m where line_id in (?) ',
        [last_period_line_ids]
      )
    ).forEach(s => {
      last_period_line_map[s.line_id].last_period_protocol_stat = s;
    });
    return {
      last_period_line_ids,
      last_period_line_map,
    };
  }
  /**
   *
   * @param {*} conn db connect
   * @param {*} data log data
   * @param {*} protocol   current row protocol
   * @param {*} protocol_stat current row protocol stat
   * @param {*} protocol_category_stat current row protocol category stat
   * @param {*} period current period
   * @param {*} options
   * eg:
   * options = { line_type, last_period_protocol, last_period_protocol_stat, last_period_protocol_category_stat }
   */
  async saveLines(conn, data, protocol, protocol_stat, protocol_category_stat, period, options) {
    const { line_type, last_period_protocol, last_period_protocol_stat, last_period_protocol_category_stat } = options;

    const duration = DurationType[line_type].duration;
    const now_line_id = Util.convert_now_line_id(line_type, period);

    const name = data.protocol;
    const category = data.category;
    const tvl_eos = parseFloat(data.tvl) || 0;
    const tvl_usd = parseFloat(data.usd) || 0;

    const last_tvl_eos = protocol.tvl_eos;
    const last_tvl_usd = protocol.tvl_usd;

    // now tvl - latest tvl
    const tvl_eos_change = last_period_protocol ? Util.sub(tvl_eos, last_period_protocol.tvl_eos) : tvl_eos;
    const tvl_usd_change = last_period_protocol ? Util.sub(tvl_usd, last_period_protocol.tvl_usd) : tvl_usd;

    const agg_rewards = protocol.agg_rewards;
    const agg_rewards_change = last_period_protocol
      ? Util.sub(agg_rewards, last_period_protocol.agg_rewards)
      : agg_rewards;

    // update current protocol line
    const protocol_row = {
      name,
      tvl_eos,
      tvl_usd,
      tvl_eos_change,
      tvl_usd_change,
      agg_rewards,
      agg_rewards_change,
    };

    // current stat data - last tvl + now tvl
    const stat_tvl_eos = Util.subAdd(protocol_stat.tvl_eos, last_tvl_eos, tvl_eos);
    const stat_tvl_usd = Util.subAdd(protocol_stat.tvl_usd, last_tvl_usd, tvl_usd);

    const stat_agg_rewards = protocol_stat.agg_rewards;
    const stat_agg_rewards_change = last_period_protocol_stat
      ? Util.sub(stat_agg_rewards, last_period_protocol_stat.agg_rewards)
      : stat_agg_rewards;

    const stat_agg_protocol_count = protocol_stat.agg_protocol_count;

    // now stat tvl - latest stat tvl
    const stat_tvl_eos_change = last_period_protocol_stat
      ? Util.sub(stat_tvl_eos, last_period_protocol_stat.tvl_eos)
      : stat_tvl_eos;
    const stat_tvl_usd_change = last_period_protocol_stat
      ? Util.sub(stat_tvl_usd, last_period_protocol_stat.tvl_usd)
      : stat_tvl_usd;

    // update current stat line
    const protocol_stat_row = {
      tvl_eos: stat_tvl_eos,
      tvl_usd: stat_tvl_usd,
      tvl_eos_change: stat_tvl_eos_change,
      tvl_usd_change: stat_tvl_usd_change,
      agg_rewards: stat_agg_rewards,
      agg_rewards_change: stat_agg_rewards_change,
      agg_protocol_count: stat_agg_protocol_count,
    };

    // current stat data - last tvl + now tvl
    const category_stat_tvl_eos = Util.subAdd(protocol_category_stat.tvl_eos, last_tvl_eos, tvl_eos);
    const category_stat_tvl_usd = Util.subAdd(protocol_category_stat.tvl_usd, last_tvl_usd, tvl_usd);

    const category_stat_agg_rewards = protocol_category_stat.agg_rewards;
    const category_stat_agg_rewards_change = last_period_protocol_category_stat
      ? Util.sub(category_stat_agg_rewards, last_period_protocol_category_stat.agg_rewards)
      : category_stat_agg_rewards;

    const category_stat_agg_protocol_count = protocol_category_stat.agg_protocol_count;

    // now category stat tvl - latest category stat tvl
    const category_tvl_eos_change = last_period_protocol_category_stat
      ? Util.sub(category_stat_tvl_eos, last_period_protocol_category_stat.tvl_eos)
      : category_stat_tvl_eos;
    const category_tvl_usd_change = last_period_protocol_category_stat
      ? Util.sub(category_stat_tvl_usd, last_period_protocol_category_stat.tvl_usd)
      : category_stat_tvl_usd;

    // update current category stat line
    const protocol_category_stat_row = {
      category,
      tvl_eos: category_stat_tvl_eos,
      tvl_usd: category_stat_tvl_usd,
      tvl_eos_change: category_tvl_eos_change,
      tvl_usd_change: category_tvl_usd_change,
      agg_rewards: category_stat_agg_rewards,
      agg_rewards_change: category_stat_agg_rewards_change,
      agg_protocol_count: category_stat_agg_protocol_count,
    };

    // Record the data at the corresponding point in time
    if (now_line_id === period) {
      // table name
      const table_line_protocol = 'line_protocol_' + line_type;
      const table_line_protocol_stat = 'line_protocol_stat_' + line_type;
      const table_line_protocol_category_stat = 'line_protocol_category_stat_' + line_type;

      const line_id = now_line_id - duration;

      // save or update line_protocol
      let count = await conn.count(table_line_protocol, { line_id, name });
      if (count) {
        await conn.update(table_line_protocol, protocol_row, {
          where: {
            line_id,
            name,
          },
        });
      } else {
        protocol_row.line_id = line_id;
        await conn.insert(table_line_protocol, protocol_row);
      }

      // save or update line_protocol_stat
      count = await conn.count(table_line_protocol_stat, { line_id });
      if (count) {
        await conn.update(table_line_protocol_stat, protocol_stat_row, {
          where: {
            line_id,
          },
        });
      } else {
        protocol_stat_row.line_id = line_id;
        await conn.insert(table_line_protocol_stat, protocol_stat_row);
      }

      // save or update line_protocol_category_stat
      count = await conn.count(table_line_protocol_category_stat, { category, line_id });
      if (count) {
        await conn.update(table_line_protocol_category_stat, protocol_category_stat_row, {
          where: {
            category,
            line_id,
          },
        });
      } else {
        protocol_category_stat_row.line_id = line_id;
        await conn.insert(table_line_protocol_category_stat, protocol_category_stat_row);
      }
    }

    // return rows info
    return {
      protocol: protocol_row,
      protocol_stat: protocol_stat_row,
      protocol_category_stat: protocol_category_stat_row,
    };
  }
}
module.exports = OracleYieldService;
