"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const SplashScreen = dynamic(() => import("@/components/splash-screen"), { ssr: false });
const TrayWidget = dynamic(() => import("@/components/tray-widget"), { ssr: false });

export default function ClientOnlyWidgets() {
  const pathname = usePathname();
  if (pathname === "/desktop") return null;

  return (
    <>
      <SplashScreen />
      <TrayWidget />
    </>
  );
}
