/**
 * Canonical list of remote image origins allowed in `next/image`.
 *
 * Single source of truth consumed by:
 * - `next.config.ts` (builds `images.remotePatterns`)
 * - `src/utils/image-utils.ts` (validates URL origins before rendering)
 *
 * Keep this module dependency-free: it is loaded by the Next.js config
 * runtime and also bundled into Client Components.
 */
export interface RemoteImageOrigin {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname?: string;
}

export const REMOTE_IMAGE_ORIGINS: readonly RemoteImageOrigin[] = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
  },
  {
    protocol: "https",
    hostname: "picsum.photos",
  },
  {
    protocol: "https",
    hostname: "mundialmegastore.com.br",
    pathname: "/**",
  },
  // Production assets domain
  {
    protocol: "https",
    hostname: "assents01.comsuporte.com.br",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "admin01.winerp.com.br",
    pathname: "/**",
  },
  {
    protocol: "http",
    hostname: "localhost",
    port: "5573",
    pathname: "/**",
  },
];

/**
 * Normalizes an origin into the `protocol://hostname:port` key used to
 * compare against `URL.origin`-like strings. An empty/omitted port means
 * the protocol default.
 */
export function toImageOriginKey(origin: RemoteImageOrigin): string {
  const port = origin.port ? `:${origin.port}` : "";
  return `${origin.protocol}://${origin.hostname}${port}`;
}
