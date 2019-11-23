'use strict';

const Koa = require('koa');
const protect = require('koa-protect');
const err = require('./middleware/error');
const validator = require('./middleware/validator');
const {routes, allowedMethods} = require('./middleware/routes');

const app = new Koa();
const port = process.env.PORT || 3000;

app.use(protect.koa.sqlInjection({
  body: true,
  loggerFunction: console.error
}));

app.use(protect.koa.xss({
  body: true,
  loggerFunction: console.error
}));

app.use(err);
app.use(routes());
app.use(allowedMethods());

app.listen(port, function () {
  console.log('listening at port %s', port);
});
