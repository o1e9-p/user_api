import Router from 'koa-router';
import convert from 'koa-convert';
import KoaBody from 'koa-body';
import BooksService from '../books/booksService';
import Mysql from '../adapters/mySql';
import AuthorService from "../author/authorService";

const mysql = Mysql.getInstance();
const booksService = new BooksService(mysql);
const authorService = new AuthorService(mysql);

const router = new Router(),
  koaBody = convert(KoaBody());

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
    ctx.body = result
  })
  .post('/books/:id', koaBody, async (ctx, next) => {
    const result = await booksService.update(ctx.params.id, ctx.request.body);

    if (result) {
      ctx.body = result;
    } else {
      ctx.status = 404
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

export function routes () { return router.routes() }
export function allowedMethods () { return router.allowedMethods() }
