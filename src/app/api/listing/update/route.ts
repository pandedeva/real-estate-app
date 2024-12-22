import { currentUser } from "@clerk/nextjs/server";
import Listing from "@/libs/models/listing.model";
import { connect } from "@/libs/mongodb/mongoose";

/* eslint-disable */
export const POST = async (req: any) => {
  const user = await currentUser();

  try {
    await connect();
    const data = await req.json();

    if (!user || user.publicMetadata.userMongoId !== data.userMongoId) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const newListing = await Listing.findByIdAndUpdate(
      data.listingId,
      {
        $set: {
          name: data.name,
          description: data.description,
          address: data.address,
          regularPrice: data.regularPrice,
          discountPrice: data.discountPrice,
          bathrooms: data.bathrooms,
          bedrooms: data.bedrooms,
          furnished: data.furnished,
          parking: data.parking,
          type: data.type,
          offer: data.offer,
          imageUrls: data.imageUrls,
        },
      },
      //  data yang dikembalikan adalah data yang sudah diperbarui (bukan data lama sebelum update).
      { new: true }
    );
    // tidak usah pakai .save karna sudah ada findByIdAndUpdate
    // await newListing.save();

    return new Response(JSON.stringify(newListing), {
      status: 200,
    });
  } catch (error) {
    console.log("Error creating listing:", error);

    return new Response("Error creating listing", {
      status: 500,
    });
  }
};
