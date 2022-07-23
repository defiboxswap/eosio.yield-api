'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const Util = require('../lib/utils/util');
const ProtocolStatus = require('../lib/enums/protocol_status');
const DurationType = require('../lib/enums/duration_type');
/**
 * log service
 */
class LogService extends Service {
  /** ************************************************************** eosio.yield log **********************************************/
  async balancelog(action, data, conn) {}
  async createlog(action, data, conn) {
    const name = data.protocol;
    const category = data.category;
    const status = data.status;
    const metadata = Util.array_to_map(data.metadata || {});
    const metadata_name = metadata.name;
    // carete protocol
    const row = {
      name,
      metadata_name,
      metadata: JSON.stringify(metadata),
      category,
      contracts: JSON.stringify([name]),
      evm: '[]',
      status: ProtocolStatus.pending,
      is_delete: 0,
      create_at: moment(moment(action.timestamp).format('YYYY-MM-DD HH:mm:ss+00:00')).unix(),
    };
    const protocol = await conn.get('protocol', { name });
    if (!protocol) {
      await conn.insert('protocol', row);
    } else {
      row.id = protocol.id;
      await conn.update('protocol', row);
    }

    // add stat row
    const protocol_stat = await conn.get('protocol_stat');
    if (!protocol_stat) {
      await conn.insert('protocol_stat', {});
    }

    // add category stat row
    const protocol_category_stat = await conn.get('protocol_category_stat', { category });
    if (!protocol_category_stat) {
      await conn.insert('protocol_category_stat', { category });
    }
  }

  async metadatalog(action, data, conn) {
    const name = data.protocol;
    const metadata = Util.array_to_map(data.metadata || {});
    const metadata_name = metadata.name;
    // update protocol
    const protocol = await conn.get('protocol', { name });
    await conn.update('protocol', {
      id: protocol.id,
      metadata: JSON.stringify(metadata),
      metadata_name,
    });
    await this.statuslog(action, data, conn);
  }

  async contractslog(action, data, conn) {
    const name = data.protocol;
    const contracts = JSON.stringify(data.contracts || []);
    const evm = JSON.stringify(data.evm || []);
    // update protocol
    const protocol = await conn.get('protocol', { name });
    await conn.update('protocol', {
      id: protocol.id,
      contracts,
      evm,
    });
    await this.statuslog(action, data, conn);
  }

  async categorylog(action, data, conn) {
    const name = data.protocol;
    const category = data.category;
    const protocol = await conn.get('protocol', { name });
    // update protocol
    await conn.update('protocol', {
      id: protocol.id,
      category,
    });
    if (protocol.category !== category && protocol.status === ProtocolStatus.active) {
      // update original category stat
      await this.updateStatusOrCategoryForProtocolCategoryStat(conn, protocol, protocol.category, false);

      // update new category stat
      await this.updateStatusOrCategoryForProtocolCategoryStat(conn, protocol, category, true);
    }
    await this.statuslog(action, data, conn);
  }

  async statuslog(action, data, conn) {
    const name = data.protocol;
    const status = data.status;
    // update protocol
    const protocol = await conn.get('protocol', { name });
    if (!status || protocol.status === status) return;
    await conn.update('protocol', {
      id: protocol.id,
      status,
    });
    // pending / denied ==> active
    if (
      (protocol.status === ProtocolStatus.pending || protocol.status === ProtocolStatus.denied) &&
      status === ProtocolStatus.active
    ) {
      await this.updateStatusOrCategoryForProtocolStat(conn, protocol, true);
      await this.updateStatusOrCategoryForProtocolCategoryStat(conn, protocol, protocol.category, true);
    }
    //active ==> pending/denied
    if (
      protocol.status === ProtocolStatus.active &&
      (status === ProtocolStatus.pending || status === ProtocolStatus.denied)
    ) {
      await this.updateStatusOrCategoryForProtocolStat(conn, protocol, false);
      await this.updateStatusOrCategoryForProtocolCategoryStat(conn, protocol, protocol.category, false);
    }
  }

