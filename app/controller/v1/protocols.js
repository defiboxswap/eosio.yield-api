'use strict';
const BaseController = require('../base_controller');
/**
 * @Controller protocols
 */
class ProtocolsController extends BaseController {

  
  /**
   * @Summary Get protocols
   * @Router get /v1/protocols
   * @Request query number pageNo page no
   * @Request query number pageSize page size
   * @Request query string search fuzzy search metadata name
   * @Request query string category protocol category
   * @Request query string status enum:pending,active,denied
   * @Request query string order enum:tvl_usd,tvl_usd_change,agg_rewards,create_at
   * @response 200 protocol resp
   */
  async protocol_page() {
    const { app, ctx } = this;
    const db = app.mysql.get('yield');
    const rules = {
      pageNo: { type: 'number', required: false },
      pageSize: { type: 'number', required: false },
      search: { type: 'string', trim: true, required: false },
      category: { type: 'string', trim: true, required: false },
      status: { type: 'string', trim: true, required: false, values: [ 'pending', 'active', 'denied' ] },
      order: { type: 'enum', trim: true, required: false, values: [ 'tvl_usd', 'tvl_usd_change', 'agg_rewards', 'create_at' ] },
    };
    const params = {
      pageNo: ctx.request.query.pageNo ? parseInt(ctx.request.query.pageNo) : 1,
      pageSize: ctx.request.query.pageSize ? parseInt(ctx.request.query.pageSize) : 100,
      search: ctx.request.query.search,
      category: ctx.request.query.category,
      status: ctx.request.query.status,
      order: ctx.request.query.order || 'tvl_usd',
    };
    // validate
    ctx.validate(rules, params);
    // Limit the maximum number of rows
    if (params.pageSize > 300) params.pageSize = 300;

    let sql = 'select * from protocol where is_delete = 0 ';
    if (params.search) {
      sql += ' and metadata_name like :search ';
    }
    if (params.category) {
      sql += ' and category = :category ';
    } 
    if (params.status) {
      sql += ' and status = :status ';
    }
    sql += ` order by ${params.order} desc limit :offset, :limit `;
    const data = await db.query(sql,
      {
        search: '%' + params.search + '%',
        status: params.status,
        category: params.category,
        offset: (params.pageNo - 1) * params.pageSize,
        limit: params.pageSize,
      }
    );

    super.success(data);
  }

  /**
   * @Summary Get protocol detail.
   * @Router get /v1/protocols/{name}
   * @Request path string *name protocol name
   * @response 200 protocol resp
  **/
  async protocol_show() {
    const { app, ctx } = this;
    const db = app.mysql.get('yield');
    const rules = {
      name: { type: 'string', required: true },
    };
    const params = {
      name: ctx.params.name,
    };
    ctx.validate(rules, params);

    const data = await db.get('protocol', { name: params.name });
    if (data) {
      const rankResult = await db.queryOne('select count(*) + 1 rank from protocol where is_delete = 0 and tvl_eos > ?', 
      [ data.tvl_eos]);
      data.rank = rankResult.rank;
    }
    super.success(data);
  }

  /**
     * @Summary Get current protocol category stats.
     * @Router get /v1/protocols/categorystats
     * @response 200 protocolt_category_stat resp
    **/
  async protocol_category_stat_list() {
    const { app } = this;
    const db = app.mysql.get('yield');
    const data = await db.select('protocol_category_stat');
    super.success(data);
  }

  /**
     * @Summary Get protocol category stat detail.
     * @Router get /v1/protocols/categorystats/{category}
     * @Request path string *category protocol category
     * @response 200 protocolt_category_stat resp
    **/
  async protocol_category_stat_show() {
    const { app, ctx } = this;
    const db = app.mysql.get('yield');
    const rules = {
      category: { type: 'string', required: true },
    };
    const params = {
      category: ctx.params.category,
    };
    // validate
    ctx.validate(rules, params);

    const data = await db.get('protocol_category_stat', { category: params.category });
    super.success(data);
  }


  /**
 * @Summary Get current protocol stat.
 * @Router get /v1/protocols/stat
 * @response 200 protocol_stat resp
**/
  async protocol_stat_show() {
    const { app } = this;
    const db = app.mysql.get('yield');
    const data = await db.get('protocol_stat');
    super.success(data);
  }

}

module.exports = ProtocolsController;
