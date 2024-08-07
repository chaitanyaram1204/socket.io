const socket = io("https://socket-io-ql62.onrender.com");

const activity = document.querySelector(".activity");
const msginput = document.querySelector("#messag");
const nameinput = document.querySelector("#name");
const chatroom = document.querySelector("#room");
const userslist = document.querySelector(".user-list");
const roomlist = document.querySelector(".room-list");
const chatDisplay = document.querySelector(".chat-display");
function sendmessage(e) {
  e.preventDefault();
  if (nameinput.value && msginput.value && chatroom.value) {
    //socket.send(input.value); //This is used during ws
    socket.emit("message", {
      name: nameinput.value,
      text: msginput.value,
    });
    msginput.value = "";
  }
  msginput.focus();
}

function enterroom(e) {
  e.preventDefault();
  if (nameinput.value && chatroom.value) {
    socket.emit("enterroom", {
      name: nameinput.value,
      room: chatroom.value,
    });
  }
}
document.querySelector(".form-mess").addEventListener("submit", sendmessage);
document.querySelector(".form-join").addEventListener("submit", enterroom);

//Listen messages
msginput.addEventListener("keypress", () => {
  socket.emit("activity", nameinput.value);
});

socket.on("message", (data) => {
  activity.textContent = "";
  const { name, text, time } = data;
  const li = document.createElement("li");
  li.className = "post";
  if (name === nameinput.value) {
    li.className = "post post--left";
  }
  if (name !== nameinput.value && name !== "Admin") {
    li.className = "post post--right";
  }
  if (name !== "Admin") {
    li.innerHTML = `<div class="post__header ${
      name === nameinput.value ? "post__header--user" : "post__header--reply"
    } ">
    <span class="post__header--name">${name}</span>
    <span class="post__header--time">${time}</span>
    </div>
    <div class="post__text">${text}</div>`;
  } else {
    li.innerHTML = `<div class="post__text">${text}</div>`;
  }
  document.querySelector(".chat-display").appendChild(li);

  chatDisplay.scrollTop = chatDisplay.scrollHeight;
});

let activitytimer;
socket.on("activity", (name) => {
  activity.textContent = `${name} is ....`;
  clearTimeout(activitytimer);
  activitytimer = setTimeout(() => {
    activity.textContent = "";
  }, 2000);
});

socket.on("userlist", ({ users }) => {
  showUsers(users);
});
socket.on("roomlist", ({ rooms }) => {
  showRooms(rooms);
});
function showUsers(users) {
  userslist.textContent = "";
  if (users) {
    userslist.innerHTML = `<em>Users in ${chatroom.value}:</em>`;
    users.forEach((user, i) => {
      userslist.textContent += `${user.name}`;
      if (users.length > 1 && i !== users.length - 1) {
        userslist.textContent += ",";
      }
    });
  }
}
function showRooms(rooms) {
  roomlist.textContent = "";
  if (rooms) {
    roomlist.innerHTML = `<em>Active rooms : </em>`;
    rooms.forEach((room, i) => {
      roomlist.textContent += `${room}`;
      if (rooms.length > 1 && i !== rooms.length - 1) {
        roomlist.textContent += ",";
      }
    });
  }
}
