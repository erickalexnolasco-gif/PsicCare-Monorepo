/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@psicare/ui", "@psicare/db", "@psicare/types", "@psicare/billing", "@psicare/jobs"],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        // Permite cualquier subdominio de GitHub Codespaces
        "*.app.github.dev",
      ],
    },
  },
};
module.exports = nextConfig;