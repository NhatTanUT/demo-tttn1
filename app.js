const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
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

// =============== MONGOOSE ==================

mongoose.connect(process.env.URI_DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// =============== SOCKET.IO ==================
const onlineClients = new Set(); // list client online
const io = socketio(server, {
  cors: {
    origin: '*',
  }
});

let countOnlineClients = 0;

io.on('connection', function (socket) {
  console.info(`Socket ${socket.id} has connected.`);
  onlineClients.add(socket.id);
  countOnlineClients ++;
  console.log('Count Online Client: ' + countOnlineClients);

  socket.on('disconnect', () => {
    onlineClients.delete(socket.id);
    countOnlineClients --;
    console.info(`Socket ${socket.id} has disconnected.`);
    console.log('Count Online Client: ' + countOnlineClients);
  })

  socket.on('Admin-sent-notification', function (data) {
    socket.broadcast.emit('Server-sent-notification', {
      content: data.content
    })
  })


})



// ================ ROUTE ===================
const userRoute = require("./routes/user.route");
app.use("/", userRoute);

const adminRoute = require('./routes/admin.route')
app.use("/admin", adminRoute)

const PORT = process.env.PORT || 3000;

server.listen(PORT, function () {
  console.log("Server started on port " + PORT);
});
