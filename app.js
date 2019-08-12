#!/usr/bin/env node

'use strict';

const
  client = __dirname + '/client/',

  dev = ((process.env.NODE_ENV || 'development').trim().toLowerCase() === 'development'),
  portHttp = process.env.PORT || 3000,

  express = require('express'),
  app = express();

// middleware
app.use(require('compression')());
app.use(require('serve-favicon')(client + 'favicon.ico'));
app.use((req, res, next) => {

  if (dev) res.append('Access-Control-Allow-Origin', '*'); // CORS local testing
  res.append('Vary', 'X-Requested-With'); // HTTP/Ajax distinction
  next();

});
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


// client connected
server.on('connection', (socket, req) => {

  let
    name = '',
    host = req.headers.host,
    ip = req.connection.remoteAddress;

  // send previous messages
  msgLog.forEach(msg => socket.send(msg));

  // announce connection
  socket.on('message', msg => {

    // define name
    let m = JSON.parse(msg);
    if (!name && m && m.name) {
      name = m.name;
      console.log(`${name} joined ${host} from ${ip}`);
    }

    broadcast(msg);

  });

  // closed
  socket.on('close', () => {

    let
      msg = 'has left the building',
      m = JSON.stringify({ name, msg });

    broadcast(m);
  });

});


// broadcast message to all clients
function broadcast(msg) {

  // update log
  msgLog.push(msg);
  if (msgLog.length > maxLog) msgLog.shift();

  // broadcast
  server.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });

}
