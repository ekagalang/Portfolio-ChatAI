import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE_URL = "https://ekagalang.my.id";

  return [
    {
      url:              BASE_URL,
      lastModified:     new Date(),
      changeFrequency:  "weekly",
      priority:         1,
    },
  ];
}