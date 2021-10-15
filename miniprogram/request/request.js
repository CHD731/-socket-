const io = require('./socket.io.min')
let socket = io()
console.log(socket);
let obj = {
  socket: socket
}
module.exports.obj = obj 