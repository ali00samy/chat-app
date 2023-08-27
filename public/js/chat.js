const socket = io();

const $messageform = document.querySelector("#message-form");
const $messageforminput = $messageform.querySelector("input");
const $messageforminputbutton = $messageform.querySelector("button");
const $sendlocationbutton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (message) => {
  console.log(message);
  const html = Mustache.render(locationMessageTemplate, {
    message: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageform.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageforminputbutton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (error) => {
    $messageforminputbutton.removeAttribute("disabled", "disabled");
    $messageforminput.value = "";
    $messageforminput.focus();

    if (error) {
      return console.log(error);
    } else {
      console.log("message sent");
    }
  });
});

$sendlocationbutton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("geolocation not supported.");
  }

  navigator.geolocation.getCurrentPosition((postion) => {
    console.log(postion);
    socket.emit("sendLocation", {
      lat: postion.coords.latitude,
      long: postion.coords.longitude,
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
