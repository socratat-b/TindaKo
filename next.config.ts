import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
  // Precache all dashboard pages after login
  // Note: Precaching happens during SW install, so user must be logged in
  // for this to cache authenticated pages. NetworkFirst provides fallback.
  additionalPrecacheEntries: [
    { url: "/pos", revision: null },
    { url: "/products", revision: null },
    { url: "/inventory", revision: null },
    { url: "/utang", revision: null },
    { url: "/reports", revision: null },
    { url: "/settings", revision: null },
  ],
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSerwist(nextConfig);
