import { instrument } from "@socket.io/admin-ui";
import axios from "axios";
import cors from "cors";
import express from "express";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import http from "http";
import multer from "multer";
import { Server } from "socket.io";
import connect from "./db/conn.js";
import text_model from "./model/text_model.js";
import user_model from "./model/user_model.js";
import router from "./router/routes.js";

const upload = multer({ storage: multer.memoryStorage() });

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

const firebaseConfig = {
  apiKey: "AIzaSyDBE3WoR8yrVhKRHFus_QoV4oSCz5-2n4k",
  authDomain: "copy-n-sync.firebaseapp.com",
  projectId: "copy-n-sync",
  storageBucket: "copy-n-sync.appspot.com",
  messagingSenderId: "818553963570",
  appId: "1:818553963570:web:b287c0fb68fe258d49282b",
  measurementId: "G-C7YCG5H12D",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp, "gs://copy-n-sync.appspot.com/");

const connectedUsers = {};



app.use(express.json());
const port = 3000;

app.get("/", (req, res) => {
  res.send({
    message: " The API is running sucessfully",
  });
});

app.post("/upload", upload.single("file"), (req, res) => {
  const {userId, deviceId} = req.body;
  // const userId = "642f3ad88c7ed964295810f5";
  const storageRef = ref(storage, req.file.originalname);
  user_model
    .findById(userId)
    .then((result) => {
      uploadBytes(storageRef, req.file.buffer).then(async (snapshot) => {
        const link = await getDownloadURL(snapshot.ref);
        const data = {
          text: link,
          userId: userId,
          firebaseId: deviceId
        };
        await axios
          .post("https://copy-n-sync-backend.vercel.app/send/text", data)
          .then((response) => {
            res.status(200).send(response.data);
          })
          .catch((error) => {
            console.error(error);
          });
      });
    })
    .catch((error) => {
      return res.status(404).send({
        message: "Cant Find User",
        status: "404",
      });
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
