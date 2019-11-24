'use strict';

const redis = require('redis');
const { promisify } = require('util');

module.exports = class Redis {
    constructor() {
        this.client = null;
        this._connect();
        this.set = promisify(this.client.set);
        this.get = promisify(this.client.get);
    }

    _connect() {
        this.client = redis.createClient({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
        });
    }

    exists(key) {
        return new Promise((resolve, reject) => {
            this.client.exists(key, (err, is_exists) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(is_exists);
                }
            });
        });
    }

    remove(key) {
        this.client.del(key);
    }

    incr(key) {
        this.client.incr(key);
    }

    flushall() {
        this.client.flushall();
    }
};
