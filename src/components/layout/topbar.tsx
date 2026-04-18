"use client";

import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "./theme-toggle";

export function Topbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 lg:px-6">
      <div className="flex-1" />

      <ThemeToggle />

      {session?.user && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {session.user.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Cerrar sesion
          </button>
        </div>
      )}
    </header>
  );
}
