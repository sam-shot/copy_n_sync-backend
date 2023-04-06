import express from "express";
import router from "./router/routes.js";
import connect from "./db/conn.js";

const app = express();


app.use(express.json());
const port = 3000;

app.get('/', (req, res) => {
    res.send({
        "message": " The API is running sucessfully"
        });
});

app.use('/', router);
connect().then(()=>{
try {
    app.listen(port, function() {
        console.log('Server listening at port', port);
      });
} catch (error) {
    app.listen(port, function() {
        console.log('Server listening at port', port);
      });
}
}).catch(error =>{
    console.log("Invalid DB connection");
});;

