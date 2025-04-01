import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: function() {
            return new mongoose.Types.ObjectId();
        }
    },
  username: {
    type: String,
    required: [true, "Please tell us your name"]
   },
    email: {
        type: String,
        required: [true],
        unique: true,
    },
    mobile: {
        type: String,
        required: [true],
        unique: true,
    },
  password: {
    type: String,
    required: [true]
  }
});

export default mongoose.model("User", userSchema);