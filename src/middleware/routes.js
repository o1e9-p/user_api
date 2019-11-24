'use strict';

const Router = require('koa-router');
const Redis = require('../adapters/redis');
const convert = require('koa-convert');
const KoaBody = require('koa-body');
const Cache = require('./cache');
const { getHandler, insertHandler, updateHandler, deleteBookHandler, deleteAuthorHandler } = require('./handelers');

const koaBody = convert(KoaBody());
const router = new Router();
const cache = new Cache(Redis.getInstance());

router
    .get('/books', cache.getIfExist, cache.deleteReq, getHandler, cache.set)
    .post('/books', koaBody, insertHandler, cache.set)
    .post('/books/:id', koaBody, updateHandler, cache.set)
    .delete('/books/:id', deleteBookHandler, cache.deleteBook)
    .delete('/author/:id', deleteAuthorHandler, cache.deleteAuthor);

exports.routes = function routes() {
    return router.routes();
};
exports.allowedMethods = function () {
    return router.allowedMethods();
};
