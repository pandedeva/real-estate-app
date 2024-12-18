import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      required: true,
    },
  },
  // untuk menyimpan waktu saat delete dan create
  { timestamps: true }
);

// jika sudah ada model User maka gunakan model tersebut, kalau tidak buat yang baru
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
