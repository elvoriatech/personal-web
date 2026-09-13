"use client";

import { useState } from "react";
import { AdminNav, type NavGroup } from "./AdminNav";

/**
 * Below the sidebar breakpoint the nav lives behind a toggle. It is a client
 * component only so the menu can close itself after a link is followed —
 * layouts persist across App Router navigations, so nothing else would.
 */
export function MobileAdminNav({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="admin-mobile-nav"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-[40px] items-center gap-2 rounded-pill border border-line bg-surface px-3.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
          {open ? (
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          ) : (
            <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          )}
        </svg>
        Menu
      </button>
      {open && (
        <div
          id="admin-mobile-nav"
          className="absolute inset-x-0 top-full z-20 border-b border-line bg-surface px-4 py-4 shadow-[0_24px_48px_-32px_rgba(28,20,60,0.5)]"
        >
          <AdminNav groups={groups} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
