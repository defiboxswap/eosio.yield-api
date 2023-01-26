'use strict';

const Subscription = require('egg').Subscription;
const Crawler = require('crawler');

const PATH_URL = 'https://eosnetwork.com/blog/category/yield-reports/';

class report_sync extends Subscription {
  static get schedule() {
    return {
      interval: '5m',
      type: 'worker',
      disable: false,
      immediate: true,
    };
  }

  async subscribe() {
    const { ctx } = this;
    const yield_db = ctx.app.mysql.get('yield');
    try {
      const report = await yield_db.queryOne('select id from report order by id desc limit 1');
      const lastId = report ? report.id : 0;
      const c = new Crawler({
        maxConnections: 1,
        retries: 3,
        callback(error, res, done) {
          if (error) {
            ctx.logger.error('report sync queue error: ', error);
          } else {
            const $ = res.$;
            const reports = $('article.blog__grid-post');
            reports.each(async (_, report) => {
              const id = report.attribs.id.split('-')[1];
              if (id <= lastId) {
                return;
              }
              const url = $(report).find('a.blog__grid-post-image-link')[0].attribs.href.trim();
              const title = $(report).find('a.blog__grid-post-title-link').text()
                .trim();
              const image = $(report).find('picture img')[1].attribs.src.trim();

              await yield_db.insert('report', {
                id,
                url,
                title,
                image,
              });
            });
          }
          done();
        },
      });
      c.queue({
        url: PATH_URL,
        headers: { 'User-Agent': 'requests' },
      });
    } catch (e) {
      ctx.logger.error('report sync error: ', e);
    } finally {
      ctx.logger.info('end report_sync');
    }
  }
}

module.exports = report_sync;
