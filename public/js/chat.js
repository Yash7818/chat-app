const socket = io();
// Elements
const $messageForm = document.querySelector("#message-form");
const $messageForminput = document.querySelector("input");
const $messageFormbutton = document.querySelector("button");
const $sendLocation = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $my_msg = document.querySelector("#my_msg");
// socket.on('countUpdated',(count)=>{
//     console.log("count updated")
//     console.log(count)
// })
//     document.getElementById('increment').addEventListener('click', ()=>{
//         console.log("clicked")
//         socket.emit('increment')
//     })

// Templates
// console.log($my_name.value);
const messageTemplate = document.querySelector("#message-temp").innerHTML;
const locationTemplate = document.querySelector("#location-temp").innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-temp').innerHTML;
// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// console.log(username, room)

// console.log(username)
const myfunct = (x,y,z) =>{
  const $newMessage = $messages.lastElementChild
  if(x.matches){
    $newMessage.marginLeft = '82%'
  }
  else if(y.matches){
    $newMessage.marginLeft = '72%'
  }
  else if(z.matches){
    $newMessage.marginLeft = '52%'
  }
}
var x = window.matchMedia("(max-width:1440px)")
var y = window.matchMedia("(max-width:1024px)")
var z = window.matchMedia("(max-width:768px)")


function linkify(text){
  var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(urlRegex,function(url){
    return '<a href="' + url + '">' + url + ' </a>';
  });
}

//message is an object

const autoscroll = () =>{
    // New msg element
    const $newMessage = $messages.lastElementChild

    // height of the new msg
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessagemargin = parseInt(newMessageStyles.marginBottom)
    const newMessageleftmargin = parseInt(newMessageStyles.marginLeft)

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
    // newMessageStyles.marginLeft = '200px';
}

socket.on("message", (message) => {
  console.log(message);
  var msgout = linkify(message.text)
  console.log(msgout)
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: msgout,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  if(message.username === username.toLowerCase()){
    const $newMessage = $messages.lastElementChild
    $newMessage.style.marginRight = '2%'
    $newMessage.style.marginLeft = 'auto'
    // console.log($newMessage.style.width)
  }
  // console.log(username)
  // console.log(mess)
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
  if(url.username === username.toLowerCase()){
    const $newMessage = $messages.lastElementChild
    $newMessage.style.marginRight = '2%'
    $newMessage.style.marginLeft = 'auto'
    // console.log($newMessage.style.width)
  }
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
    // const $newMessage = $messages.lastElementChild
    // $newMessage.style.marginLeft = '82%'
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
        // const $newMessage = $messages.lastElementChild
        // $newMessage.style.marginLeft = '82%'
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
