/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Next/Image: autoriza hosts remotos
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // opcional (avatars)
      { protocol: "https", hostname: "sommelierai.pro" },           // opcional (tus propias imágenes)
    ],
  },

  // ✅ Tus redirecciones existentes
  async redirects() {
    return [
      { source: "/privacy-policy", destination: "/legal#privacidad", permanent: true },
      { source: "/privacy",        destination: "/legal#privacidad", permanent: true },
      { source: "/terms",          destination: "/legal#terminos",   permanent: true },
    ];
  },

  // ✅ No frenar build por TypeScript/ESLint (como ya tenías)
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
