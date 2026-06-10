import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The landing page now lives at "/"; keep old links working.
    return [{ source: "/founding", destination: "/", permanent: false }];
  },
};

export default nextConfig;
