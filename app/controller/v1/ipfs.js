'use strict';
const BaseController = require('../base_controller');
const fs = require('fs');
const ErrorCode = require('../../lib/enums/error_code');

/**
 * @Controller ipfs
 */
class IpfsController extends BaseController {
  /**
   * @Summary Upload logo.
   * @Router post /v1/ipfs/logo
   * @Request formData file file logo file
   * @response 200 ipfs_result resp
   **/
  async logo() {
    const { app, ctx } = this;
    const rules = {
      file: { type: 'object', required: true },
    };
    const params = {
      file: ctx.request.files[0],
    };
    // validate
    ctx.validate(rules, params);
    let result;
    try {
      result = await ctx.curl(app.config.pinata_url, {
        method: 'POST',
        dataType: 'json',
        headers: {
          pinata_api_key: app.config.pinata_api_key,
          pinata_secret_api_key: app.config.pinata_secret_api_key,
        },
        files: Buffer.from(fs.readFileSync(params.file.filepath), 'binary'),
        data: {
          pinataMetadata: JSON.stringify({ name: params.file.filename, keyvalues: { tag: 'EOS_Yield+_logo' } }),
        },
        timeout: 10000,
      });
      if (result.status !== 200) {
        super.error(result.status, result.data.error);
      }else {
        super.success({
          ipfs_hash: result.data.IpfsHash,
          pin_size: result.data.PinSize,
          timestamp: result.data.Timestamp,
          is_duplicate: result.data.isDuplicate,
        });
      }
    } catch (e) {
      super.error(ErrorCode.timeout.code, ErrorCode.timeout.msg);
    }
  }
}
module.exports = IpfsController;
