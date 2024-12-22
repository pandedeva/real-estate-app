import UpdateListingSection from "@/components/UpdateListingSection";
import React from "react";

const UpdateListing = () => {
  return (
    <section>
      <div className="p-3 container max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center my-7">
          Update a Listing
        </h1>

        <UpdateListingSection />
      </div>
    </section>
  );
};

export default UpdateListing;
