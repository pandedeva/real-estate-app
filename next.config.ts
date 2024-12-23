import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "53.fs1.hubspotusercontent-na1.net",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
