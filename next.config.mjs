/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
    ],
    // Отдаём картинки напрямую с TMDB, минуя серверный прокси Next.js.
    // Это отключает автосжатие/ресайз на лету, зато не зависит от того,
    // может ли сам Node-сервер достучаться до image.tmdb.org.
    unoptimized: true,
  },
};

export default nextConfig;
