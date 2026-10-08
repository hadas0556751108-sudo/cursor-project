'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

const PUBLIC_PATHS = ['/login', '/auth'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Wraps the app with authentication enforcement:
 * - Public paths (login, auth callbacks) render without the app shell.
 * - Authenticated paths require a signed-in user; otherwise redirect to /login.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = isPublicPath(pathname);

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublic) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, isPublic, router]);

  if (isPublic) {
    return <>{children}</>;
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F1117]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34E3D9] mx-auto mb-4" />
          <p className="text-[#8B949E]">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F1117]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
