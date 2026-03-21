import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import NavBar from "@/components/navbar";
import FloatingNav from "@/components/floating-nav";
import ClientOnlyWidgets from "@/components/client-only-widgets";
import { Noto_Sans_SC, Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans-sc",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "智游清远 — AI驱动的乡村旅游数字化解决方案",
  description: "告别盲从，发现你的专属小众秘境。AI智能规划、村落发现引擎、实景地图导航、数字人智能伴游，您的24小时乡村旅行管家。",
  keywords: ["清远旅游", "乡村旅游", "AI旅行", "智能规划", "瑶族文化", "村落发现", "数字人导游"],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
  other: {
    "theme-color": "#059669",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "智游清远",
  },
  openGraph: {
    title: "智游清远 — AI驱动的乡村旅游数字化解决方案",
    description: "AI智能规划、村落发现引擎、实景地图导航、数字人智能伴游",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoSansSC.variable} font-sans antialiased`}>
        <Providers>
          <ClientOnlyWidgets />
          <NavBar />
          {children}
          <FloatingNav />
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(regs) {
                  regs.forEach(function(r) { r.unregister(); });
                });
                caches.keys().then(function(keys) {
                  keys.forEach(function(k) { caches.delete(k); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
