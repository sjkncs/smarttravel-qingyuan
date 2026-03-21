"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { I18nProvider } from "@/lib/i18n";
import { EditionProvider } from "@/lib/edition-context";
import { AuthProvider } from "@/lib/auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark">
      <I18nProvider>
        <EditionProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </EditionProvider>
      </I18nProvider>
    </NextThemesProvider>
  );
}
