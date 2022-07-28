'use strict';

const Subscription = require('egg').Subscription;
const process_status = require('../lib/enums/process_status');
const params_keys = require('../lib/enums/params_keys');
const sync_status = require('../lib/enums/sync_status');
const { camelProp, sleep } = require('../lib/util');

let local_status = sync_status.start;

class history_sync extends Subscription {
  static get schedule() {
    return {
      type: 'worker',
      disable: false,
      immediate: true,
    };
  }

  async subscribe() {
    const { app, ctx } = this;
    const yield_db = ctx.app.mysql.get('yield');
    const history_db = ctx.app.mysql.get('history');
    if (app.globalStatus === 0 || local_status !== sync_status.start) return;

    try {
      local_status = sync_status.processing;
      const param = await yield_db.get('params', { key: params_keys.history_sync_status });
      if (param.value !== sync_status.start) return;

      // get unprocessed events
      const events = await history_db.query(
        'select id, act_ids, status, type from dex_events where status in (?) limit 300',
        [[process_status.unprocessed, process_status.being_processed]]
      );
      if (events.length === 0) return;
      for (const event of events) {
        // dex_event update status
        if (event.status === process_status.unprocessed) {
          await history_db.update('dex_events', {
            id: event.id,
            status: process_status.being_processed,
          });
        }
        const act_ids = event.act_ids.split(',');
        // get actions
        const actions = await history_db.query(
          'select id, account, name, timestamp, data from dex_actions where id in (?)',
          [act_ids]
        );
        await yield_db.beginTransactionScope(async conn => {
          for (const action of actions) {
            const account = action.account;
            const name = action.name;
            const data = JSON.parse(action.data);
            ctx.logger.debug('start handle actionId:%s account:%s name:%s', action.id, action.account, action.name);
            // handle action
            await ctx.service[camelProp(account)][name](action, data, conn);
          }
          return { success: true };
        }, ctx);
        await history_db.update('dex_events', {
          id: event.id,
          status: process_status.completed,
        });
      }
    } catch (e) {
      ctx.logger.error('history sync error：', e);
      local_status = sync_status.stop;
      await yield_db.update(
        'params',
        {
          value: local_status,
        },
        {
          where: {
            key: params_keys.history_sync_status,
          },
        }
      );
    } finally {
      if (local_status === sync_status.processing) local_status = sync_status.start;
      ctx.logger.info('end history_sync');
      if (app.globalStatus === 1) {
        await sleep(1000);
        await app.runSchedule('history_sync.js');
      }
    }
  }
}

module.exports = history_sync;
