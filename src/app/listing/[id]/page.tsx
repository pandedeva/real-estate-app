import ImageListingSection from "@/components/ImageListingSection";
// import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
} from "react-icons/fa";

interface ListingParams {
  params: {
    id: string;
  };
}

const Listing = async ({ params }: ListingParams) => {
  const { id } = params;
  let listing = null;

  try {
    const result = await fetch(process.env.URL + "/api/listing/get", {
      method: "POST",
      body: JSON.stringify({ listingId: id }),
      cache: "no-store",
    });

    const data = await result.json();
    listing = data[0];
  } catch (error) {
    listing = { title: "Failed to load listing" + error };
  }

  if (!listing._id || listing.name === "Failed to load listing") {
    return (
      <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
        <h2 className="text-xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-2xl">
          Listing not found
        </h2>
      </main>
    );
  }

  return (
    <section>
      <div>
        {/* membuat LISTING IMAGE URLS SWIPER SLIDER */}
        {/* NANTI IMPORT LISTING FROM HERE */}
        <ImageListingSection listing={listing} />

        <div className="flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4">
          <p className="text-2xl font-bold uppercase">
            {listing.name} -{" "}
            {listing.offer
              ? listing.discountPrice.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                })
              : listing.regularPrice.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                })}
            {/* kalau type nya rent tambahkan / month, kalau sale tidak usah */}
            {listing.type === "rent" ? " / month" : ""}
          </p>

          <Link
            className="flex items-center gap-1 text-slate-600 underline"
            href={`https://www.google.com/maps/search/?api=1&query=${listing.address}`}
            target="_blank"
          >
            <FaMapMarkerAlt className="text-green-700" />
            <p>{listing.address}</p>
          </Link>

          <div className="flex gap-4">
            <div className="bg-red-900 w-full max-w-[200px] text-white p-1 rounded-md font-semibold flex justify-center items-center">
              {listing.type === "rent" ? "For Rent" : "For Sale"}
            </div>
            {listing.offer && (
              <div className="bg-green-500 font-bold text-2xl w-full text-white py-1 rounded-md flex items-center justify-center">
                DISCOUNT ${+listing.regularPrice - +listing.discountPrice} OFF
              </div>
            )}
          </div>

          <p className="text-slate-800">
            <span className="font-semibold text-black">Description - </span>
            {listing.description}
          </p>

          <ul className="text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6">
            <li className="flex items-center gap-1 whitespace-nowrap ">
              <FaBed className="text-lg" />
              {listing.bedrooms > 1
                ? `${listing.bedrooms} beds `
                : `${listing.bedrooms} bed `}
            </li>
            <li className="flex items-center gap-1 whitespace-nowrap ">
              <FaBath className="text-lg" />
              {listing.bathrooms > 1
                ? `${listing.bathrooms} baths `
                : `${listing.bathrooms} bath `}
            </li>
            <li className="flex items-center gap-1 whitespace-nowrap ">
              <FaParking className="text-lg" />
              {listing.parking ? "Parking spot" : "No Parking"}
            </li>
            <li className="flex items-center gap-1 whitespace-nowrap ">
              <FaChair className="text-lg" />
              {listing.furnished ? "Furnished" : "Unfurnished"}
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Listing;
