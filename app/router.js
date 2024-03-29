'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/v1/nodes', controller.v1.node.list);

  router.get('/v1/protocols', controller.v1.protocols.protocol_page);
  router.get('/v1/protocols/stat', controller.v1.protocols.protocol_stat_show);
  router.get('/v1/protocols/categorystats', controller.v1.protocols.protocol_category_stat_list);
  router.get('/v1/protocols/categorystats/:category', controller.v1.protocols.protocol_category_stat_show);
  router.get('/v1/protocols/:name/sparkline', controller.v1.protocols.sparkline);
  router.get('/v1/protocols/:name', controller.v1.protocols.protocol_show);

  router.get('/v1/lines/:line_type', controller.v1.lines.list);
  router.get('/v1/lines/:line_type/stats', controller.v1.lines.stat_list);
  router.get('/v1/lines/:line_type/categorystats', controller.v1.lines.category_stat_list);

  router.get('/v1/echart/lines/:line_type', controller.v1.echart.list);
  router.get('/v1/echart/lines/:line_type/categorystats', controller.v1.echart.category_stat_list);

  router.post('/v1/ipfs/logo', controller.v1.ipfs.logo);

  router.get('/v1/reports', controller.v1.reports.report_page);
};
