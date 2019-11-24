'use strict';

module.exports = class cache {
    constructor(redis) {
      this.redis = redis;
    }

    async getIfExist (ctx, next) {
      
      next()
    }

    async setReq(ctx, next) {

    }
    
    async delete(ctx, next) {
  
        next()
      }
  
    async deleteBook(ctx, next) {
  
      }
  
    async deleteAuthor(ctx, next) {
  
      }
};