  async claimlog(action, data, conn) {
    const name = data.protocol;
    const claimed = parseFloat(data.claimed);
    const balance = parseFloat(data.balance);
    // update protocol
    const protocol = await conn.get('protocol', { name });
    await conn.update('protocol', {
      id: protocol.id,
      claimed: Util.add(protocol.claimed, claimed),
      balance,
    });
    // update protocol category stat
    const protocol_category_stat = await conn.get('protocol_category_stat', { category: protocol.category });
    await conn.update('protocol_category_stat', {
      id: protocol_category_stat.id,
      claimed: Util.add(protocol_category_stat.claimed, claimed),
    });
    // update protocol stat
    const protocol_stat = await conn.get('protocol_stat');
    await conn.update('protocol_stat', {
      id: protocol_stat.id,
      claimed: Util.add(protocol_stat.claimed, claimed),
    });
  }

  async eraselog(action, data, conn) {
    const name = data.protocol;
    // update protocol
    const protocol = await conn.get('protocol', { name });
    await conn.update('protocol', {
      id: protocol.id,
      tvl_eos: 0,
      tvl_usd: 0,
      tvl_eos_change: 0,
      tvl_usd_change: 0,
      agg_rewards_change: 0,
      balance: 0,
      is_delete: 1,
    });
    if (protocol.status === ProtocolStatus.active) {
      await this.updateStatusOrCategoryForProtocolStat(conn, protocol, false);
      await this.updateStatusOrCategoryForProtocolCategoryStat(conn, protocol, protocol.category, false);
    }
  }

  /**
   * handle action for account {eosio.yield } name {rewardslog}
   * @param {*} action action data
   * @param {json} data log data
   * @param {*} conn sql connection
   */
  async rewardslog(action, data, conn) {
    const name = data.protocol;
    const category = data.category;
    const balance = parseFloat(data.balance);
    const now = moment(moment(data.period).format('YYYY-MM-DD HH:mm:ss+00:00'));
    const period = now.unix();

    const tvl_eos = parseFloat(data.tvl) || 0;
    const tvl_usd = parseFloat(data.usd) || 0;

    // get protocol
    const protocol = await conn.get('protocol', { name });
    // get protocol stat
    const protocol_stat = await conn.get('protocol_stat');
    // get protocol category stat
    const protocol_category_stat = await conn.get('protocol_category_stat', { category });
    // 10m info
    const options_10m = {
      period,
      table_prefix: '10m',
    };
    await this.updatelog(conn, data, protocol, protocol_stat, protocol_category_stat, options_10m);
    // 8h info
    const options_8h = {
      period,
      table_prefix: '8h',
    };
    await this.updatelog(conn, data, protocol, protocol_stat, protocol_category_stat, options_8h);
    // 24 info
    const options_24h = {
      period,
      table_prefix: 'day',
    };
    const result_24 = await this.updatelog(conn, data, protocol, protocol_stat, protocol_category_stat, options_24h);

    // update protocol
    await conn.update('protocol', {
      id: protocol.id,
      tvl_eos,
      tvl_usd,
      tvl_eos_change: result_24.protocol.tvl_eos_change,
      tvl_usd_change: result_24.protocol.tvl_usd_change,
      agg_rewards: result_24.protocol.agg_rewards,
      agg_rewards_change: result_24.protocol.agg_rewards_change,
      balance,
      period,
    });

    // update protocol gategory stat
    await conn.update('protocol_category_stat', {
      id: protocol_category_stat.id,
      tvl_eos: result_24.protocol_category_stat.tvl_eos,
      tvl_usd: result_24.protocol_category_stat.tvl_usd,
      tvl_eos_change: result_24.protocol_category_stat.tvl_eos_change,
      tvl_usd_change: result_24.protocol_category_stat.tvl_usd_change,
      agg_rewards: result_24.protocol_category_stat.agg_rewards,
      agg_rewards_change: result_24.protocol_category_stat.agg_rewards_change,
      agg_protocol_count: result_24.protocol_category_stat.agg_protocol_count,
      period,
    });

    // update protocol stat
    await conn.update('protocol_stat', {
      id: protocol_stat.id,
      tvl_eos: result_24.protocol_stat.tvl_eos,
      tvl_usd: result_24.protocol_stat.tvl_usd,
      tvl_eos_change: result_24.protocol_stat.tvl_eos_change,
      tvl_usd_change: result_24.protocol_stat.tvl_usd_change,
      agg_rewards: result_24.protocol_stat.agg_rewards,
      agg_rewards_change: result_24.protocol_stat.agg_rewards_change,
      agg_protocol_count: result_24.protocol_stat.agg_protocol_count,
      period,
    });
  }

