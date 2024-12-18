import mongoose from "mongoose";

let initialize = false;

export const connect = async () => {
  mongoose.set("strictQuery", true);

  if (initialize) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: "real-estate",
    });
    initialize = true;
    console.log("MongoDB is connected");
  } catch (error) {
    console.log("MongoDB connection error", error);
  }
};
