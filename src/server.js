// TODO: Port server proxy to koa
// server.route({
//   method: '*',
//   path: '/api/github/{path*}',
//   handler: {
//     proxy: {
//       passThrough: true,
//       mapUri(request, callback) {
//         callback(null, url.format({
//           protocol: 'https',
//           host: 'api.github.com',
//           pathname: request.params.path,
//           query: request.query
//         }));
//       }
//     }
//   }
// });

import {injectIntoMarkup, renderToString} from 'react-transmit';
import {readFile} from 'co-fs';
import {render} from 'ejs';
import {run} from 'react-router';
import koa from 'koa';
import route from 'koa-router';
import routes from './views/Routes';
import serve from 'koa-static';

let app = koa();
let router = route();

const host = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;
const webserver = process.env.NODE_ENV === 'production' ? '' : '//' + host + ':8080';

function *error(next) {
  try {
    yield next;
  } catch (err) {
    this.status = err.status || 500;
    this.body = err.message;
    this.app.emit('error', err, this);
  }
}

function *responseTime(next) {
  let start = new Date;
  yield next;
  let ms = new Date - start;
  this.set('X-Response-Time', `${ms}ms`);
}

router
  .get('/', function *(next) {
    let Handler = yield new Promise(resolve => run(routes, this.request.url, resolve));
    let { reactString: content, reactData: data } = yield renderToString(Handler);
    let template = yield readFile('./views/index.ejs', 'utf-8');
    let output = render(template, { content });
    output = injectIntoMarkup(output, data, [`${webserver}/dist/client.js`]);
    this.body = output;
  });

app
  .use(responseTime)
  .use(error)
  .use(serve('./static'))
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(port);
