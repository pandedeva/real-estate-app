"use client";
import Image from "next/image";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";

interface ImageProps {
  imageUrls: string[];
  name: string;
}

const ImageListingSection = ({ listing }: { listing: ImageProps }) => {
  SwiperCore.use([Navigation]);

  return (
    <>
      {listing.imageUrls.length > 0 ? (
        <>
          <Swiper navigation>
            {listing.imageUrls.map((url, index) => (
              <SwiperSlide key={index}>
                <Image
                  src={url}
                  alt={listing.name}
                  width={400}
                  height={400}
                  className="h-[400px] object-contain mx-auto w-full py-2 bg-no-repeat bg-center"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </>
      ) : (
        // <Image
        //   src={listing?.imageUrls[0]}
        //   alt={listing.name}
        //   width={400}
        //   height={400}
        //   className="h-[400px] object-contain mx-auto w-full py-2"
        // />
        <div className="h-[400px] text-2xl font-bold flex justify-center items-center">
          No Image Available
        </div>
      )}
    </>
  );
};

export default ImageListingSection;
