import * as http from 'http';
import * as url from 'url';
import * as query from 'querystring';
import * as fileHandler from './fileHandler.js';
import * as endpoints from './endpoints.js';

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const parseBody = (request, response, handler) => {
  const body = [];

  request.on('error', () => {
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    handler(request, response, bodyParams);
  });
};

const routes = {
  addUser: endpoints.addUser,
  getFriends: endpoints.getFriends,
  requestFriend: endpoints.requestFriend,
  addDescriptors: endpoints.addDescriptors,
  getDescriptors: endpoints.getDescriptors,
  compileDescriptors: endpoints.compileDescriptors,
};

const onRequest = (request, response) => {
  const pathname = url.parse(request.url).pathname.substring(1) || 'index.html';
  if (!fileHandler.getFile(request, response, pathname)) {
    parseBody(request, response, (req, res, bodyParams) => {
      if (routes[pathname]) {
        routes[pathname](req, res, bodyParams);
      } else {
        fileHandler.getNotFound(request, response);
      }
    });
  }
};

http.createServer(onRequest).listen(port, () => { });
