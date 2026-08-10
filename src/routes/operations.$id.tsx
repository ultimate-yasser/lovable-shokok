import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { OperationDialog } from "@/components/OperationDialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDateTime, formatMoney } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { balanceTone, kindTone } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/operations/$id")({
  head: () => ({
    meta: [
      { title: "Operation details — Shokok" },
      { name: "description", content: "View, edit or delete a recorded shop operation." },
      { property: "og:title", content: "Operation details — Shokok" },
      { property: "og:description", content: "View, edit or delete a recorded shop operation." },
    ],
  }),
  component: OperationDetailsPage,
});

const toneText = {
  positive: "text-positive",
  negative: "text-negative",
  neutral: "text-muted-foreground",
};

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      <span className={cn("text-base font-bold text-end", className)}>{value}</span>
    </div>
  );
}

function OperationDetailsPage() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { operations, ready, accountName, balanceOf, removeOperation, settings } = useStore();
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const op = operations.find((o) => o.id === id);

  if (!op) {
    return (
      <div className="pb-28">
        <PageHeader title={t("operationDetails")} back />
        {ready && (
          <p className="p-8 text-center text-muted-foreground">{t("noOperationsYet")}</p>
        )}
      </div>
    );
  }

  const tone = kindTone(op.kind);
  const balance = balanceOf(op.accountId);

  return (
    <div className="pb-28">
      <PageHeader title={t("operationDetails")} subtitle={accountName(op.accountId)} back />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <p className={cn("text-4xl font-extrabold", toneText[tone])}>
            {op.kind === "undetermined" || op.amount == null
              ? t("undetermined")
              : formatMoney(op.amount, lang, settings.currency)}
          </p>
          <p className={cn("mt-2 text-base font-bold", toneText[tone])}>
            {op.kind === "receivable"
              ? t("theyOweUs")
              : op.kind === "payable"
                ? t("weOweThem")
                : t("undetermined")}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card px-4 shadow-sm">
          <Row label={t("account")} value={accountName(op.accountId)} />
          <Row
            label={t("accountBalance")}
            value={formatMoney(balance, lang, settings.currency)}
            className={toneText[balanceTone(balance)]}
          />
          <Row label={t("date")} value={formatDateTime(op.date, lang)} />
        </div>

        {op.details.trim() && (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="mb-2 text-sm font-semibold text-muted-foreground">{t("details")}</p>
            <p className="whitespace-pre-wrap text-base leading-relaxed">{op.details}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="h-12 flex-1 text-base" onClick={() => setEditing(true)}>
            <Pencil className="me-2 h-4 w-4" />
            {t("edit")}
          </Button>
          <Button variant="destructive" className="h-12 flex-1 text-base" onClick={() => setConfirm(true)}>
            <Trash2 className="me-2 h-4 w-4" />
            {t("delete")}
          </Button>
        </div>
      </div>

      <OperationDialog open={editing} onOpenChange={setEditing} operation={op} />

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteOperationMsg")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                removeOperation(op.id);
                toast.success(t("deleted"));
                navigate({ to: "/" });
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
