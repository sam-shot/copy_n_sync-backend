import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: false,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    texts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Text' }],
  });

  export default mongoose.model('User', userSchema);