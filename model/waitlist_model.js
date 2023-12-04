import mongoose from "mongoose";

export const waitlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('WaitList', waitlistSchema);