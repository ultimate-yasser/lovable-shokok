import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AccountDialog } from "@/components/AccountDialog";
import { Fab } from "@/components/Fab";
import { PageHeader } from "@/components/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, formatMoney } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { balanceTone } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/accounts/")({
  head: () => ({
    meta: [
      { title: "Accounts — Shokok" },
      {
        name: "description",
        content: "All customer, supplier and trader accounts with their current balances.",
      },
      { property: "og:title", content: "Accounts — Shokok" },
      {
        property: "og:description",
        content: "All customer, supplier and trader accounts with their current balances.",
      },
    ],
  }),
  component: AccountsPage,
});

type SortKey = "recent" | "balance" | "az" | "za";

const toneText = {
  positive: "text-positive",
  negative: "text-negative",
  neutral: "text-muted-foreground",
};
const toneStripe = {
  positive: "bg-positive",
  negative: "bg-negative",
  neutral: "bg-neutral",
};

function AccountsPage() {
  const { t, lang } = useI18n();
  const { accounts, ready, balanceOf, lastOperationDate, settings } = useStore();
  const [sort, setSort] = useState<SortKey>("recent");
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    const rows = accounts.map((account) => ({
      account,
      balance: balanceOf(account.id),
      last: lastOperationDate(account.id),
    }));
    switch (sort) {
      case "balance":
        return rows.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
      case "az":
        return rows.sort((a, b) => a.account.name.localeCompare(b.account.name));
      case "za":
        return rows.sort((a, b) => b.account.name.localeCompare(a.account.name));
      default:
        return rows.sort((a, b) => (b.last ?? "").localeCompare(a.last ?? ""));
    }
  }, [accounts, sort, balanceOf, lastOperationDate]);

  return (
    <div className="pb-32">
      <PageHeader
        title={t("accounts")}
        subtitle={`${accounts.length} ${t("accountsWord")}`}
        action={
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-10 w-auto gap-2 text-sm font-semibold">
              <SelectValue placeholder={t("sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t("sortRecent")}</SelectItem>
              <SelectItem value="balance">{t("sortBalance")}</SelectItem>
              <SelectItem value="az">{t("sortAZ")}</SelectItem>
              <SelectItem value="za">{t("sortZA")}</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="mx-auto max-w-2xl space-y-3 p-4">
        {ready && list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-lg font-bold">{t("noAccounts")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("noAccountsHint")}</p>
          </div>
        )}

        {list.map(({ account, balance, last }) => {
          const tone = balanceTone(balance);
          return (
            <Link
              key={account.id}
              to="/accounts/$id"
              params={{ id: account.id }}
              className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors active:bg-accent/40"
            >
              <span className={cn("absolute inset-y-0 start-0 w-1.5", toneStripe[tone])} />
              <div className="min-w-0 flex-1 ps-2">
                <p className="truncate text-base font-bold">{account.name}</p>
                <p className="text-sm text-muted-foreground">
                  {last ? `${t("lastOperation")}: ${formatDate(last, lang)}` : t("noOperationsYet")}
                </p>
              </div>
              <div className={cn("shrink-0 text-end", toneText[tone])}>
                <p className="text-lg font-extrabold">
                  {formatMoney(balance, lang, settings.currency)}
                </p>
                <p className="text-xs font-semibold opacity-80">
                  {tone === "positive"
                    ? t("theyOweUs")
                    : tone === "negative"
                      ? t("weOweThem")
                      : t("balance")}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <Fab label={t("addAccount")} onClick={() => setOpen(true)} />
      <AccountDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
