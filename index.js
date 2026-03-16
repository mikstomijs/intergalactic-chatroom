const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);




app.use(express.static(__dirname));



const chat1 = io.of('/chat1');
const chat2 = io.of('/chat2');
const chat3 = io.of('/chat3');


function setupChatroom(io, room) {

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('set nickname', (nickname) => {
    socket.nickname = nickname;
    io.emit('chat message', nickname + " joined the chat");
  });

  socket.on('chat message', (msg) => {
    const name = socket.nickname || "Anonymous";
    io.emit('chat message', name + ": " + msg);
  });

  socket.on('disconnect', () => {
    const name = socket.nickname || "A user";
    io.emit('chat message', name + " left the chat");
  });

});


}


setupChatroom(chat1, "Chatroom 1");
setupChatroom(chat2, "Chatroom 2");
setupChatroom(chat3, "Chatroom 3");


server.listen(3000, () => {
  console.log('listening on *:3000');
});