import type { NextConfig } from "next";
import { REMOTE_IMAGE_ORIGINS } from "./src/core/config/image-origins";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  cacheComponents: true,
  cacheLife: {
    frequent: { stale: 300, revalidate: 600, expire: 900 }, // 5/10/15 min
    quarter: { stale: 900, revalidate: 1800, expire: 3600 }, // 15/30/60 min
    hours: { stale: 3600, revalidate: 7200, expire: 86400 }, // 1/2/24 horas
    seconds: { stale: 5, revalidate: 120, expire: 300 }, // 1/2/5 min
    daily: { stale: 86400, revalidate: 172800, expire: 604800 }, // 1/2/7 dias
  },
  images: {
    qualities: [75, 100],
    remotePatterns: REMOTE_IMAGE_ORIGINS.map((origin) => ({
      protocol: origin.protocol,
      hostname: origin.hostname,
      port: origin.port ?? "",
      pathname: origin.pathname ?? "/**",
    })),
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
