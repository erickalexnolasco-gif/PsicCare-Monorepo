/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@psicare/ui", "@psicare/db", "@psicare/types", "@psicare/billing", "@psicare/jobs"],
};
module.exports = nextConfig;
