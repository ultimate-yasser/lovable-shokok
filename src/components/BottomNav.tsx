import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeftRight, Users, BarChart3, Settings2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", icon: ArrowLeftRight, key: "operations" },
  { to: "/accounts", icon: Users, key: "accounts" },
  { to: "/reports", icon: BarChart3, key: "reports" },
  { to: "/settings", icon: Settings2, key: "settings" },
] as const;

export function BottomNav() {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-stretch">
        {items.map(({ to, icon: Icon, key }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-semibold transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                  active && "bg-accent",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              {t(key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
