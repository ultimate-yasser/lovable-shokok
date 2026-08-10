import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Account, Operation } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Shokok" },
      {
        name: "description",
        content: "Language, theme, currency and backup settings for your shop ledger.",
      },
      { property: "og:title", content: "Settings — Shokok" },
      {
        property: "og:description",
        content: "Language, theme, currency and backup settings for your shop ledger.",
      },
    ],
  }),
  component: SettingsPage,
});

function OptionRow({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-1 rounded-xl bg-muted p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-lg py-2.5 text-sm font-bold transition-colors",
            value === option.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SettingsPage() {
  const { t } = useI18n();
  const { settings, updateSettings, accounts, operations, importData } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ accounts: Account[]; operations: Operation[] } | null>(
    null,
  );

  const exportData = () => {
    const payload = { version: 1, exportedAt: new Date().toISOString(), accounts, operations };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shokok-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t("exported"));
  };

  const pickFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed.accounts) || !Array.isArray(parsed.operations)) {
        throw new Error("invalid");
      }
      setPending({ accounts: parsed.accounts, operations: parsed.operations });
    } catch {
      toast.error(t("importFailed"));
    }
  };

  return (
    <div className="pb-28">
      <PageHeader title={t("settings")} subtitle={t("appName")} />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <section className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-base font-bold">{t("language")}</h2>
          <OptionRow
            value={settings.language}
            onChange={(v) => updateSettings({ language: v as "ar" | "en" })}
            options={[
              { value: "ar", label: t("arabic") },
              { value: "en", label: t("english") },
            ]}
          />
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-base font-bold">{t("theme")}</h2>
          <OptionRow
            value={settings.theme}
            onChange={(v) => updateSettings({ theme: v as "system" | "light" | "dark" })}
            options={[
              { value: "system", label: t("system") },
              { value: "light", label: t("light") },
              { value: "dark", label: t("dark") },
            ]}
          />
        </section>

        <section className="space-y-2 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <Label htmlFor="currency" className="text-base font-bold">
            {t("currency")}
          </Label>
          <Input
            id="currency"
            value={settings.currency}
            onChange={(e) => updateSettings({ currency: e.target.value })}
            className="h-12 text-base"
          />
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-base font-bold">{t("dataManagement")}</h2>
          <Button variant="outline" className="h-14 w-full justify-start text-base" onClick={exportData}>
            <Download className="me-3 h-5 w-5" />
            <span className="text-start">
              <span className="block font-bold">{t("exportData")}</span>
              <span className="block text-xs font-normal text-muted-foreground">
                {t("exportHint")}
              </span>
            </span>
          </Button>
          <Button
            variant="outline"
            className="h-14 w-full justify-start text-base"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="me-3 h-5 w-5" />
            <span className="text-start">
              <span className="block font-bold">{t("importData")}</span>
              <span className="block text-xs font-normal text-muted-foreground">
                {t("importHint")}
              </span>
            </span>
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void pickFile(file);
              e.target.value = "";
            }}
          />
          <p className="pt-1 text-sm text-muted-foreground">{t("offlineNote")}</p>
        </section>
      </div>

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("importData")}</AlertDialogTitle>
            <AlertDialogDescription>{t("importWarning")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pending) return;
                await importData(pending.accounts, pending.operations);
                setPending(null);
                toast.success(t("imported"));
              }}
            >
              {t("save")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
