'use strict';

const Service = require('egg').Service;

/**
 * cache service
 */
class CacheService extends Service {
    async lru_computeIfAbsent(key, get_func) {
        let result = await this.lru_get(key);
        if(result) return result;
        result = await get_func();
        if(result){
            await this.lru_set(key, result);
        }
        return result;
    }

    async lru_set(key, value) {
        const { app } = this;
        app.lru.set(key, value);
    }
    
    async lru_get(key) {
        const { app } = this;
        return app.lru.get(key);
    }
}
module.exports = CacheService;
