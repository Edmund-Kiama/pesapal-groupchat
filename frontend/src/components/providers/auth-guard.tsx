"use client";

import { useUserContext } from "@/lib/context/user-context";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

// Public routes that don't require authentication
const publicRoutes = ["/", "/login", "/signup", "/register"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { tokens } = useUserContext();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow access to public routes
    if (publicRoutes.includes(pathname)) {
      return;
    }

    // Check both old and new auth stores for compatibility
    const hasAuth = tokens || isAuthenticated;

    if (!hasAuth) {
      router.replace("/login");
    }
  }, [tokens, isAuthenticated, pathname, router]);

  // Allow access to public routes
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Check both auth stores for compatibility
  const hasAuth = tokens || isAuthenticated;

  if (!hasAuth) return null;

  return <>{children}</>;
}
