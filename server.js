import express from "express";
import router from "./router/routes.js";
import connect from "./db/conn.js";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const connectedUsers = {};

app.use(cors());
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`User`, socket.id, ` connected with id: ${userId}`);

  if (!connectedUsers[userId]) {
    connectedUsers[userId] = [socket.id]; // create a new array for this user's sockets
  } else {
    connectedUsers[userId].push(socket.id); // add the socket to the existing array for this user
  }
  console.log(connectedUsers);

  socket.on("disconnect", () => {
    const index = connectedUsers[userId].indexOf(socket.id);
    if (index !== -1) {
      connectedUsers[userId].splice(index, 1);
    }
    console.log(socket.id, "user disconnected");
    console.log(connectedUsers);
  });

  socket.on("send", (data) => {
    // Do something with the data, like broadcasting it to other connected clients
    console.log(data);
    const userId = data.userId; // Replace with the user ID you want to send the message to
    console.log(userId);
    const socketId = connectedUsers[userId];
    console.log(socketId);
    const otherClients = connectedUsers[userId].filter(
      (element) => element !== socket.id
    );
    console.log(otherClients);

    if (connectedUsers[userId].length < 2) {
      console.log(`User ${userId} does not have at least 2 clients connected`);
    } else {
      io.to(otherClients).emit("get", data.message);
    }
    console.log(data.userId);
  });
});
 
app.use(express.json());
const port = 3000;

app.get("/", (req, res) => {
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
