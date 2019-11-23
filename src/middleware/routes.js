'use strict';

const Router = require('koa-router');
const convert = require('koa-convert');
const KoaBody = require('koa-body');
const BooksService = require('../books/booksService');
const Mysql = require('../adapters/mySql');
const AuthorService = require('../author/authorService');

const mysql = Mysql.getInstance();
const booksService = new BooksService(mysql);
const authorService = new AuthorService(mysql);

const router = new Router();
const koaBody = convert(KoaBody());

router
    .get('/books', async (ctx, next) => {
        const result = await booksService.get(ctx.query);
        if (result) {
            ctx.body = result;
        } else {
            ctx.status = 404;
        }
    })
    .post('/books', koaBody, async (ctx, next) => {
        const result = await booksService.create(ctx.request.body);
        ctx.status = 201;
        ctx.body = result;
    })
    .post('/books/:id', koaBody, async (ctx, next) => {
        const result = await booksService.update(ctx.params.id, ctx.request.body);

        if (result) {
            ctx.body = result;
        } else {
            ctx.status = 404;
        }
    })
    .delete('/books/:id', async (ctx, next) => {
        await booksService.delete(ctx.params.id);
        ctx.status = 204;
    })
    .delete('/author/:id', async (ctx, next) => {
        await authorService.delete(ctx.params.id);
        ctx.status = 204;
    });

exports.routes = function routes() {
    return router.routes();
};
exports.allowedMethods = function () {
    return router.allowedMethods();
};
