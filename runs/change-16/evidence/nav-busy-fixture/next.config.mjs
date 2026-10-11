/** @type {import('next').NextConfig} */
export default {
  // The kit is imported by tsconfig path from outside this folder.
  experimental: { externalDir: true },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
