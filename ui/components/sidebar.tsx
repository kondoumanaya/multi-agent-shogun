"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";

type SidebarBadges = {
  dashboardUrgentCount: number;
  commandsPendingCount: number;
  busyAgentsCount: number;
};

type SidebarProps = {
  badges: SidebarBadges;
};

const STORAGE_KEY = "shogun.ui.sidebar.collapsed";

const navGroups = [
  {
    label: "監視",
    items: [
      { href: "/", label: "指揮センター" },
      { href: "/dashboard", label: "ダッシュボード", badgeKey: "dashboardUrgentCount" as const },
      { href: "/tmux", label: "tmux監視" }
    ]
  },
  {
    label: "設定",
    items: [{ href: "/agents/runtime", label: "モデル設定", badgeKey: "busyAgentsCount" as const }]
  },
  {
    label: "指示",
    items: [{ href: "/commands", label: "指示投入", badgeKey: "commandsPendingCount" as const }]
  },
  {
    label: "運用",
    items: [{ href: "/system", label: "システム操作" }]
  }
];

function NavSection({
  label,
  collapsed,
  pathname,
  items,
  badges,
  onNavigate
}: {
  label: string;
  collapsed: boolean;
  pathname: string;
  items: (typeof navGroups)[number]["items"];
  badges: SidebarBadges;
  onNavigate?: () => void;
}) {
  return (
    <section className="space-y-2">
      {!collapsed ? <h3 className="px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</h3> : null}
      <ul className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          const badge = item.badgeKey ? badges[item.badgeKey] : 0;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={clsx(
                  "flex items-center rounded-xl border px-3 py-2 text-sm transition",
                  active
                    ? "border-[var(--accent)] bg-[color:rgba(16,71,84,0.15)] text-[var(--accent)]"
                    : "border-transparent text-slate-700 hover:border-[var(--line)] hover:bg-white/60",
                  collapsed ? "justify-center" : "justify-between"
                )}
              >
                <span className={clsx(collapsed && "sr-only")}>{item.label}</span>
                {item.badgeKey && badge > 0 ? (
                  <span className={clsx("badge", collapsed ? "hidden" : "inline-block text-xs", item.badgeKey === "dashboardUrgentCount" ? "text-[var(--danger)]" : "text-[var(--accent)]")}>
                    {badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function Sidebar({ badges }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(collapsed));
    document.documentElement.style.setProperty("--sidebar-width", collapsed ? "72px" : "280px");
  }, [collapsed]);

  const widthClass = collapsed ? "md:w-[72px]" : "md:w-[280px]";

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-40 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        メニュー
      </button>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/35 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      ) : null}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--line)] bg-[var(--surface)] p-3 backdrop-blur md:translate-x-0",
          widthClass,
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "transition-all duration-300"
        )}
      >
        <div className={clsx("mb-4 flex items-center", collapsed ? "justify-center" : "justify-between")}>
          <div className={clsx("font-semibold tracking-wide", collapsed && "sr-only")}>Shogun Console</div>
          <button
            type="button"
            className="hidden rounded-lg border border-[var(--line)] px-2 py-1 text-xs md:inline-block"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? ">>" : "<<"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-[var(--line)] px-2 py-1 text-xs md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            閉じる
          </button>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto">
          {navGroups.map((group) => (
            <NavSection
              key={group.label}
              label={group.label}
              items={group.items}
              pathname={pathname}
              collapsed={collapsed}
              badges={badges}
              onNavigate={() => setMobileOpen(false)}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}
