import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow:     "/",
      disallow:  ["/api/"],
    },
    sitemap: "https://ekagalang.my.id/sitemap.xml",
  };
}