'use strict';

const redis = require('redis');
const { promisify } = require('util');

let instance = null;

module.exports = class Redis {
    constructor(client) {
        this.client = client;
        this.set = promisify(this.client.set);
        this.get = promisify(this.client.get);
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

    static getInstance() {
        if (!instance) {
            const client = redis.createClient({
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
            });
            instance = new Redis(client);
        }

        return instance;
    }
};
