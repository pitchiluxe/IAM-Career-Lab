/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone output is only needed for Electron bundling, not for Vercel
  ...(process.env.ELECTRON_BUILD === "true" ? { output: "standalone" } : {}),
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};
module.exports = nextConfig;
