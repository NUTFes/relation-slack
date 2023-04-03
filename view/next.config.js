/** @type {import('next').NextConfig} */

const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  env: {
    SSR_API_URI: isProd ? 'https://relation-slack-api.nutfes.net' : 'http://api:1323',
    CSR_API_URI: isProd ? 'https://relation-slack-api.nutfes.net' : 'http://localhost:1323',
  },
}

module.exports = nextConfig
