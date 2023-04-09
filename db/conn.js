import mongoose from "mongoose";

async function connect() {
  const uri = "mongodb+srv://copynsync:samshotcopy@cluster0.tl2ip55.mongodb.net/?retryWrites=true&w=majority";
  // const uri = "mongodb://127.0.0.1:27017/copynsync";

  mongoose.set("strictQuery", true);
  const db = await mongoose.connect(uri);
  console.log("Database Connected at ", db.connection.host);
  return db;
}

export default connect;
