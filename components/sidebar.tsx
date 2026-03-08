"use client";

import { useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calculator,
  FileClock,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Receipt,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const links: Array<{ href: Route; label: string; icon: LucideIcon }> = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/procedures/new", label: "Nova Precificação", icon: PlusCircle },
  { href: "/fixed-costs", label: "Custos Fixos", icon: WalletCards },
  { href: "/last-purchases", label: "Últimas Compras", icon: Receipt },
  { href: "/history", label: "Histórico", icon: FileClock },
  { href: "/profile", label: "Informações do Usuário", icon: UserRound },
];

function Brand() {
  return (
    <>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
          display: "grid",
          placeItems: "center",
          color: "#06111b",
        }}
      >
        <Calculator size={20} />
      </div>
      <div>
        <div style={{ fontWeight: 800 }}>Precifica Serv Pro</div>
        <div className="muted" style={{ fontSize: 13 }}>
          Precificação em nuvem
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const onLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const onNavigate = () => setMobileOpen(false);

  const content = (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Brand />
      </div>
      <nav className="grid" style={{ gap: 10 }}>
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className="btn"
              style={{
                justifyContent: "flex-start",
                background: active ? "rgba(103, 232, 179, 0.14)" : "rgba(255,255,255,0.03)",
                borderColor: active ? "rgba(103, 232, 179, 0.34)" : "var(--card-border)",
                color: active ? "#d9fffb" : "var(--text)",
              }}
            >
              <Icon size={18} /> {link.label}
            </Link>
          );
        })}
      </nav>
      <div style={{ marginTop: 24 }}>
        <button className="btn btn-secondary" onClick={onLogout} style={{ width: "100%" }}>
          <LogOut size={16} /> Sair
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="mobile-topbar glass">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Brand />
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: "10px 12px" }}
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={18} /> Menu
        </button>
      </div>

      {mobileOpen ? (
        <div className="mobile-drawer-backdrop" onClick={() => setMobileOpen(false)}>
          <aside className="glass sidebar mobile-drawer" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ alignSelf: "flex-end", padding: "10px 12px", marginBottom: 10 }}
              onClick={() => setMobileOpen(false)}
            >
              <X size={16} /> Fechar
            </button>
            {content}
          </aside>
        </div>
      ) : null}

      <aside className="glass sidebar sidebar-desktop">{content}</aside>
    </>
  );
}
