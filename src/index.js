const express = require('express')
const Filter = require('bad-words')
const http = require('http')
const path = require('path')
const {genearateMessage,generateLocationMessage} = require('./utlis/messages')
const {addUser,removeUser,getUser,getUsersinRoom} = require('./utlis/users')
const app = express()
const server = http.createServer(app)
const socketio = require('socket.io')
const io = socketio(server)

const port = process.env.PORT || 4000

const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

// let count = 0

// server(emit) -> client(recieve) => countUpdated
// client(emit) -> server(receive) => increment
// const message = "Welcome!"

io.on('connection', (socket) =>{
    console.log("new connection")

   

    socket.on('join',({username,room},callback)=>{

        const {error,user} = addUser({id:socket.id , username,room})

        if(error){
           return callback(error)
        }

        socket.join(user.room)

        socket.emit('message',genearateMessage('Admin','welcome!'))
        socket.broadcast.to(room).emit('message', genearateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users:getUsersinRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage',(msg,callback)=>{
        // console.log(msg)
        const user = getUser(socket.id)

        const filter = new Filter()

        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message',genearateMessage(user.username,msg))
        callback()
    })

    socket.on('sendLocation',(coords,callback) =>{
        // console.log(coords)
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,coords))
        callback()
    })

  

    socket.on('disconnect',() =>{

        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',genearateMessage('Admin',`${user.username} left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersinRoom(user.room)
            })
        }


       
    })



    // socket.emit('countUpdated',count)

    // socket.on('increment',()=>{
    //     count += 1;
    //     io.emit('countUpdated',count)
    // })

})

app.get("/",(req,res)=>{
    res.render('index')
})



server.listen(port,() =>{
    console.log(`server is started at ${port}`)
})