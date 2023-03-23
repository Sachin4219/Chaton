const path = require('path');
const http = require('http');

const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeavesChat, getRoomUsers} = require('./utils/users');
const port = process.env.PORT || 3000;
const botname = 'Chaton Bot :'

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {

  socket.on('joinRoom', ({username, room}) => {

    const user = userJoin(socket.id, username, room)
    socket.join(user.room)

    //when a new user connects
    socket.emit('message', formatMessage(botname,'Welcome to chaton'));
    socket.broadcast
      .to(user.room)
      .emit('message',  formatMessage(botname,`${user.username} has joined the chat`));

    io.to(user.room).emit('roomUsers',{
      room:user.room,
      users: getRoomUsers(user.room)
    })


  //when a user disconnects
  socket.on('disconnect', ()=>{
    const user = userLeavesChat(socket.id)

    if(user){
      io.to(user.room)
        .emit('message',
        formatMessage(botname,`${user.username} has left the chat`));
    }

    io.to(user.room).emit('roomUsers',{
      room:user.room,
      users: getRoomUsers(user.room)
    })

  })
})

  //listen for chatMessage
  socket.on('chatMessage', (message)=>{
    const user = getCurrentUser(socket.id)
    io.to(user.room).emit('message',  formatMessage(user.username, message))
  })
})





server.listen(port, () => {
  console.log("Server is running on port " + port)
})