import React, { PropsWithChildren } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import QueryProvider from "@/components/providers/query-provider";
import AppContext from "@/lib/context";
import AuthGuard from "@/components/providers/auth-guard";

function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <AppContext>
          <AuthGuard>{children}</AuthGuard>
        </AppContext>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default AppProviders;
