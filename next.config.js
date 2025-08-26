/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/privacy-policy",
        destination: "/legal#privacidad",
        permanent: true,
      },
      {
        source: "/privacy",
        destination: "/legal#privacidad",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/legal#terminos",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
module.exports = Object.assign({}, module.exports || {}, {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true }
});
