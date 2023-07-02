import { instrument } from "@socket.io/admin-ui";
import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import connect from "./db/conn.js";
import text_model from "./model/text_model.js";
import user_model from "./model/user_model.js";
import router from "./router/routes.js";

const app = express();
app.use(cors());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allow specific HTTP methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers
  next();
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://admin.socket.io/", "http://localhost:5555/"],
    methods: ["GET", "POST"],
  },
});

const connectedUsers = {};

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
      io.to(connectedUsers[userId]).emit(
        "error",
        "You need to have at least 2 devices for Text Syncing"
      );
     
      console.log(`User ${userId} does not have at least 2 clients connected`);
    } else {
      
      io.to(otherClients).emit("get", data.message);
       if (!data.fromHistory) {
        const newText = new text_model({
          text: data.message,
          user: userId,
        });
        newText.save().then(async (result) => {
          console.log("user to update");
          await user_model.findByIdAndUpdate(
            userId,
            { $push: { texts: result._id } },
            { new: true }
          );
        });
      }
    }
    console.log(data.userId);
  });
});
instrument(io, { auth: false });

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
