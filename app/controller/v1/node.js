'use strict';
const BaseController = require('../base_controller');
const moment = require('moment');

/**
 * @Controller node
 */
class NodeController extends BaseController {

  /**
   * @Summary Get nodes.
   * @Router get /v1/nodes
   * @response 200 chain_node resp
  **/
  async list() {
    const { app } = this;
    const db = app.mysql.get('yield');
    const data = await db.query('select chain, chain_id, url, area, is_default from chain_node where status = 1 order by sort');
    super.success(data);
  }

}

module.exports = NodeController;
