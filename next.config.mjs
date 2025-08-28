/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      handlebars: false,
      "require-in-the-middle": false,
      "@opentelemetry/api": false,
      "@opentelemetry/instrumentation": false,
      "@opentelemetry/sdk-node": false
    };
    return config;
  },
};
export default nextConfig;
