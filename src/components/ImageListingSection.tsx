"use client";
import Image from "next/image";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation, Parallax } from "swiper/modules";
import "swiper/css/bundle";

interface ImageProps {
  imageUrls: string[];
  name: string;
}

const ImageListingSection = ({ listing }: { listing: ImageProps }) => {
  SwiperCore.use([Parallax, Navigation]);

  return (
    <section className="bg-slate-100">
      {listing.imageUrls.length > 0 ? (
        <>
          <Swiper parallax navigation loop={true}>
            {listing.imageUrls.map((url, index) => (
              <SwiperSlide key={index}>
                <Image
                  src={url}
                  alt={listing.name}
                  width={400}
                  height={400}
                  className="h-[400px] object-contain mx-auto w-full py-2"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </>
      ) : (
        <div className="h-[400px] text-2xl font-bold flex justify-center items-center">
          {`No Image Available :(`}
        </div>
      )}
    </section>
  );
};

export default ImageListingSection;
