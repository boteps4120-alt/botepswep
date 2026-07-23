/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "video.gumlet.io"
      }
    ]
  }
};

export default nextConfig;
