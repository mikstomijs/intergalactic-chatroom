const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

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

server.listen(3000, () => {
  console.log('listening on *:3000');
});