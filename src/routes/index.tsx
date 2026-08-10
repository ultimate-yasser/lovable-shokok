import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Fab } from "@/components/Fab";
import { OperationCard } from "@/components/OperationCard";
import { OperationDialog } from "@/components/OperationDialog";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shokok — Shop Debt & Account Manager" },
      {
        name: "description",
        content:
          "Track what customers owe you and what you owe suppliers. Offline-first debt and account manager for local shops, in Arabic and English.",
      },
      { property: "og:title", content: "Shokok — Shop Debt & Account Manager" },
      {
        property: "og:description",
        content: "Offline-first debt and account manager for local shops, in Arabic and English.",
      },
    ],
  }),
  component: OperationsPage,
});

function OperationsPage() {
  const { t, lang } = useI18n();
  const { operations, ready, accountName } = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const sorted = [...operations].sort((a, b) => b.date.localeCompare(a.date));
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (op) =>
        accountName(op.accountId).toLowerCase().includes(q) ||
        op.details.toLowerCase().includes(q),
    );
  }, [operations, query, accountName]);

  return (
    <div className="pb-32">
      <PageHeader title={t("operations")} subtitle={t("tagline")} />
      <div className="mx-auto max-w-2xl space-y-3 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchOperations")}
            className="h-12 ps-9 text-base"
            dir={lang === "ar" ? "rtl" : "ltr"}
          />
        </div>

        {ready && list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-lg font-bold">{t("noOperations")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("noOperationsHint")}</p>
          </div>
        )}

        {list.map((op) => (
          <OperationCard key={op.id} op={op} />
        ))}
      </div>

      <Fab label={t("addOperation")} onClick={() => setOpen(true)} />
      <OperationDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
