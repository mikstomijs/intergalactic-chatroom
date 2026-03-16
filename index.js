const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const Database = require('better-sqlite3');


app.use(express.static(__dirname));


const db = new Database('chat.db');


db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room TEXT NOT NULL,
    nickname TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  )
`);

const getHistory = db.prepare(`
  SELECT nickname, message 
  FROM messages 
  WHERE room = ? 
  ORDER BY timestamp ASC
`);

const insertMessage = db.prepare(`
  INSERT INTO messages (room, nickname, message, timestamp) 
  VALUES (?, ?, ?, ?)
`);





const chat1 = io.of('/chat1');
const chat2 = io.of('/chat2');
const chat3 = io.of('/chat3');


function setupChatroom(io, room) {

io.on('connection', (socket) => {
  console.log('a user connected');

  
  const history = getHistory.all(room);
  socket.emit('chat history', history);


  socket.on('set nickname', (nickname) => {
    socket.nickname = nickname;
    io.emit('chat message', nickname + " joined the chat");
  });

  socket.on('chat message', (msg) => {
    const name = socket.nickname || "Anonymous";
      insertMessage.run(room, name, msg, Date.now());
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