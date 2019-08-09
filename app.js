#!/usr/bin/env node

'use strict';

const
  client = __dirname + '/client/',

  //dev = ((process.env.NODE_ENV || 'development').trim().toLowerCase() === 'development'),
  portHttp = process.env.PORT || 3000,

  express = require('express'),
  app = express();

// middleware
app.use(require('compression')());
app.use(require('serve-favicon')(client + 'favicon.ico'));
app.use(express.static(client, { maxAge: 60000 }));

// 404 error
app.use(function (req, res) {
  res.status(404).send('Not found');
});

// HTTP server
app.listen(portHttp, () => console.log(`HTTP on port ${portHttp}`));


// ________________________________________________________
// web socket server
const
  WebSocket = require('ws'),
  port = portHttp + 1,
  server = new WebSocket.Server({ port }),
  msgLog = [], maxLog = 30;


server.on('connection', socket => {

  // send previous messages
  msgLog.forEach(msg => socket.send(msg));

  // announce connection
  socket.on('message', msg => {

    // add to log
    msgLog.push(msg);
    if (msgLog.length > maxLog) msgLog.shift();

    // send to all
    broadcast(msg);

  });

});


// broadcast message to all clients
function broadcast(msg) {

  server.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });

}
