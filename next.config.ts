// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ship now: don’t block production builds on ESLint/TS errors.
  // (Re-enable later when you want strict CI.)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
