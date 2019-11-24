'use strict';

const Router = require('koa-router');
const convert = require('koa-convert');
const KoaBody = require('koa-body');
const { getHandler, insertHandler, updateHandler, deleteBookHandler, deleteAuthorHandler } = require('./handlers');

const koaBody = convert(KoaBody());
const router = new Router();

router
    .get('/books', getHandler)
    .post('/books', koaBody, insertHandler)
    .post('/books/:id', koaBody, updateHandler)
    .delete('/books/:id', deleteBookHandler)
    .delete('/author/:id', deleteAuthorHandler);

exports.routes = function routes() {
    return router.routes();
};
exports.allowedMethods = function () {
    return router.allowedMethods();
};
