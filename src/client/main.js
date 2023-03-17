let username;
let password;
let selectedFriendName;
const loginForm = document.querySelector('#login-form');
const userContent = document.querySelector('#user-content');
const friendsList = document.querySelector('#friends-list');
const requestList = document.querySelector('#incoming-requests-list');
const descriptorArea = document.querySelector('#descriptor-area');
const selectedFriend = document.querySelector('#selected-friend');
const descriptorInputs = document.querySelectorAll('#descriptor-list input');
const descriptorSuccess = document.querySelector('#descriptor-success');
const descriptorError = document.querySelector('#descriptor-error');
const friendSuccess = document.querySelector('#friend-success');
const friendError = document.querySelector('#friend-error');
const wordCloud = document.querySelector('#word-cloud');

function fetchAndPopulateFriendsList() {
  fetch('/getFriends', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: `username=${username}`,
  }).then((result) => result.json()).then((json) => {
    friendsList.innerHTML = '';
    json.body.forEach((friend) => { friendsList.innerHTML += `<li>${friend}</li>`; });
  });
}

function fetchAndPopulateWordCloud() {
  fetch('/compileDescriptors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: `username=${username}&password=${password}`,
  }).then((result) => result.json()).then((json) => {
    wordCloud.innerHTML = '';
    const words = json.body;
    const weights = {};
    words.forEach((word) => {
      if (weights[word]) {
        weights[word]++;
      } else {
        weights[word] = 1;
      }
    });
    const keys = [...Object.keys(weights)];
    if (!keys.length) {
      wordCloud.innerHTML = '<span style = "color: red;">NO DESCRIPTORS YET</span>';
    }
    while (keys.length) {
      const index = Math.floor(Math.random() * keys.length);
      const word = keys[index];
      keys.splice(index, 1);
      wordCloud.innerHTML += `<span style="font-size: ${10 * weights[word]}pt; filter: brightness(${Math.round(Math.random() * 60 + 70)}%);">${word} </span>`;
    }
  });
}

function fetchAndPopulateIncomingRequestList() {
  fetch('/getIncomingFriendRequests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: `username=${username}&password=${password}`,
  }).then((result) => result.json()).then((json) => {
    if (json.body?.forEach) {
      requestList.innerHTML = '';
      json.body.forEach((user) => {
        requestList.innerHTML += `<li><span>${user}</span><button id = "accept-${user}">Accept</button><li>`;
      });
    }
  });
}

function login() {
  loginForm.style.display = 'none';
  userContent.style.display = 'flex';
  fetchAndPopulateFriendsList();
  fetchAndPopulateWordCloud();
  fetchAndPopulateIncomingRequestList();
}

document.querySelector('#login').onclick = () => {
  username = document.querySelector('#username').value;
  password = document.querySelector('#password').value;
  fetch('/authenticate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: `username=${username}&password=${password}`,
  }).then((response) => {
    switch (response.status) {
      case 404: // User does not yet exist -> create user
        fetch('/addUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          body: `username=${username}&password=${password}`,
        });
        login();
        break;
      case 200: // user already exists
        login();
        break;
      default: // 401: Incorrect passowrd
        document.querySelector('#login-error').style.display = 'block';
    }
  });
};

friendsList.onclick = (e) => {
  if (e.target.nodeName === 'LI') {
    descriptorError.style.display = 'none';
    descriptorSuccess.style.display = 'none';
    descriptorArea.style.display = 'block';
    selectedFriend.textContent = e.target.textContent;
    selectedFriendName = e.target.textContent;
    fetch('/getDescriptors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: `describer=${username}&describee=${selectedFriendName}&password=${password}`,
    }).then((result) => result.json()).then((json) => {
      const wordCount = json.body.length;
      if (wordCount) {
        for (let i = 0; i < wordCount; i++) {
          descriptorInputs[i].value = json.body[i];
        }
      }
    });
  }
};

requestList.onclick = (e) => {
  if (e.target.nodeName === 'BUTTON') {
    const friendName = e.target.id.substring(7); // remove "accept-" from id
    fetch('/requestFriend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: `requester=${username}&friend=${friendName}&password=${password}`,
    }).then(() => {
      fetchAndPopulateFriendsList();
      fetchAndPopulateIncomingRequestList();
    });
  }
};

document.querySelector('#refresh-friends').onclick = fetchAndPopulateFriendsList;

document.querySelector('#submit-descriptors').onclick = () => {
  const descriptors = [];
  descriptorInputs.forEach((input) => {
    if (input.value) {
      descriptors.push(input.value);
    }
  });
  fetch('/addDescriptors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: `describer=${username}&describee=${selectedFriendName}&words=${JSON.stringify(descriptors)}&password=${password}`,
  }).then((result) => {
    if (result.status !== 204) {
      return result.json();
    }
    descriptorError.style.display = 'none';
    descriptorSuccess.style.display = 'block';
    return false;
  }).then((json) => {
    if (json) {
      descriptorSuccess.style.display = 'none';
      descriptorError.style.display = 'block';
      descriptorError.textContent = `Error: ${json.body}`;
    }
  });
};

document.querySelector('#add-friend').onclick = () => {
  const friendName = document.querySelector('#friend-request').value;
  fetch('/requestFriend', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: `requester=${username}&friend=${friendName}&password=${password}`,
  }).then((result) => {
    if (result.status === 204) {
      friendError.style.display = 'none';
      friendSuccess.style.display = 'block';
      document.querySelector('#requestee-name').textContent = friendName;
    } else {
      friendSuccess.style.display = 'none';
      friendError.style.display = 'block';
    }
  });
};

document.querySelector('#refresh-requests').onclick = fetchAndPopulateIncomingRequestList;
document.querySelector('#refresh-cloud').onclick = fetchAndPopulateWordCloud;
