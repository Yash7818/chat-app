const socket = io();
// Elements
const $messageForm = document.querySelector("#message-form");
const $messageForminput = document.querySelector("input");
const $messageFormbutton = document.querySelector("button");
const $sendLocation = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
// socket.on('countUpdated',(count)=>{
//     console.log("count updated")
//     console.log(count)
// })
//     document.getElementById('increment').addEventListener('click', ()=>{
//         console.log("clicked")
//         socket.emit('increment')
//     })

// Templates
const messageTemplate = document.querySelector("#message-temp").innerHTML;
const locationTemplate = document.querySelector("#location-temp").innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-temp').innerHTML;
// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// console.log(username, room)

//message is an object

const autoscroll = () =>{
    // New msg element
    const $newMessage = $messages.lastElementChild

    // height of the new msg
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessagemargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessagemargin

    // visible height
    const visibleHeight = $messages.offsetHeight

    // height of messages container

    const containerHeight = $messages.scrollHeight

    // how far have i scroll

    const scrollOffset = $messages.scrollTop + visibleHeight


    if((containerHeight - newMessageHeight) <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on("message", (message) => {
  console.log(message);

  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});
socket.on("locationMessage", (url) => {
  console.log(url);

  const lochtml = Mustache.render(locationTemplate, {
    username: url.username,
    url: url.text,
    createdAt: moment(url.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", lochtml);
  autoscroll()
});

socket.on("roomData", ({ room, users }) => {
//   console.log(room, users)

    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html

});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormbutton.setAttribute("disabled", "disabled");

  const msg = e.target.elements.message.value;
  socket.emit("sendMessage", msg, (error) => {
    $messageFormbutton.removeAttribute("disabled");
    $messageForminput.value = "";
    $messageForminput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("msg Delivered!");
  });
});

$sendLocation.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("geolocation is not supported");
  }
  $sendLocation.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    // console.log(position)
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocation.removeAttribute("disabled");
        console.log("Location Shared!");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
