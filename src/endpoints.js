import * as dataHandler from './dataHandler.js';

/**
 * Writes the stringified result to response
 * @param {Response} response the response to write to
 * @param {any} result an object with status and body fields.  Status must be an integer
 * @param {boolean} head indicated whether this is a HEAD request
 */
function writeResponse(response, result, head = false) {
  response.writeHead(result.status, { 'Content-Type': 'application/json' });
  if (!head) {
    response.write(JSON.stringify(result));
  }
  response.end();
}

export function authenticate(request, response, responseBody) {
  if (request.method === 'POST') {
    if (responseBody.username && responseBody.password) {
      dataHandler.authenticate(responseBody.username, responseBody.password)
        .then((result) => writeResponse(response, result));
    } else {
      writeResponse(response, {
        status: 400,
        body: 'username and password fields are required.',
      });
    }
  } else {
    writeResponse(response, {
      status: 405,
      body: "You may only use 'POST' with this endpoint.",
    });
  }
}

export function addUser(request, response, responseBody) {
  if (request.method === 'POST') {
    if (responseBody.username && responseBody.password) {
      dataHandler.addUser(responseBody.username, responseBody.password)
        .then((result) => writeResponse(response, result));
    } else {
      writeResponse(response, {
        status: 400,
        body: 'username and password fields are required.',
      });
    }
  } else {
    writeResponse(response, {
      status: 405,
      body: "You may only use 'POST' with this endpoint.",
    });
  }
}

export function getFriends(request, response, responseBody) {
  if (request.method === 'POST') {
    if (responseBody.username && responseBody.password) {
      dataHandler.getFriends(responseBody.username, responseBody.password)
        .then((result) => writeResponse(response, result));
    } else {
      writeResponse(response, {
        status: 400,
        body: 'username and password fields are required.',
      });
    }
  } else {
    writeResponse(response, {
      status: 405,
      body: "You may only use 'POST' with this endpoint.",
    });
  }
}

export function requestFriend(request, response, responseBody) {
  if (request.method === 'POST') {
    if (responseBody.requester && responseBody.friend && responseBody.password) {
      dataHandler.requestFriend(responseBody.requester, responseBody.friend, responseBody.password)
        .then((result) => writeResponse(response, result));
    } else {
      writeResponse(response, {
        status: 400,
        body: 'requester, friend, and password fields are required.',
      });
    }
  } else {
    writeResponse(response, {
      status: 405,
      body: "You may only use 'POST' with this endpoint.",
    });
  }
}

export function addDescriptors(request, response, responseBody) {
  if (request.method === 'POST') {
    if (responseBody.describer && responseBody.describee
      && responseBody.words && responseBody.password) {
      try {
        const words = JSON.parse(responseBody.words);
        dataHandler.addDescriptors(
          responseBody.describer,
          responseBody.describee,
          words,
          responseBody.password,
        )
          .then((result) => writeResponse(response, result));
      } catch (err) {
        writeResponse(response, {
          status: 400,
          body: `parameter words is invalid JSON: ${err}`,
        });
      }
    } else {
      writeResponse(response, {
        status: 400,
        body: 'describer, describee, words, and password fields are required.',
      });
    }
  } else {
    writeResponse(response, {
      status: 405,
      body: "You may only use 'POST' with this endpoint.",
    });
  }
}

export function getDescriptors(request, response, responseBody) {
  if (request.method === 'POST') {
    if (responseBody.describer && responseBody.describee && responseBody.password) {
      dataHandler
        .getDescriptors(responseBody.describer, responseBody.describee, responseBody.password)
        .then((result) => writeResponse(response, result));
    } else {
      writeResponse(response, {
        status: 400,
        body: 'describer, describee, and password fields are required.',
      });
    }
  }
}

export function compileDescriptors(request, response, responseBody) {
  if (request.method === 'POST') {
    if (responseBody.username && responseBody.password) {
      dataHandler.compileDescriptors(responseBody.username, responseBody.password)
        .then((result) => writeResponse(response, result));
    } else {
      writeResponse(response, {
        status: 400,
        body: 'username and password fields are required.',
      });
    }
  } else {
    writeResponse(response, {
      status: 405,
      body: "You may only use 'POST' with this endpoint.",
    });
  }
}
