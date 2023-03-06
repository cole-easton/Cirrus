import * as bcrypt from 'bcrypt';

/**
 * Users, indexed by username
 */
const users = {
  example: {
    username: 'example',
    passwordHash: '$2b$08$da5yoVETeO6PgJlwPcQ.GeYmeS73d6lZSFzQvB3MsxaZmeTOiZl2S', // password 1234
    dateCreated: 0,
  },
  example2: {
    username: 'example',
    passwordHash: '$2b$08$q5iX4I2yzP5Q50YUQExlUudz.qKiW6hdG6R2RFnN2U0.dgE.puk3.', // password 1234
    dateCreated: 0,
  },
  example3: {
    username: 'example',
    passwordHash: '$2b$10$aJvcMuyaAHfQuWZSuhc3gOtFKX8ZiSxHqIf.tbwOyrMs7gDfV.h8W', // password 1234
    dateCreated: 0,
  },

};

/**
 * friendships[username] gives all of the friends/friend requests for user.
 * If user1 and user2 have each other in their friend request lists, they are friends
 */
const friendships = {
  example: ['example2', 'example3'],
  example2: ['example'],
  example3: [],
};

/**
 * descriptions[describee][decriber] holds the descriptors of describee by describer
 */
const descriptions = {};

function response(status, body) {
  return {
    status,
    body,
  };
}

function areFriends(user1, user2) {
  return friendships[user1].includes(user2) && friendships[user2].includes(user1);
}

export function addUser(username, password) {
  return new Promise((resolve) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (users[username]) {
        resolve(response(403, 'Username is already in use'));
      }
      if (err) {
        resolve(response(500, 'Server Error'));
      }
      users[username] = {
        username,
        passwordHash: hash,
        dateCreated: Date.now(),
      };
      friendships[username] = [];
      resolve(response(204, 'Success'));
    });
  });
}

export function getFriends(username, password) {
  return new Promise((resolve) => {
    if (users[username]) {
      bcrypt.compare(password, users[username].passwordHash).then((matches) => {
        if (matches) {
          resolve(response(200, friendships[username]
            .filter((friend) => friendships[friend].includes(username))));
        }
        resolve(response(401, 'Not signed in'));
      });
    } else {
      resolve(response(404, 'User does not exist.'));
    }
  });
}

export function requestFriend(requester, friend, password) {
  return new Promise((resolve) => {
    bcrypt.compare(password, users[requester].passwordHash).then((result) => {
      if (result) {
        friendships[requester].push(friend);
        resolve(response(204, 'Successfully submitted friend request'));
      }
      resolve(response(401, 'Not signed in'));
    });
  });
}

export function addDescriptors(describer, describee, words, password) {
  return new Promise((resolve) => {
    if (users[describer] && users[describee]) {
      bcrypt.compare(password, users[describer].passwordHash).then((result) => {
        if (result) {
          if (areFriends(describer, describee)) {
            if (words.length === 10) {
              if (!descriptions[describee]) {
                descriptions[describee] = {};
              }
              descriptions[describee][describer] = words;
              resolve(response(204, 'Descriptors added'));
            }
            resolve(response(400, `words must be an array of length 10, not length ${words.length}`));
          }
          resolve(response(403, 'Both users must add each other as friends in order to add descrptors'));
        }
        resolve(response(401, 'Not signed in'));
      });
    } else {
      resolve(response(404, `User ${users[describer] ? users[describee] : users[describer]} does not exist.`));
    }
  });
}

export function getDescriptors(describer, describee, password) {
  return new Promise((resolve) => {
    bcrypt.compare(password, users[describer].passwordHash).then((result) => {
      if (result) {
        if (descriptions[describee] && descriptions[describee][describer]) {
          resolve(response(200, descriptions[describee][describer]));
        } else if (users[describer] && users[describee]) {
          resolve(response(200, []));
        }
        resolve(response(400, 'At least of of describer, describee does not exist'));
      }
      resolve(response(401, 'Not signed in'));
    });
  });
}

export function compileDescriptors(username, password) {
  return new Promise((resolve) => {
    if (users[username]) {
      bcrypt.compare(password, users[username].passwordHash).then((result) => {
        if (result) {
          const descriptors = [];
          if (descriptions[username]) {
            Object.keys(descriptions[username]).forEach((describer) => {
              descriptors.push(...descriptions[username][describer]);
            });
          }
          resolve(response(200, descriptors));
        }
        resolve(response(401, 'Not signed in'));
      });
    } else {
      resolve(response(404, `User ${users[username]} does not exist.`));
    }
  });
}
