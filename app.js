const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
var cors = require("cors");
const cookiePasrer = require("cookie-parser");
const morgan = require("morgan");
const socketio = require("socket.io")

const http = require('http');
const app = express();
const server = http.createServer(app)


dotenv.config();

app.set("view engine", "ejs");
app.set("views", "./views");

const pathPublic = path.join(__dirname, "/public");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookiePasrer());
app.use(cors());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.use(express.static(pathPublic));

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// =============== MONGOOSE ==================
const connectDatabase = require('./config/db.config');

connectDatabase();

// =============== SOCKET.IO ==================
let onlineClients = []; // list client online
const io = socketio(server, {
  cors: {
    origin: '*',
  }
});
const getClientOnline = function () {
  return onlineClients
}
let countOnlineClients = 0;
io.on('connection', function (socket) {
  console.info(`Socket ${socket.id} has connected.`);
  onlineClients.push({socketId: socket.id, userId: ''});
  countOnlineClients ++;
  console.log('Count Online Client: ' + countOnlineClients);

  socket.on('disconnect', () => {
    onlineClients.filter(e => {
      return e.socketId !== socket.id
    })
    // onlineClients.forEach(function(so){
    //   if (so.socketId === socket.id){
    //     onlineClients.delete(so)
    //   }
    // })

    countOnlineClients --;
    console.info(`Socket ${socket.id} has disconnected.`);
    console.log('Count Online Client: ' + countOnlineClients);
  })

  // socket.on('Admin-sent-notification', function (data) {
  //   socket.broadcast.emit('Server-sent-notification', {
  //     content: data.content
  //   })
  // })

  socket.on('Login', function (data) {
    onlineClients = onlineClients.filter(e => {
      return e.socketId !== socket.id
    })
    onlineClients.push({socketId: socket.id, userId: data})
    // onlineClients.forEach(function(so){
    //   if (so.socketId === socket.id){
    //     onlineClients.delete(so)
    //     onlineClients.add({socketId: socket.id, userId: data});
    //   }
    // })
  })
})

module.exports = {io, getClientOnline}


// ================ ROUTE ===================
const userRoute = require("./routes/user.route");
app.use("/", userRoute);

const adminRoute = require('./routes/admin.route')
app.use("/admin", adminRoute)

const PORT = process.env.PORT || 3000;

server.listen(PORT, function () {
  console.log("Server started on port " + PORT);
});
