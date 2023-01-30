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
    let page = 2;
    try {
      const c = new Crawler({
        maxConnections: 1,
        retries: 3,
        callback(error, res, done) {
          if (error) {
            ctx.logger.error('report sync queue error: ', error);
          } else {
            if (res.body.indexOf('Page not found') > -1) {
              return;
            }
            const $ = res.$;
            const reports = $('article.blog__grid-post');
            reports.each(async (_, report) => {
              const id = parseInt(report.attribs.id.split('-')[1]);
              const url = $(report).find('a.blog__grid-post-image-link')[0].attribs.href.trim();
              const title = $(report).find('a.blog__grid-post-title-link').text()
                .trim();
              const image = $(report).find('picture img')[1].attribs.src.trim();
              const laste_reading = $(report).find('span.blog__grid-post-timer').text()
                .trim();
              const create_at = $(report).find('span.post-meta__date').text()
                .trim();

              const count = await yield_db.count('report', { id });
              if (count > 0) {
                await yield_db.query('update report set laste_reading =? where id = ?', [ laste_reading, id ]);
              } else {
                await yield_db.insert('report', {
                  id,
                  url,
                  title,
                  image,
                  laste_reading,
                  create_at,
                });
              }
            });

            c.queue({
              url: PATH_URL + 'page/' + page,
              headers: { 'User-Agent': 'requests' },
            });
            page++;
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
