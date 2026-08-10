import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AccountPicker } from "@/components/AccountPicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toLocalInputValue } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Operation, OperationKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const kinds: OperationKind[] = ["receivable", "payable", "undetermined"];

const kindClass: Record<OperationKind, string> = {
  receivable: "bg-positive text-positive-foreground",
  payable: "bg-negative text-negative-foreground",
  undetermined: "bg-neutral text-neutral-foreground",
};

export function OperationDialog({
  open,
  onOpenChange,
  operation,
  presetAccountId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation?: Operation;
  presetAccountId?: string;
}) {
  const { t } = useI18n();
  const { addOperation, updateOperation } = useStore();

  const [accountId, setAccountId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [kind, setKind] = useState<OperationKind>("receivable");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (!open) return;
    setAccountId(operation?.accountId ?? presetAccountId ?? null);
    setDate(toLocalInputValue(operation?.date ?? new Date().toISOString()));
    setKind(operation?.kind ?? "receivable");
    setAmount(operation?.amount != null ? String(operation.amount) : "");
    setDetails(operation?.details ?? "");
  }, [open, operation, presetAccountId]);

  const submit = () => {
    if (!accountId) {
      toast.error(t("selectAccount"));
      return;
    }
    const numeric = Number(amount);
    const value = kind === "undetermined" || !amount ? null : Math.abs(numeric);
    if (kind !== "undetermined" && (value == null || Number.isNaN(value))) {
      toast.error(t("amount"));
      return;
    }
    const payload = {
      accountId,
      kind,
      amount: value,
      date: new Date(date).toISOString(),
      details: details.trim(),
    };
    if (operation) updateOperation({ ...operation, ...payload });
    else addOperation(payload);
    toast.success(t("saved"));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {operation ? t("editOperation") : t("addOperation")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base">{t("account")}</Label>
            <AccountPicker value={accountId} onChange={setAccountId} />
          </div>

          <div className="space-y-2">
            <Label className="text-base" htmlFor="op-date">
              {t("date")}
            </Label>
            <Input
              id="op-date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base" htmlFor="op-amount">
              {t("amount")}
            </Label>
            <Input
              id="op-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              disabled={kind === "undetermined"}
              value={kind === "undetermined" ? "" : amount}
              placeholder={kind === "undetermined" ? t("undetermined") : "0"}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 text-lg font-bold"
            />
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted p-1">
              {kinds.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setKind(option)}
                  className={cn(
                    "rounded-lg py-2 text-sm font-bold transition-colors",
                    kind === option ? kindClass[option] : "text-muted-foreground",
                  )}
                >
                  {option === "receivable"
                    ? t("theyOweUs")
                    : option === "payable"
                      ? t("weOweThem")
                      : t("undetermined")}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base" htmlFor="op-details">
              {t("details")}
            </Label>
            <Textarea
              id="op-details"
              rows={4}
              value={details}
              placeholder={t("detailsPlaceholder")}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-28 text-base"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" className="h-12 flex-1 text-base" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button className="h-12 flex-1 text-base font-bold" onClick={submit}>
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
