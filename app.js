require("dotenv").config();
const express = require("express");
const path = require("path");
var cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const socketio = require("socket.io")
const helmet = require('helmet')
const createError = require('http-errors')
const logEvents = require('./utils/logEvents')

const http = require('http');
const app = express();
const server = http.createServer(app)

app.set("view engine", "ejs");
app.set("views", "./views");

const pathPublic = path.join(__dirname, "/public");

app.use(helmet())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
// app.use(cors());
app.use(cors({
  origin: ['https://vuetify-shop.netlify.app', 'http://localhost:8080', 'https://admin-vuetifyshop.netlify.app']
}));
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.use(express.static(pathPublic));

// app.all('/*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "https://vuetify-shop.netlify.app");
//   // res.header("Access-Control-Allow-Origin", "http://localhost:8080");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });

// =============== MONGOOSE ==================
const connectDatabase = require('./config/db.config');

connectDatabase();

// =============== SOCKET.IO ==================
let onlineClients = []; // list client online
const AccessLog = require('./models/accessLog.model')
const io = socketio(server, {
  cors: {
    origin: ['https://vuetify-shop.netlify.app', 'http://localhost:8080', 'https://admin-vuetifyshop.netlify.app'],
    
  }
});
const getClientOnline = function () {
  return onlineClients
}
let countOnlineClients = 0;
io.on('connection', function (socket) {
  console.info(`Socket ${socket.id} has connected.`);
  onlineClients = onlineClients.filter(e => {
    return e.socketId !== socket.id
  })
  onlineClients.push({socketId: socket.id, userId: '', date: new Date()});
  countOnlineClients ++;
  console.log('Count Online Client: ' + countOnlineClients);

  socket.on('disconnect', () => {
    // onlineClients = onlineClients.filter(e => {
    //   return e.socketId !== socket.id
    // })

    countOnlineClients --;
    console.info(`Socket ${socket.id} has disconnected.`);
    console.log('Count Online Client: ' + countOnlineClients);
  })

  socket.on('Admin-sent-notification', function (data) {
    socket.broadcast.emit('Server-sent-notification', {
      content: data.content
    })
  })

  socket.on('Login', function (data) {
    onlineClients = onlineClients.filter(e => {
      return e.socketId !== socket.id
    })
    onlineClients.push({socketId: socket.id, userId: data, date: new Date()})
    // onlineClients.forEach(function(so){
    //   if (so.socketId === socket.id){
    //     onlineClients.delete(so)
    //     onlineClients.add({socketId: socket.id, userId: data});
    //   }
    // })
  })
})

module.exports = {io, getClientOnline}

var cron = require('node-cron');
cron.schedule('0 0 * * *', async () => {
  console.log('Update list client access at 00:00 at Asia/Ho_Chi_Minh timezone');
  let date = new Date(new Date().getTime());
    date.setHours(0, 0, 0, 0);
  let newAccess = new AccessLog({
    date: date,
    list: onlineClients
  })
  await newAccess.save()
  onlineClients = []
}, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh"
});


// ================ ROUTE ===================
const userRoute = require("./routes/user.route");
app.use("/", userRoute);

const adminRoute = require('./routes/admin.route')
app.use("/admin", adminRoute)

// Error 404 - Not found
app.use((req, res, next) => {
  next(createError.NotFound())
})

// Handle error middleware
app.use((err, req, res, next) => {
  console.log(err);
  console.log(req.body);
  logEvents(`${req.url} -- ${req.method} \n ${err.message} \n\n ${JSON.stringify(req.body, null, 2)}`)
  res.status(err.status || 500)
  res.json({msg: err.message})
})

const PORT = process.env.PORT || 3000;

server.listen(PORT, function () {
  console.log("Server started on port " + PORT);
});
