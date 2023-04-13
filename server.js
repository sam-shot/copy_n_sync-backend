import express from "express";
import router from "./router/routes.js";
import connect from "./db/conn.js";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

io.on("message", (data) => {
  console.log(`Received message: ${data}`);
});

app.use(express.json());
const port = 3000;

app.get("/", (req, res) => {
  io.emit("message", "Hello, server!");
  res.send({
    message: " The API is running sucessfully",
  });
});

app.use("/", router);
connect()
  .then(() => {
    try {
      server.listen(port, function () {
        console.log("Server listening at port", port);
      });
    } catch (error) {
      server.listen(port, function () {
        console.log("Server listening at port", port);
      });
    }
  })
  .catch((error) => {
    console.log("Invalid DB connection", error);
  });

// app.listen(port, function() {
//     console.log('Server listening at port', port);
//   });
