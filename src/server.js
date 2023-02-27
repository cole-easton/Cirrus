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

const onRequest = (request, response) => {
  const pathname = url.parse(request.url).pathname.substring(1);
  if (!fileHandler.getFile(request, response, pathname)) {
    switch (pathname) {
      case '':
      case 'index.html':
        fileHandler.getFile(request, response, 'index.html');
        break;
      case 'addUser':
        parseBody(request, request, (req, res, bodyParams) =>
          endpoints.addUser(req, res, bodyParams));
      default:
        fileHandler.getNotFound(request, response);
        break;
    }
  }
};

http.createServer(onRequest).listen(port, () => { });
