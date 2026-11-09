import type { NextConfig } from "next";
import path from "node:path";

import { siteConfig } from "./config/site.config";

const repoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  // Pin every resolver to the monorepo root. With a lockfile at the repo root,
  // Turbopack infers the workspace root; pinning to the app dir breaks module
  // resolution (it cannot find the Next.js package from the workspace).
  outputFileTracingRoot: repoRoot,
  turbopack: {
    root: repoRoot,
  },
  transpilePackages: ['@mdxeditor/editor'],
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
  },
  async headers() {
    return [
      {
        // W3C TDM Reservation Protocol: reserve text/data-mining rights.
        // https://www.w3.org/community/tdmrep/
        source: '/:path*',
        headers: [
          {
            key: 'TDM-Reservation',
            value: '1',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/sign-in',
        permanent: true,
      },
      {
        source: '/signin',
        destination: '/sign-in',
        permanent: true,
      },
      {
        source: '/admin/dashboard',
        destination: '/admin',
        permanent: true,
      },
      {
        // The resume now lives as a PDF on Google Drive. Its URL is defined
        // once in siteConfig.links.resume (config/site.config.ts).
        source: '/resume',
        destination: siteConfig.links.resume,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
