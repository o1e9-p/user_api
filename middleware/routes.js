import Router from 'koa-router';
import convert from 'koa-convert';
import KoaBody from 'koa-body';
import books from '../products/books'

const router = new Router(),
  koaBody = convert(KoaBody());

router
  .get('/books', async (ctx, next) => {
    ctx.body = await books.get(ctx.request.url, ctx.query);
  })
  // .get('/book/:id', async (ctx, next) => {
  //   const result = await books.get(ctx.params.id);
  //   console.log(ctx);
  //   if (result) {
  //     ctx.body = ctx.params.id; //result
  //   } else {
  //     ctx.status = 204;
  //   }
  // })
  .post('/books', koaBody, async (ctx, next) => {
    ctx.status = 201;
    ctx.body = await books.create(ctx.request.body);
  })
  .put('/books/:id', koaBody, async (ctx, next) => {
    ctx.status = 204;
    await books.update(ctx.params.id, ctx.request.body);
  });

export function routes () { return router.routes() }
export function allowedMethods () { return router.allowedMethods() }