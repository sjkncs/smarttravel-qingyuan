"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const SplashScreen = dynamic(() => import("@/components/splash-screen"), { ssr: false });
const TrayWidget = dynamic(() => import("@/components/tray-widget"), { ssr: false });
const CustomerServiceWidget = dynamic(() => import("@/components/support/CustomerServiceWidget"), { ssr: false });

export default function ClientOnlyWidgets() {
  const pathname = usePathname();
  const isDesktop = pathname === "/desktop";
  const isAgentConsole = pathname?.startsWith("/support/agent");

  if (isDesktop) return null;

  return (
    <>
      <SplashScreen />
      <TrayWidget />
      {!isAgentConsole && <CustomerServiceWidget />}
    </>
  );
}
