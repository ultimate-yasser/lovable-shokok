import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatMoney, toDateInputValue } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { signedAmount } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Shokok" },
      {
        name: "description",
        content: "Daily, weekly, monthly and custom-range totals for receivables, payables and net balance.",
      },
      { property: "og:title", content: "Reports — Shokok" },
      {
        property: "og:description",
        content: "Totals for receivables, payables and net balance over any period.",
      },
    ],
  }),
  component: ReportsPage,
});

type Period = "today" | "week" | "month" | "custom";

function rangeFor(period: Period, from: string, to: string) {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (period === "week") start.setDate(start.getDate() - 6);
  if (period === "month") start.setDate(start.getDate() - 29);
  if (period === "custom") {
    const s = new Date(`${from}T00:00:00`);
    const e = new Date(`${to}T23:59:59`);
    return { start: s, end: e };
  }
  return { start, end };
}

function ReportsPage() {
  const { t, lang } = useI18n();
  const { operations, settings } = useStore();
  const [period, setPeriod] = useState<Period>("month");
  const today = toDateInputValue(new Date());
  const monthAgo = toDateInputValue(new Date(Date.now() - 29 * 86400000));
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);

  const { receivable, payable, net, chart } = useMemo(() => {
    const { start, end } = rangeFor(period, from, to);
    const inRange = operations.filter((op) => {
      const d = new Date(op.date);
      return d >= start && d <= end;
    });
    let receivable = 0;
    let payable = 0;
    const perDay = new Map<string, number>();
    for (const op of inRange) {
      const value = signedAmount(op);
      if (value > 0) receivable += value;
      if (value < 0) payable += Math.abs(value);
      const key = op.date.slice(0, 10);
      perDay.set(key, (perDay.get(key) ?? 0) + value);
    }
    const days: { key: string; label: string; net: number }[] = [];
    let running = 0;
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    let guard = 0;
    while (cursor <= end && guard < 400) {
      const key = toDateInputValue(cursor);
      running += perDay.get(key) ?? 0;
      days.push({
        key,
        label: new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
          day: "numeric",
          month: "short",
        }).format(cursor),
        net: Number(running.toFixed(2)),
      });
      cursor.setDate(cursor.getDate() + 1);
      guard += 1;
    }
    return { receivable, payable, net: receivable - payable, chart: days };
  }, [operations, period, from, to, lang]);

  const periods: Period[] = ["today", "week", "month", "custom"];
  const periodLabel = { today: t("today"), week: t("thisWeek"), month: t("thisMonth"), custom: t("custom") };

  return (
    <div className="pb-28">
      <PageHeader title={t("reports")} subtitle={t("chartTitle")} />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="grid grid-cols-4 gap-1 rounded-xl bg-muted p-1">
          {periods.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-lg py-2 text-sm font-bold transition-colors",
                period === p ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {periodLabel[p]}
            </button>
          ))}
        </div>

        {period === "custom" && (
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="space-y-1">
              <Label htmlFor="from">{t("from")}</Label>
              <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="to">{t("to")}</Label>
              <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-11" />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm font-semibold text-muted-foreground">{t("totalReceivable")}</p>
            <p className="text-2xl font-extrabold text-positive">
              {formatMoney(receivable, lang, settings.currency)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm font-semibold text-muted-foreground">{t("totalPayable")}</p>
            <p className="text-2xl font-extrabold text-negative">
              {formatMoney(payable, lang, settings.currency)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm font-semibold text-muted-foreground">{t("net")}</p>
            <p
              className={cn(
                "text-3xl font-extrabold",
                net > 0 ? "text-positive" : net < 0 ? "text-negative" : "text-muted-foreground",
              )}
            >
              {net < 0 ? "-" : ""}
              {formatMoney(net, lang, settings.currency)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="mb-3 text-base font-bold">{t("chartTitle")}</p>
          {chart.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">{t("noChartData")}</p>
          ) : (
            <div className="h-64 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} width={54} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      color: "var(--foreground)",
                    }}
                    labelFormatter={(label) => String(label)}
                    formatter={(value: number) => [formatMoney(value, lang, settings.currency), t("net")]}
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {chart[0] && chart[chart.length - 1] && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {formatDate(chart[0].key, lang)} — {formatDate(chart[chart.length - 1]!.key, lang)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