  /** ************************************************************** private function **********************************************/
  /**
   *
   * @param {*} conn db connect
   * @param {*} data log data
   * @param {*} protocol   current row protocol
   * @param {*} protocol_stat current row protocol stat
   * @param {*} protocol_category_stat current row protocol category stat
   * @param {*} options
   * eg:
   * options = {
   *    period, // now period
   *    table_prefix : '8h',
   *   }
   */
  async updatelog(conn, data, protocol, protocol_stat, protocol_category_stat, options) {
    const { period, table_prefix } = options;

    const duration = DurationType[table_prefix];
    const now_line_id = Util.convert_now_line_id(table_prefix, period);
    // Obtain the data 24h/8h/10m ago for tvl_eos_change/tvl_usd_change
    const last_period_line_id = period - duration - 600;
    // table name
    const table_line_protocol = 'line_protocol_' + table_prefix;
    const table_line_protocol_stat = 'line_protocol_stat_' + table_prefix;
    const table_line_protocol_category_stat = 'line_protocol_category_stat_' + table_prefix;

    const name = data.protocol;
    const category = data.category;
    const tvl_eos = parseFloat(data.tvl) || 0;
    const tvl_usd = parseFloat(data.usd) || 0;
    const rewards = parseFloat(data.rewards) || 0;

    const last_tvl_eos = protocol.tvl_eos;
    const last_tvl_usd = protocol.tvl_usd;

    const agg_rewards = Util.add(protocol.agg_rewards, rewards);
    // get protocol line
    const last_period_protocol = await conn.get('line_protocol_10m', {
      line_id: last_period_line_id,
      name,
    });
    // now tvl - latest tvl
    const tvl_eos_change = last_period_protocol ? Util.sub(tvl_eos, last_period_protocol.tvl_eos) : tvl_eos;
    const tvl_usd_change = last_period_protocol ? Util.sub(tvl_usd, last_period_protocol.tvl_usd) : tvl_usd;
    const agg_rewards_change = last_period_protocol
      ? Util.sub(agg_rewards, last_period_protocol.agg_rewards)
      : agg_rewards;

    // update current protocol line
    const protolcol_row = {
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

    const stat_agg_rewards = Util.add(protocol_stat.agg_rewards, rewards);
    const stat_agg_protocol_count = protocol_stat.agg_protocol_count;

    const last_period_protocol_stat = await conn.get('line_protocol_stat_10m', { line_id: last_period_line_id });
    // now stat tvl - latest stat tvl
    const stat_tvl_eos_change = last_period_protocol_stat
      ? Util.sub(stat_tvl_eos, last_period_protocol_stat.tvl_eos)
      : stat_tvl_eos;
    const stat_tvl_usd_change = last_period_protocol_stat
      ? Util.sub(stat_tvl_usd, last_period_protocol_stat.tvl_usd)
      : stat_tvl_usd;
    const stat_agg_rewards_change = last_period_protocol_stat
      ? Util.sub(stat_agg_rewards, last_period_protocol_stat.agg_rewards)
      : stat_agg_rewards;

    // update current stat line
    const protolcol_stat_row = {
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

    const category_stat_agg_rewards = Util.add(protocol_category_stat.agg_rewards, rewards);
    const category_stat_agg_protocol_count = protocol_category_stat.agg_protocol_count;

    // now category stat tvl - latest category stat tvl
    const last_period_protocol_category_stat = await conn.get('line_protocol_category_stat_10m', {
      line_id: last_period_line_id,
      category,
    });
    const category_tvl_eos_change = last_period_protocol_category_stat
      ? Util.sub(category_stat_tvl_eos, last_period_protocol_category_stat.tvl_eos)
      : category_stat_tvl_eos;
    const category_tvl_usd_change = last_period_protocol_category_stat
      ? Util.sub(category_stat_tvl_usd, last_period_protocol_category_stat.tvl_usd)
      : category_stat_tvl_usd;
    const category_stat_agg_rewards_change = last_period_protocol_category_stat
      ? Util.sub(category_stat_agg_rewards, last_period_protocol_category_stat.agg_rewards)
      : category_stat_agg_rewards;

    // update current category stat line
    const protolcol_category_stat_row = {
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
      const line_id = now_line_id - duration;
      const line_protocol_ = await conn.get(table_line_protocol, { name, line_id });
      if (!line_protocol_) {
        protolcol_row.line_id = line_id;
        await conn.insert(table_line_protocol, protolcol_row);
      } else {
        await conn.update(table_line_protocol, protolcol_row, {
          where: {
            name,
            line_id,
          },
        });
      }

      const line_protocol_stat_ = await conn.get(table_line_protocol_stat, { line_id });
      if (!line_protocol_stat_) {
        protolcol_stat_row.line_id = line_id;
        await conn.insert(table_line_protocol_stat, protolcol_stat_row);
      } else {
        await conn.update(table_line_protocol_stat, protolcol_stat_row, {
          where: {
            line_id,
          },
        });
      }

      const line_protocol_category_stat_ = await conn.get(table_line_protocol_category_stat, { category, line_id });
      if (!line_protocol_category_stat_) {
        protolcol_category_stat_row.line_id = line_id;
        await conn.insert(table_line_protocol_category_stat, protolcol_category_stat_row);
      } else {
        await conn.update(table_line_protocol_category_stat, protolcol_category_stat_row, {
          where: {
            category,
            line_id,
          },
        });
      }
    }

    // return rows info
    return {
      protocol: protolcol_row,
      protocol_stat: protolcol_stat_row,
      protocol_category_stat: protolcol_category_stat_row,
    };
  }

  async updateStatusOrCategoryForProtocolStat(conn, protocol, is_add) {
    // update protocol stat
    const protocol_stat = await conn.get('protocol_stat');
    if (protocol_stat) {
      const row = this.getRow(protocol_stat, protocol, is_add);
      await conn.update('protocol_stat', row);
    }
  }

  async updateStatusOrCategoryForProtocolCategoryStat(conn, protocol, category, is_add) {
    // update protocol category stat
    const protocol_category_stat = await conn.get('protocol_category_stat', { category });
    if (protocol_category_stat) {
      const row = this.getRow(protocol_category_stat, protocol, is_add);
      await conn.update('protocol_category_stat', row);
    } else {
      await conn.insert('protocol_category_stat', {
        category,
        tvl_eos: protocol.tvl_eos,
        tvl_usd: protocol.tvl_usd,
        tvl_eos_change: protocol.tvl_eos,
        tvl_usd_change: protocol.tvl_usd,
        claimed: protocol.claimed,
        agg_rewards: protocol.agg_rewards,
        agg_rewards_change: protocol.agg_rewards_change,
        agg_protocol_count: 1,
      });
    }
  }

  getRow(table_data, protocol, is_add) {
    return {
      id: table_data.id,
      tvl_eos: is_add ? Util.add(table_data.tvl_eos, protocol.tvl_eos) : Util.sub(table_data.tvl_eos, protocol.tvl_eos),
      tvl_usd: is_add ? Util.add(table_data.tvl_usd, protocol.tvl_usd) : Util.sub(table_data.tvl_usd, protocol.tvl_usd),
      tvl_eos_change: is_add
        ? Util.add(table_data.tvl_eos_change, protocol.tvl_eos)
        : Util.sub(table_data.tvl_eos_change, protocol.tvl_eos),
      tvl_usd_change: is_add
        ? Util.add(table_data.tvl_usd_change, protocol.tvl_usd)
        : Util.sub(table_data.tvl_usd_change, protocol.tvl_usd),
      agg_rewards: is_add
        ? Util.add(table_data.agg_rewards, protocol.agg_rewards)
        : Util.sub(table_data.agg_rewards, protocol.agg_rewards),
      agg_rewards_change: is_add
        ? Util.add(table_data.agg_rewards_change, protocol.agg_rewards)
        : Util.sub(table_data.agg_rewards_change, protocol.agg_rewards),
      claimed: is_add ? Util.add(table_data.claimed, protocol.claimed) : Util.sub(table_data.claimed, protocol.claimed),
      agg_protocol_count: is_add ? table_data.agg_protocol_count + 1 : table_data.agg_protocol_count - 1,
    };
  }
}

module.exports = LogService;
