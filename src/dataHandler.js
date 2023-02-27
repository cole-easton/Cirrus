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

async function addUser(username, password) {
    bcrypt.hash(password, 10, function (err, hash) {
        if (err) {
            return response(500, "Server error")
        }
        if (users[username]) {
            return response(403, "Username is already in use");
        }
        users[username] = {
            username: username,
            passwordHash: hash
        }
        return response(204, "");
    });
}

function getFriends(username, password) {
    bcrypt.compare(password, user[username].passwordHash).then(function (result) {
        if (result) {
            return friendships[username].where(friend => friendships[friend].includes(username));
        }
        else {
            return response(401, "Not signed in");
        }
    });
}

function requestFriend(requester, friend, password) {
    bcrypt.compare(password, user[username].passwordHash).then(function (result) {
        if (result) {
            friendships[requester].push(friend);
            return true;
        }
        else {
            return response(401, "Not signed in");
        }
    });
}

function addDescriptors(desciber, describee, words, password) {
    bcrypt.compare(password, user[username].passwordHash).then(function (result) {
        if (result) {
            if (areFriends(desciber, describee)) {
                if (words.length === 10) {
                    descriptions[descibee][describer] = words;
                    return response(204, "Descriptors added")
                }
                else {
                    return(400, "words must be an array of length 10");
                }
            }
            else {
                return response(403, "Both users must add each other as friends in order to add descrptors");
            }
        }
        else {
            return response(401, "Not signed in");
        }
    });
}

function getDescriptors(username, password) {
    bcrypt.compare(password, user[username].passwordHash).then(function (result) {
        if (result) {
            const descriptors = [];
            for(describer in descriptions[username]) {
                descriptors.push(descriptions[describer]);
            }
            return response(200, descriptors);
        }
        else {
            return response(401, "Not signed in");
        }
    });
}

function areFriends(user1, user2) {
    return friendships[user1].includes(user2) && friendships[user2].includes(user1);
}

function response(status, body) {
    return {
        status: status,
        body: body
    }
}

