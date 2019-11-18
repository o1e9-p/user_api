import Router from 'koa-router';
import convert from 'koa-convert';
import KoaBody from 'koa-body';
import BooksService from '../books/booksService';
import Mysql from '../adapters/mySql';

const mysql = Mysql.getInstance();
const booksService = new BooksService(mysql);

const router = new Router(),
  koaBody = convert(KoaBody());

router
  .get('/books/', async (ctx, next) => {
    const result = await booksService.get(ctx.params.id);
    console.log(ctx);
    if (result) {
      ctx.body = result;
    } else {
      ctx.status = 404;
    }
  })
  .post('/books', koaBody, async (ctx, next) => {
    ctx.status = 201;
    const result = await booksService.create(ctx.request.body);
    console.log(result);
    ctx.body = result
  })
  .put('/books/:id', koaBody, async (ctx, next) => {
    ctx.status = 204;
    await booksService.update(ctx.params.id, ctx.request.body);
  });

export function routes () { return router.routes() }
export function allowedMethods () { return router.allowedMethods() }
