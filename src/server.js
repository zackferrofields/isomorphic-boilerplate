import { Server } from 'hapi';
import ejs from 'ejs';
import fs from 'fs';
import Router from 'react-router';
import routes from 'views/Routes';
import Transmit from 'react-transmit';
import url from 'url';

let host = process.env.HOSTNAME || 'localhost';
let port = process.env.PORT || 3000;

const server = new Server();
server.connection({host, port});
server.start(() => {
  console.info('==> ✅  Server is listening');
  console.info('==> 🌎  Go to ' + server.info.uri.toLowerCase());
});

server.route({
  method: '*',
  path: '/{params*}',
  handler: (request, reply) => {
    reply.file('static' + request.path);
  }
});

server.route({
  method: '*',
  path: '/api/github/{path*}',
  handler: {
    proxy: {
      passThrough: true,
      mapUri(request, callback) {
        callback(null, url.format({
          protocol: 'https',
          host: 'api.github.com',
          pathname: request.params.path,
          query: request.query
        }));
      }
    }
  }
});

server.ext('onPreResponse', (request, reply) => {
  if (typeof request.response.statusCode !== 'undefined') return reply.continue();
  Router.run(routes, request.path, (Handler, router) => {
    Transmit.renderToString(Handler).then(({ reactString: content, reactData: data }) => {
      fs.readFile('./views/index.ejs', 'utf-8', (err, template) => {
        if (err) throw err;
        let output = ejs.render(template, { content });
        const webserver = process.env.NODE_ENV === 'production' ? '' : '//' + host + ':8080';
        output = Transmit.injectIntoMarkup(output, data, [`${webserver}/dist/client.js`]);
        reply(output);
      });
    }).catch((error) => {
      reply(error.stack).type('text/plain').code(500);
    });
  });
});
