import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { formatDate, formatMoney } from "@/lib/format";
import { kindTone, type Operation } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const toneStripe = {
  positive: "bg-positive",
  negative: "bg-negative",
  neutral: "bg-neutral",
};

const toneText = {
  positive: "text-positive",
  negative: "text-negative",
  neutral: "text-muted-foreground",
};

export function OperationCard({ op, hideAccount }: { op: Operation; hideAccount?: boolean }) {
  const { t, lang } = useI18n();
  const { accountName, settings } = useStore();
  const tone = kindTone(op.kind);

  return (
    <Link
      to="/operations/$id"
      params={{ id: op.id }}
      className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors active:bg-accent/40"
    >
      <span className={cn("absolute inset-y-0 start-0 w-1.5", toneStripe[tone])} />
      <div className="min-w-0 flex-1 ps-2">
        {!hideAccount && (
          <p className="truncate text-base font-bold">{accountName(op.accountId)}</p>
        )}
        <p className="text-sm text-muted-foreground">{formatDate(op.date, lang)}</p>
        {op.details.trim() && (
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{op.details}</p>
        )}
      </div>
      <div className={cn("shrink-0 text-end", toneText[tone])}>
        <p className="text-lg font-extrabold">
          {op.kind === "undetermined" || op.amount == null
            ? t("undetermined")
            : formatMoney(op.amount, lang, settings.currency)}
        </p>
        <p className="text-xs font-semibold opacity-80">
          {op.kind === "receivable"
            ? t("theyOweUs")
            : op.kind === "payable"
              ? t("weOweThem")
              : t("amount")}
        </p>
      </div>
    </Link>
  );
}
