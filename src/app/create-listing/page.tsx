import CreateListingSection from "@/components/CreateListingSection";
import React from "react";

const CreateListing = () => {
  return (
    <section>
      <div className="p-3 container max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center my-7">
          Create a Listing
        </h1>

        <CreateListingSection />
      </div>
    </section>
  );
};

export default CreateListing;
