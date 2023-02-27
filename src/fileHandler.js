import * as fs from 'fs';
import * as url from 'url';

//https://blog.logrocket.com/alternatives-dirname-node-js-es-modules/
//The following line is thanks to the above resource
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const directory = {};
const notFound = fs.readFileSync(`${__dirname}/client/notFound.html`);
fs.readdirSync(`${__dirname}/client`).forEach((path) => {
  directory[path] = fs.readFileSync(`${__dirname}/client/${path}`);
});

console.log(directory);

/**
 * Writes a response consisting of the contents of filename.  Returns false if this file does not exist in client folder; returns true if the file is written successfully.
 * @param {Request} request the request for this resource
 * @param {Response} response the response to write to
 * @param {String} filename should be relative to 'client/'
 */
export function getFile(request, response, filename) {
  if (directory[filename]) {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    if (request.method === 'GET') {
      response.write(directory[filename]);
    }
    response.end();
    return true;
  }
  return false;
}

export function getNotFound(request, response) {
    //TODO: change the Content-Type to reflect the type of the file
    response.writeHead(404, { 'Content-Type': 'text/html' });
    if (request.method === 'GET') {
      response.write(notFound);
    }
    response.end();
}


