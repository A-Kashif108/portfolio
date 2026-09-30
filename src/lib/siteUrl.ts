// Absolute site origin for metadata, the sitemap and structured data.
// Set NEXT_PUBLIC_SITE_URL once the domain is chosen; until then Vercel's production URL is used.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
