import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://uriengine.vercel.app";

  const routes = [
    "",
    "/sitemap",
    "/login",
    "/signup",
    "/dashboard",
    "/dashboard/nodes",
    "/dashboard/resumes",
    "/dashboard/ats",
    "/dashboard/templates",
    "/dashboard/latex",
    "/dashboard/assistant",
    "/dashboard/settings",
    "/dashboard/profile",
    "/dashboard/guide",
    "/dashboard/universal",
    "/dashboard/universal/view",
    "/dashboard/universal/extract"
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route.startsWith("/dashboard") ? "daily" : "weekly" as any,
    priority: route === "" ? 1.0 : route.startsWith("/dashboard") ? 0.8 : 0.5
  }));
}
