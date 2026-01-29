import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TindaKo - Offline POS",
    short_name: "TindaKo",
    description: "Offline-first Point of Sale for Philippine Sari-Sari Stores. Track sales, inventory, utang, and manage your tindahan kahit walang internet.",
    start_url: "/pos",
    display: "standalone",
    background_color: "#f0fdfa",
    theme_color: "#0d9488",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
