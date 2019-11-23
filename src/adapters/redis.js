'use strict';

const redis = require('redis');

module.exports = class Redis {
    constructor() {
        this.client = null;
        this._connect();
    }

    _connect() {
        this.client = redis.createClient({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
        });
    }

    set(key, value, time) {
        if (time) {
            this.client.set(key, value, 'EX', time, this._handleError);
        } else {
            this.client.set(key, value, this._handleError);
        }
    }

    get(key) {
        return new Promise((res, rej) => {
            this.client.get(key, (err, reply) => {
                if (err) {
                    rej(err);
                } else {
                    res(reply);
                }
            });
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

    _handleError(e) {
        if (e) {
            console.error(e);
        }
    }
};
