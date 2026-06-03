import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://psicare.mx", lastModified: new Date(), priority: 1 },
    { url: "https://psicare.mx/#features", lastModified: new Date(), priority: 0.8 },
    { url: "https://psicare.mx/#pricing", lastModified: new Date(), priority: 0.9 },
    { url: "https://psicare.mx/#faq", lastModified: new Date(), priority: 0.7 },
  ];
}
