import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AccountDialog } from "@/components/AccountDialog";
import { OperationCard } from "@/components/OperationCard";
import { OperationDialog } from "@/components/OperationDialog";
import { PageHeader } from "@/components/PageHeader";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatDate, formatMoney } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { generateAccountReport } from "@/lib/report";
import { useStore } from "@/lib/store";
import { balanceTone } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/accounts/$id")({
  head: () => ({
    meta: [
      { title: "Account details — Shokok" },
      { name: "description", content: "Account balance and full operation history." },
      { property: "og:title", content: "Account details — Shokok" },
      { property: "og:description", content: "Account balance and full operation history." },
    ],
  }),
  component: AccountDetailsPage,
});

const toneText = {
  positive: "text-positive",
  negative: "text-negative",
  neutral: "text-muted-foreground",
};

function AccountDetailsPage() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { accounts, ready, balanceOf, operationsOf, removeAccount, settings } = useStore();
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [alsoOps, setAlsoOps] = useState(true);

  const account = accounts.find((a) => a.id === id);

  if (!account) {
    return (
      <div className="pb-28">
        <PageHeader title={t("accountDetails")} back />
        {ready && <p className="p-8 text-center text-muted-foreground">{t("noAccounts")}</p>}
      </div>
    );
  }

  const balance = balanceOf(account.id);
  const ops = operationsOf(account.id);
  const tone = balanceTone(balance);

  return (
    <div className="pb-32">
      <PageHeader title={account.name} subtitle={t("accountDetails")} back />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-muted-foreground">{t("currentBalance")}</p>
          <p className={cn("mt-1 text-4xl font-extrabold", toneText[tone])}>
            {formatMoney(balance, lang, settings.currency)}
          </p>
          <p className={cn("mt-1 text-base font-bold", toneText[tone])}>
            {tone === "positive" ? t("theyOweUs") : tone === "negative" ? t("weOweThem") : "—"}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-muted p-3">
              <p className="text-muted-foreground">{t("operationsCount")}</p>
              <p className="text-lg font-bold">{ops.length}</p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-muted-foreground">{t("lastOperation")}</p>
              <p className="text-lg font-bold">
                {ops[0] ? formatDate(ops[0].date, lang) : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="h-12 flex-1 text-base font-bold" onClick={() => setAdding(true)}>
            <Plus className="me-1 h-5 w-5" />
            {t("addOperation")}
          </Button>
          <Button variant="outline" className="h-12" onClick={() => setEditing(true)}>
            <Pencil className="h-5 w-5" />
          </Button>
          <Button variant="destructive" className="h-12" onClick={() => setConfirm(true)}>
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>

        <Button
          variant="secondary"
          className="h-12 w-full text-base font-bold"
          onClick={() => {
            const ok = generateAccountReport({
              account,
              operations: ops,
              balance,
              lang,
              currency: settings.currency,
            });
            if (!ok) toast.error(t("printSave"));
          }}
        >
          <FileText className="me-1 h-5 w-5" />
          {t("exportReport")}
        </Button>


        {ops.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            {t("noOperationsYet")}
          </p>
        ) : (
          <div className="space-y-3">
            {ops.map((op) => (
              <OperationCard key={op.id} op={op} hideAccount />
            ))}
          </div>
        )}
      </div>

      <AccountDialog open={editing} onOpenChange={setEditing} account={account} />
      <OperationDialog open={adding} onOpenChange={setAdding} presetAccountId={account.id} />

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteAccountMsg")}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
            <Checkbox
              id="del-ops"
              checked={alsoOps}
              onCheckedChange={(v) => setAlsoOps(v === true)}
            />
            <Label htmlFor="del-ops" className="text-sm font-semibold">
              {t("deleteAccountOps")}
            </Label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                removeAccount(account.id, alsoOps);
                toast.success(t("deleted"));
                navigate({ to: "/accounts" });
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
