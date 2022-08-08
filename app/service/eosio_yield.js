'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const Util = require('../lib/util');
const ProtocolStatus = require('../lib/enums/protocol_status');
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
    if (category && protocol.category !== category && protocol.status === ProtocolStatus.active) {
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
    if (!status) return;

    const protocol = await conn.get('protocol', { name });
    if (protocol.status === status) return;
    // update protocol
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
    const rewards = parseFloat(data.rewards);
    const period = moment(data.period + '+00:00').unix();
    if(rewards === 0) return;
    //irreversible handle
    let rewards_change = rewards;
    if (period.rewards_period === period) {
      const protocol = await conn.queryOne('select rewards from protocol where name = ?', [name]);
      rewards_change = Util.sub(protocol.rewards, rewards);
      if (rewards_change === 0) return;
    }

    // update protocol
    await conn.query(
      'update protocol set balance=?,rewards=?,rewards_period = ?,agg_rewards=agg_rewards + ?,agg_rewards_change=agg_rewards_change + ? where name = ?',
      [balance, rewards, period, rewards_change, rewards_change, name]
    );
    // update protocol gategory stat
    await conn.query(
      'update protocol_category_stat set rewards_period = ?,agg_rewards=agg_rewards + ?,agg_rewards_change=agg_rewards_change + ? where category=?',
      [period, rewards_change, rewards_change, category]
    );
    // update protocol stat
    await conn.query(
      'update protocol_stat set rewards_period = ?,agg_rewards=agg_rewards + ?,agg_rewards_change=agg_rewards_change + ?',
      [period, rewards_change, rewards_change]
    );

    for (const line_type of Constants.all_durations) {
      // table name
      const table_line_protocol = 'line_protocol_' + line_type;
      const table_line_protocol_stat = 'line_protocol_stat_' + line_type;
      const table_line_protocol_category_stat = 'line_protocol_category_stat_' + line_type;

      const line_id = Util.convert_last_line_id(line_type, period);
      // update line_protocol_stat
      await conn.query(
        `update ${table_line_protocol} set agg_rewards=agg_rewards+?,agg_rewards_change=agg_rewards_change+? where line_id=? and name = ?`,
        [rewards_change, rewards_change, line_id, name]
      );

      // update line_protocol_stat
      await conn.query(
        `update ${table_line_protocol_stat} set agg_rewards=agg_rewards+?,agg_rewards_change=agg_rewards_change+? where line_id=?`,
        [rewards_change, rewards_change, line_id]
      );

      // update line_protocol_category_stat
      await conn.query(
        `update ${table_line_protocol_category_stat} set agg_rewards=agg_rewards+?,agg_rewards_change=agg_rewards_change+? where line_id=? and category = ?`,
        [rewards_change, rewards_change, line_id, category]
      );
    }
  }

  /** ************************************************************** private function **********************************************/
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
