import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const isStaticExport = process.env.STATIC_EXPORT === "1" || process.env.GITHUB_PAGES === "1";
const isElectronBuild = process.env.ELECTRON_BUILD === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages needs static export, Electron needs standalone
  output: isElectronBuild ? "standalone" : isStaticExport ? "export" : undefined,

  // GitHub Pages dist directory
  distDir: isStaticExport ? "dist" : ".next",

  // Fix image optimization for static export
  images: {
    unoptimized: isStaticExport,
  },

  // Fix Turbopack root detection when multiple lockfiles exist in parent dirs
  turbopack: {
    root: __dirname,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
