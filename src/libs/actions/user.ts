import User from "../models/user.model";
import { connect } from "../mongodb/mongoose";

export const createOrUpdateUser = async (
  // mengambil data dari clerk atau mongodb
  id: string,
  first_name: string,
  last_name: string,
  image_url: string,
  username: string,
  email_addresses: { email_address: string }[]
) => {
  try {
    await connect();
    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        $set: {
          // camelCase dari user.model
          firstName: first_name,
          lastName: last_name,
          profilePicture: image_url,
          username: username,
          email: email_addresses[0].email_address,
        },
      },
      { upsert: true, new: true }
    );
    return user;
  } catch (error) {
    console.log("Error creating or updating user", error);
  }
};

export const deleteUser = async (id: string) => {
  try {
    await connect();
    await User.findOneAndDelete({ clerkId: id });
  } catch (error) {
    console.log("Error deleting user", error);
  }
};
