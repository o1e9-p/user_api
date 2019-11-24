'use strict';

const AuthorService = require('../author/authorService');
const BooksService = require('../books/booksService');
const Mysql = require('../adapters/mySql');

const booksService = new BooksService(Mysql.getInstance());
const authorService = new AuthorService(Mysql.getInstance());

exports.getHandler = async (ctx, next) => {
    const result = await booksService.get(ctx.query);
    if (result && result.length) {
        ctx.body = result;
    } else {
        ctx.status = 404;
    }
};

exports.insertHandler = async (ctx, next) => {
    const result = await booksService.create(ctx.request.body);
    ctx.status = 201;
    ctx.body = result;
};

exports.updateHandler = async (ctx, next) => {
    const result = await booksService.update(ctx.params.id, ctx.request.body);

    if (result) {
        ctx.body = result;
    } else {
        ctx.status = 404;
    }
};

exports.deleteBookHandler = async (ctx, next) => {
    await booksService.delete(ctx.params.id);
    ctx.status = 204;
};

exports.deleteAuthorHandler = async (ctx, next) => {
    await authorService.delete(ctx.params.id);
    ctx.status = 204;
};
