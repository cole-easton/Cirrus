import * as bcrypt from 'bcrypt';

/**
 * Users, indexed by username
 */
const users = {};

/**
 * friendships[username] gives all of the friends/friend requests for user.
 * If user1 and user2 have each other in their friend request lists, they are friends
 */
const friendships = {};

/**
 * descriptions[username1][username2] holds the descriptors of username2 by username1
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
      if (err) {
        resolve(response(500, 'Server error'));
      }
      if (users[username]) {
        resolve(response(403, 'Username is already in use'));
      }
      users[username] = {
        username,
        passwordHash: hash,
      };
      resolve(response(204, ''));
    });
  });
}

export function getFriends(username, password) {
  return new Promise((resolve) => {
    bcrypt.compare(password, users[username].passwordHash).then((result) => {
      if (result) {
        resolve(response(200, friendships[username]
          .where((friend) => friendships[friend].includes(username))));
      }

      resolve(response(401, 'Not signed in'));
    });
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
    bcrypt.compare(password, users[describer].passwordHash).then((result) => {
      if (result) {
        if (areFriends(describer, describee)) {
          if (words.length === 10) {
            descriptions[describee][describer] = words;
            resolve(response(204, 'Descriptors added'));
          }

          resolve(response(400, 'words must be an array of length 10'));
        }

        resolve(response(403, 'Both users must add each other as friends in order to add descrptors'));
      }

      resolve(response(401, 'Not signed in'));
    });
  });
}

export function getDescriptors(username, password) {
  return new Promise((resolve) => {
    bcrypt.compare(password, users[username].passwordHash).then((result) => {
      if (result) {
        const descriptors = [];
        descriptions[username].array.forEach((descriptionList) => {
          descriptors.push(descriptionList);
        });
        resolve(response(200, descriptors));
      }

      resolve(response(401, 'Not signed in'));
    });
  });
}
