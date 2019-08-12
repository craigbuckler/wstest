// initialise
const node = { form: 0, chat: 0, log: 0, name: 0, message: 0 };
window.addEventListener('DOMContentLoaded', () => {

  // cache nodes
  for (let n in node) node[n] = document.getElementById(n);

  // set user name and start communication
  if (setName()) wsStart();

});

// random name
function setName() {

  // get name from URL
  let name = location.search.slice(1).trim();

  if (name) {
    node.name.value = name;
    return 1;
  }

  // generate a new name
  const
    fore = 'Creepy,Dirty,Demented,Eerie,Evil,Filthy,Freaky,Ghastly,Horrific,Hysterical,Insane,Moist,Nasty,Odd,Peculiar,Psychotic,Strange,Scary,Weird,Unhinged,Unnatural,Unusual'.split(','),
    last = 'Badger,Beaver,Bunny,Dolphin,Duckling,Hamster,Hedgehog,Gerbil,Gnat,Goat,Kitten,Koala,Mosquito,Penguin,Puffin,Platypus,Puppy,Squirrel,Toucan,Weevil,Yak'.split(',');

  location.search =
    fore[ Math.floor(Math.random() * fore.length) ] +
    last[ Math.floor(Math.random() * last.length) ];

  return 0;

}


// web socket communications
function wsStart() {

  let
    port = parseInt(location.port, 10) + 1,
    socket = new WebSocket(`ws://${location.hostname}:${port}`);

  // client registration
  socket.addEventListener('open', () => {

    socket.send(JSON.stringify({ name: node.name.value, msg: 'has entered the room' }));

  });

  // receive message
  socket.addEventListener('message', evt => {

    // append name and message
    let
      atEnd = node.chat.clientHeight + node.chat.scrollTop + 200 >= node.chat.scrollHeight,
      data = JSON.parse(evt.data),
      name = document.createElement('dt'),
      msg = document.createElement('dd');

    name.textContent = (data.name || 'anonymous') + ':';
    msg.textContent = data.msg || 'is quiet?';
    node.log.appendChild(name);
    node.log.appendChild(msg);

    // scroll on new message
    if (atEnd) node.chat.scrollTo(0, node.chat.scrollHeight - node.chat.clientHeight);

  });

  // send new message
  node.form.addEventListener('submit', sendMessage, false);
  node.message.addEventListener('keypress', sendMessage, false);

  function sendMessage(e) {

    // enter key pressed?
    if (e.type === 'keypress' && e.keyCode !== 13) return;

    // stop events
    e.preventDefault();

    // valid message?
    let
      name = node.name.value.trim(),
      msg = node.message.value.trim();

    if (!name.length || !msg.length) return;

    // send message
    socket.send(JSON.stringify({ name, msg }));
    node.message.value = '';

  }

  // change name
  node.name.addEventListener('change', () => {

    let name = node.name.value.trim();
    if (name) location.search = name;

  }, false);

}
