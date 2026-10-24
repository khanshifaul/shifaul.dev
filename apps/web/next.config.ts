import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the project root so Next.js stops walking up the filesystem
  // looking for sibling lockfiles (we have one at /run/media/khan/Studio/Projects/package-lock.json
  // from a different project that confused Turbopack).
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
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
    ];
  },
};

export default nextConfig;
