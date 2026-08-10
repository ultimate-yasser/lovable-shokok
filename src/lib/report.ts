import { formatDate, formatDateTime, formatMoney } from "./format";
import { strings, type Lang } from "./i18n";
import type { Account, Operation } from "./types";
import { signedAmount } from "./types";

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );

export function generateAccountReport({
  account,
  operations,
  balance,
  lang,
  currency,
}: {
  account: Account;
  operations: Operation[];
  balance: number;
  lang: Lang;
  currency: string;
}) {
  const t = (key: keyof (typeof strings)["en"]) => strings[lang][key];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const sorted = [...operations].sort((a, b) => a.date.localeCompare(b.date));

  let receivable = 0;
  let payable = 0;
  let running = account.startingBalance;

  const rows = sorted
    .map((op, index) => {
      const signed = signedAmount(op);
      if (signed > 0) receivable += signed;
      if (signed < 0) payable += -signed;
      running += signed;
      const kindLabel =
        op.kind === "receivable"
          ? t("theyOweUs")
          : op.kind === "payable"
            ? t("weOweThem")
            : t("undetermined");
      return `<tr>
        <td class="num">${index + 1}</td>
        <td>${escape(formatDate(op.date, lang))}</td>
        <td>${escape(kindLabel)}</td>
        <td>${escape(op.details || "—")}</td>
        <td class="num">${op.amount == null ? "—" : escape(formatMoney(op.amount, lang, currency))}</td>
        <td class="num">${escape(formatMoney(running, lang, currency))}</td>
      </tr>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8" />
<title>${escape(`${t("accountStatement")} - ${account.name}`)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet" />
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: Cairo, system-ui, sans-serif; color: #111827; margin: 0; }
  h1 { font-size: 20px; margin: 0; }
  .head { display: flex; justify-content: space-between; align-items: flex-start;
    border-bottom: 3px solid #1f8f86; padding-bottom: 10px; margin-bottom: 14px; }
  .muted { color: #6b7280; font-size: 12px; margin-top: 4px; }
  .cards { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
  .card { flex: 1 1 120px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px 10px; }
  .card p { margin: 0; }
  .card .label { font-size: 11px; color: #6b7280; }
  .card .value { font-size: 15px; font-weight: 800; margin-top: 2px; }
  .pos { color: #0f766e; } .neg { color: #b91c1c; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: ${dir === "rtl" ? "right" : "left"}; vertical-align: top; }
  th { background: #1f8f86; color: #fff; font-weight: 700; }
  tbody tr:nth-child(even) { background: #f6faf8; }
  td.num { white-space: nowrap; }
  .empty { padding: 24px; text-align: center; color: #6b7280; border: 1px dashed #d1d5db; border-radius: 10px; }
  .foot { margin-top: 16px; font-size: 11px; color: #6b7280; text-align: center; }
</style>
</head>
<body>
  <div class="head">
    <div>
      <h1>${escape(account.name)}</h1>
      <p class="muted">${escape(t("accountStatement"))} — ${escape(t("appName"))}</p>
    </div>
    <p class="muted">${escape(t("reportGenerated"))}: ${escape(formatDateTime(new Date().toISOString(), lang))}</p>
  </div>
  <div class="cards">
    <div class="card"><p class="label">${escape(t("startingBalance"))}</p><p class="value">${escape(formatMoney(account.startingBalance, lang, currency))}</p></div>
    <div class="card"><p class="label">${escape(t("totalReceivable"))}</p><p class="value pos">${escape(formatMoney(receivable, lang, currency))}</p></div>
    <div class="card"><p class="label">${escape(t("totalPayable"))}</p><p class="value neg">${escape(formatMoney(payable, lang, currency))}</p></div>
    <div class="card"><p class="label">${escape(t("currentBalance"))}</p><p class="value ${balance < 0 ? "neg" : "pos"}">${escape(formatMoney(balance, lang, currency))} ${escape(balance > 0 ? t("theyOweUs") : balance < 0 ? t("weOweThem") : "")}</p></div>
  </div>
  ${
    sorted.length === 0
      ? `<p class="empty">${escape(t("noOperationsYet"))}</p>`
      : `<table>
    <thead><tr>
      <th>${escape(t("serialNo"))}</th>
      <th>${escape(t("date"))}</th>
      <th>${escape(t("operationType"))}</th>
      <th>${escape(t("details"))}</th>
      <th>${escape(t("amount"))}</th>
      <th>${escape(t("balance"))}</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`
  }
  <p class="foot">${escape(t("appName"))} — ${escape(t("tagline"))}</p>
  <script>
    window.addEventListener("load", function () {
      setTimeout(function () { window.focus(); window.print(); }, 400);
    });
  <\/script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  return true;
}
