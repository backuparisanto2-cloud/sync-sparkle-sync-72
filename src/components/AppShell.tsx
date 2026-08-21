import { Link } from "@tanstack/react-router";
import { LayoutDashboard, DoorClosed, Wrench } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Ringkasan", icon: LayoutDashboard },
  { to: "/kamar", label: "Kamar", icon: DoorClosed },
  { to: "/fasilitas", label: "Fasilitas Utama", icon: Wrench },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <header className="border-b border-gold-line bg-card/70 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:flex sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/app-icon-192.png"
              alt="Logo Lavin Kost"
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-lg border border-gold-line"
            />
            <div className="min-w-0">
              <p className="truncate font-display text-lg leading-tight font-semibold tracking-tight">
                Lavin Kost Purwokerto
              </p>
              <p className="truncate text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                Inventaris
              </p>
            </div>
          </div>
          <nav className="hidden gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <div className="mt-3 h-px w-24 bg-gold" />
          {subtitle ? <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gold-line bg-card/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="flex flex-col items-center gap-1 py-3 text-[11px] text-muted-foreground transition-colors data-[status=active]:text-gold"
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
