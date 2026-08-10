import type { ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function PageHeader({
  title,
  subtitle,
  action,
  back,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  back?: boolean;
}) {
  const { dir, t } = useI18n();
  const router = useRouter();
  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.85rem)] backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        {back && (
          <button
            type="button"
            aria-label={t("back")}
            onClick={() => router.history.back()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
          >
            <BackIcon className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold leading-tight">{title}</h1>
          {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}
