import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Account } from "@/lib/types";

export function AccountDialog({
  open,
  onOpenChange,
  account,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account;
}) {
  const { t } = useI18n();
  const { accounts, addAccount, updateAccount } = useStore();
  const [name, setName] = useState("");
  const [starting, setStarting] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(account?.name ?? "");
    setStarting(account?.startingBalance ? String(account.startingBalance) : "");
  }, [open, account]);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(t("nameRequired"));
      return;
    }
    const duplicate = accounts.some(
      (a) => a.id !== account?.id && a.name.trim().toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) {
      toast.error(t("nameDuplicate"));
      return;
    }
    const startingBalance = starting ? Number(starting) : 0;
    if (Number.isNaN(startingBalance)) {
      toast.error(t("startingBalance"));
      return;
    }
    if (account) updateAccount({ ...account, name: trimmed, startingBalance });
    else addAccount(trimmed, startingBalance);
    toast.success(t("saved"));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {account ? t("editAccount") : t("addAccount")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base" htmlFor="acc-name">
              {t("name")}
            </Label>
            <Input
              id="acc-name"
              value={name}
              placeholder={t("namePlaceholder")}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base" htmlFor="acc-balance">
              {t("startingBalance")}{" "}
              <span className="text-sm font-normal text-muted-foreground">({t("optional")})</span>
            </Label>
            <Input
              id="acc-balance"
              type="number"
              inputMode="decimal"
              step="0.01"
              value={starting}
              placeholder="0"
              onChange={(e) => setStarting(e.target.value)}
              className="h-12 text-base"
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
