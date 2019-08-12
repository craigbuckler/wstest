# web socket testing

Example chat application. Very early implementation with minimal security and error-checking.

Start server:

```bash
npm i
npm start
```

or `npm run debug` to run in development mode.

Then connect at <http://localhost:3000/>

An optional name can be added as a querystring, e.g. <http://localhost:3000/?YourName>


## How it works

`app.js` starts:

1. An [Express.js](https://expressjs.com/) web server on port 3000 (the `PORT` environment variable overrides the default of `3000`). This serves static files from the `client` folder.
1. A web socket server powered by the [ws module](https://github.com/websockets/ws) ([documentation](https://github.com/websockets/ws/blob/master/doc/ws.md)) on the HTTP port plus 1 (`3001`).

The `/index.html`, `/css/main.css`, and `/js/main.js` files download when a browser opens <http://site:3000/>.

The following process occurs:

1. CLIENT: if a user name has not been set in the URL querysting, a random name is defined and the browser refreshes.
1. CLIENT: `wsStart()` runs which initiates web socket communication at <ws://site:3001> (the HTTP port plus 1).
1. SERVER: the `connection` event runs. This sends the 30 most-recent messages to the connecting client. Event handlers for incoming messages and close signals from that client are registered.
1. CLIENT: at the point the socket opens, the `open` event sends the user's name and an "entered" message to the server as a JSON string.
1. SERVER: the `message` handler runs. This stores the user's name if it has not been sent previously. The `broadcast` function then update the log and broadcasts the message to all clients (including the sender).
1. CLIENT: the `message` handler parses any incoming JSON message and updates the HTML chat window.

The following process occurs when the HTML form is submitted (SEND button) or for a return character is pressed in the message `textarea`.

1. CLIENT: the `sendMessage` event handler runs which checks the event and prevents the default browser action.
1. CLIENT: assuming they are valid, the text in the user's name and message fields are sent as a JSON string to the server (which runs the `message` handler in step 5 above).

The following process occurs when the user changes their name:

1. CLIENT: if a new, valid, name is entered, the page is refreshed with that name added to the querystring.
1. SERVER: when a refresh occurs, the `close` handler sends a "leaving" message to all clients. On refresh, the process above starts again and the user connects as a new client.

Notes:

* the server does not care what type of message arrives - it simply broadcasts it back to all clients including the client which sent it. This ensures the chat window is updated everywhere.
* the only point the server parses a message is to extract the user's name when it receives the first "entered" message. This is largely optional and only done so the name can be broadcast when a connection is closed.
* The message log is an in-memory array which is wiped when the server is restarted.
