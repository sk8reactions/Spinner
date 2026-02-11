/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.sk8reactions.cloud",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: [
    "/icon",
    "/icon.svg",
    "/favicon.svg",
    "/og-image.png",
    "/**/*.svg",
    "/**/*.png",
    "/**/*.ico",
    "/**/*.jpg",
    "/**/*.jpeg",
    "/**/*.gif",
    "/**/*.webp",
    "/**/*.woff",
    "/**/*.woff2",
    "/**/*.ttf",
  ],
}
