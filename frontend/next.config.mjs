/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // react-leaflet & its core are ESM-only; transpile them for the Next build.
  transpilePackages: ["react-leaflet", "@react-leaflet/core"],
  // Produces a minimal standalone server for small Docker images.
  output: "standalone",
};

export default nextConfig;
