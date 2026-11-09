import type { NextConfig } from "next";
import path from "node:path";

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
        // The resume now lives as a PDF on Google Drive.
        source: '/resume',
        destination:
          'https://drive.google.com/file/d/1CQANMdMg4F62qqAmTx-6m0BrvrfFnhIh/view?usp=sharing',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
