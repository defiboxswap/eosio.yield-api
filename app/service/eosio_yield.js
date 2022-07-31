'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const Util = require('../lib/util');
const ProtocolStatus = require('../lib/enums/protocol_status');
const DurationType = require('../lib/enums/duration_type');
const Constants = require('../lib/constants');
/**
 * eosio_yield log service
 */
class EosioYieldService extends Service {
  /** ************************************************************** eosio.yield log **********************************************/
  async balancelog(action, data, conn) {}
  async createlog(action, data, conn) {
    const name = data.protocol;
    const category = data.category;
    const status = data.status || ProtocolStatus.pending;
    const metadata = Util.array_to_object(data.metadata || {});
    const metadata_name = metadata.name;
    // carete protocol
    const row = {
      name,
      metadata_name,
      metadata: JSON.stringify(metadata),
      category,
      contracts: JSON.stringify([name]),
      status: status,
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
    const metadata = Util.array_to_object(data.metadata || {});
    const metadata_name = metadata.name;
    const category = data.category;
    // update protocol
    const protocol = await conn.get('protocol', { name });
    await conn.update('protocol', {
      id: protocol.id,
      category,
      metadata: JSON.stringify(metadata),
      metadata_name,
    });
    if (protocol.category !== category && protocol.status === ProtocolStatus.active) {
      // update original category stat
      await this.updateStatusOrCategoryForProtocolCategoryStat(conn, protocol, protocol.category, false);

      // update new category stat
      await this.updateStatusOrCategoryForProtocolCategoryStat(conn, protocol, category, true);
    }
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

    const row = {
      id: protocol.id,
      tvl_eos: 0,
      tvl_usd: 0,
      agg_rewards_change: 0,
      balance: 0,
      is_delete: 1,
      status: ProtocolStatus.pending,
    };
    for (const line_type of Constants.skip_10m_durations) {
      row['tvl_eos_change_' + line_type] = 0;
      row['tvl_usd_change_' + line_type] = 0;
    }
    await conn.update('protocol', row);
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

    // get protocol
    const protocol = await conn.get('protocol', { name });

    if (period <= protocol.period) return;

    // get protocol stat
    const protocol_stat = await conn.get('protocol_stat');
    // get protocol category stat
    const protocol_category_stat = await conn.get('protocol_category_stat', { category });

    const { last_period_line_ids, last_period_line_map } = await this.batchGetLastLines(conn, period, name, category);

    let protocol_row = {
      id: protocol.id,
      balance,
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
        protocol_row.agg_rewards = result.protocol.agg_rewards;
        protocol_row.agg_rewards_change = result.protocol.agg_rewards_change;

        protocol_category_stat_row.tvl_eos = result.protocol_category_stat.tvl_eos;
        protocol_category_stat_row.tvl_usd = result.protocol_category_stat.tvl_usd;
        protocol_category_stat_row.agg_rewards = result.protocol_category_stat.agg_rewards;
        protocol_category_stat_row.agg_rewards_change = result.protocol_category_stat.agg_rewards_change;
        protocol_category_stat_row.agg_protocol_count = result.protocol_category_stat.agg_protocol_count;

        protocol_stat_row.tvl_eos = result.protocol_stat.tvl_eos;
        protocol_stat_row.tvl_usd = result.protocol_stat.tvl_usd;
        protocol_stat_row.agg_rewards = result.protocol_stat.agg_rewards;
        protocol_stat_row.agg_rewards_change = result.protocol_stat.agg_rewards_change;
        protocol_stat_row.agg_protocol_count = result.protocol_stat.agg_protocol_count;
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
    const columns = ['line_id', 'tvl_eos', 'tvl_usd', 'agg_rewards'];
    (
      await conn.select('line_protocol_10m', {
        where: {
          line_id: last_period_line_ids,
          name,
        },
        columns,
      })
    ).forEach(s => {
      last_period_line_map[s.line_id].last_period_protocol = s;
    });
    (
      await conn.select('line_protocol_category_stat_10m', {
        where: {
          line_id: last_period_line_ids,
          category,
        },
        columns,
      })
    ).forEach(s => {
      last_period_line_map[s.line_id].last_period_protocol_category_stat = s;
    });

    (
      await conn.select('line_protocol_stat_10m', {
        where: {
          line_id: last_period_line_ids,
        },
        columns,
      })
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
    const rewards = parseFloat(data.rewards) || 0;

    const last_tvl_eos = protocol.tvl_eos;
    const last_tvl_usd = protocol.tvl_usd;

    const agg_rewards = Util.add(protocol.agg_rewards, rewards);

    // now tvl - latest tvl
    const tvl_eos_change = last_period_protocol ? Util.sub(tvl_eos, last_period_protocol.tvl_eos) : tvl_eos;
    const tvl_usd_change = last_period_protocol ? Util.sub(tvl_usd, last_period_protocol.tvl_usd) : tvl_usd;
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

    const stat_agg_rewards = Util.add(protocol_stat.agg_rewards, rewards);
    const stat_agg_protocol_count = protocol_stat.agg_protocol_count;

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

    const category_stat_agg_rewards = Util.add(protocol_category_stat.agg_rewards, rewards);
    const category_stat_agg_protocol_count = protocol_category_stat.agg_protocol_count;

    // now category stat tvl - latest category stat tvl
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

      // save line_protocol
      protocol_row.line_id = line_id;
      await conn.insert(table_line_protocol, protocol_row);

      // save or update line_protocol_stat
      let count = await conn.count(table_line_protocol_stat, { line_id });
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
      const row = {
        category,
        tvl_eos: protocol.tvl_eos,
        tvl_usd: protocol.tvl_usd,
        claimed: protocol.claimed,
        agg_rewards: protocol.agg_rewards,
        agg_rewards_change: protocol.agg_rewards_change,
        agg_protocol_count: 1,
      };
      for (const line_type of Constants.skip_10m_durations) {
        const tvl_eos_change = 'tvl_eos_change_' + line_type;
        const tvl_usd_change = 'tvl_usd_change_' + line_type;
        row[tvl_eos_change] = protocol.tvl_eos;
        row[tvl_usd_change] = protocol.tvl_usd;
      }
      await conn.insert('protocol_category_stat', row);
    }
  }

  getRow(table_data, protocol, is_add) {
    const row = {
      id: table_data.id,
      tvl_eos: is_add ? Util.add(table_data.tvl_eos, protocol.tvl_eos) : Util.sub(table_data.tvl_eos, protocol.tvl_eos),
      tvl_usd: is_add ? Util.add(table_data.tvl_usd, protocol.tvl_usd) : Util.sub(table_data.tvl_usd, protocol.tvl_usd),
      agg_rewards: is_add
        ? Util.add(table_data.agg_rewards, protocol.agg_rewards)
        : Util.sub(table_data.agg_rewards, protocol.agg_rewards),
      agg_rewards_change: is_add
        ? Util.add(table_data.agg_rewards_change, protocol.agg_rewards)
        : Util.sub(table_data.agg_rewards_change, protocol.agg_rewards),
      claimed: is_add ? Util.add(table_data.claimed, protocol.claimed) : Util.sub(table_data.claimed, protocol.claimed),
      agg_protocol_count: is_add ? table_data.agg_protocol_count + 1 : table_data.agg_protocol_count - 1,
    };
    for (const line_type of Constants.skip_10m_durations) {
      const tvl_eos_change = 'tvl_eos_change_' + line_type;
      const tvl_usd_change = 'tvl_usd_change_' + line_type;
      row[tvl_eos_change] = is_add
        ? Util.add(table_data[tvl_eos_change], protocol.tvl_eos)
        : Util.sub(table_data[tvl_eos_change], protocol.tvl_eos);
      row[tvl_usd_change] = is_add
        ? Util.add(table_data[tvl_usd_change], protocol.tvl_usd)
        : Util.sub(table_data[tvl_usd_change], protocol.tvl_usd);
    }
    return row;
  }
}

module.exports = EosioYieldService;
