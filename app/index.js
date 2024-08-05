const socket = io("ws://localhost:4000");
function sendmessage(e) {
  e.preventDefault();
  const input = document.querySelector("input");
  if (input.value) {
    //socket.send(input.value); //This is used during ws
    socket.emit("message", input.value);
    input.value = "";
  }
  input.focus();
}

document.querySelector("form").addEventListener("submit", sendmessage);

//Listen messages

socket.on("message", (data) => {
  const li = document.createElement("li");
  li.textContent = data;
  document.querySelector("ul").appendChild(li);
});
