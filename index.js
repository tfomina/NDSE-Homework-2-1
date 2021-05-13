require("dotenv").config();
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const http = require("http");
const socketIO = require("socket.io");

const notFoundMiddleware = require("./src/middleware/notFound");
const passport = require("./src/passport/setup");

const indexRouter = require("./src/routes");
const userRouter = require("./src/routes/user");
const bookRouter = require("./src/routes/book");

const app = express();
const server = http.Server(app);
const io = socketIO(server);

io.on("connection", (socket) => {
  const { id } = socket;
  console.log(`Socket connected: ${id}`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${id}`);
  });
});

/*io.on("connection", (socket) => {
  const { id } = socket;
  console.log(`Socket connected: ${id}`);

  // сообщение себе
  socket.on("message-to-me", (msg) => {
    msg.type = "me";
    socket.emit("message-to-me", msg);
  });

  // сообщение для всех
  socket.on("message-to-all", (msg) => {
    msg.type = "all";
    socket.broadcast.emit("message-to-all", msg);
    socket.emit("message-to-all", msg);
  });

  // работа с комнатами
  const { roomName } = socket.handshake.query;
  console.log(`Socket roomName: ${roomName}`);
  socket.join(roomName);
  socket.on("message-to-room", (msg) => {
    msg.type = `room: ${roomName}`;
    socket.to(roomName).emit("message-to-room", msg);
    socket.emit("message-to-room", msg);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${id}`);
  });
});*/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(expressLayouts);
app.set("layout", "./layouts/index");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

app.use(cors());

app.use("/public", express.static(path.join(__dirname, "public")));

// app.get("/", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "src", "index.html"));
// });

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/books", bookRouter);

app.use(notFoundMiddleware);

const PORT = process.env.PORT || 3000;
const UserDB = process.env.DB_USERNAME || "root";
const PasswordDB = process.env.DB_PASSWORD || "AXRHV]cy?s/4UkZ";
const NameDB = process.env.DB_NAME || "books_database";
const HostDB = process.env.DB_HOST || "mongodb://localhost:27017/";
const start = async () => {
  try {
    const UrlDB = `mongodb+srv://${UserDB}:${PasswordDB}@cluster0.m4q9c.mongodb.net/${NameDB}?retryWrites=true&w=majority`;
    await mongoose.connect(encodeURI(UrlDB), {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Подключение в Docker контейнере
    /*await mongoose.connect(HostDB, {
      user: UserDB,
      pass: PasswordDB,
      dbName: NameDB,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });*/

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};

start();
