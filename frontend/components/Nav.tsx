"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/runs", label: "Runs" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-line bg-bg-deep/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-[0_6px_20px_-6px_rgba(110,170,94,0.6)] transition-transform duration-200 group-hover:-rotate-6">
            <FlaskConical className="size-5 text-white" />
          </span>
          <span className="font-display text-xl font-semibold tracking-wide text-ink">
            Jailbreak <span className="text-primary">Lab</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-light text-primary"
                    : "text-gold/80 hover:bg-card-muted hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
