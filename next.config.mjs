/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // Use modern image formats
    formats: ['image/avif', 'image/webp'],
  },
  // Enable compression
  compress: true,
  // Optimize production builds
  productionBrowserSourceMaps: false,
  async redirects() {
    // Restaurants de demonstration retires du catalogue. Google les a toujours
    // en index et continue d'y envoyer du trafic : sans 301 ces clics tombent
    // sur un 404. Destination volontairement generique (la liste), et non un
    // restaurant reel, pour ne pas fabriquer une equivalence arbitraire.
    return [
      {
        source: '/restaurants/chez-loutcha',
        destination: '/restaurants',
        permanent: true,
      },
      {
        source: '/restaurants/pizza-hut-dakar',
        destination: '/restaurants',
        permanent: true,
      },
      {
        source: '/restaurants/ocean-fish-chips',
        destination: '/restaurants',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Required for iOS Universal Links
        source: '/.well-known/apple-app-site-association',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
      {
        // Required for Android App Links
        source: '/.well-known/assetlinks.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
