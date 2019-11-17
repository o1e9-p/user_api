import Koa from 'koa';
import err from './middleware/error';
import {routes, allowedMethods} from './middleware/routes';
require('dotenv').config();


const app = new Koa();
const port = process.env.PORT || 3000;

app.use(err);
app.use(routes());
app.use(allowedMethods());

app.listen(port, function () {
  console.log('listening at port %s', port);
});