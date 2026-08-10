import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as db from "./db";
import { I18nContext, strings, type Lang, type StringKey } from "./i18n";
import type { Account, AppSettings, Operation } from "./types";
import { signedAmount } from "./types";

interface StoreValue {
  ready: boolean;
  accounts: Account[];
  operations: Operation[];
  settings: AppSettings;
  balanceOf: (accountId: string) => number;
  lastOperationDate: (accountId: string) => string | null;
  operationsOf: (accountId: string) => Operation[];
  accountName: (accountId: string) => string;
  addAccount: (name: string, startingBalance: number) => Account;
  updateAccount: (account: Account) => void;
  removeAccount: (id: string, withOperations: boolean) => void;
  addOperation: (op: Omit<Operation, "id" | "createdAt">) => void;
  updateOperation: (op: Operation) => void;
  removeOperation: (id: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  importData: (accounts: Account[], operations: Operation[]) => Promise<void>;
}

const defaultSettings: AppSettings = { language: "ar", theme: "system", currency: "ج.م" };

const StoreContext = createContext<StoreValue | null>(null);

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside AppProvider");
  return ctx;
};

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    let active = true;
    db.loadAll()
      .then(({ accounts, operations, settings }) => {
        if (!active) return;
        setAccounts(accounts);
        setOperations(operations);
        setSettings({ ...defaultSettings, ...settings });
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => {
      active = false;
    };
  }, []);

  const lang = settings.language;
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = settings.theme === "dark" || (settings.theme === "system" && media.matches);
      root.classList.toggle("dark", dark);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [settings.theme]);

  const balances = useMemo(() => {
    const map = new Map<string, number>();
    for (const account of accounts) map.set(account.id, account.startingBalance);
    for (const op of operations) {
      map.set(op.accountId, (map.get(op.accountId) ?? 0) + signedAmount(op));
    }
    return map;
  }, [accounts, operations]);

  const byAccount = useMemo(() => {
    const map = new Map<string, Operation[]>();
    for (const op of operations) {
      const list = map.get(op.accountId);
      if (list) list.push(op);
      else map.set(op.accountId, [op]);
    }
    for (const list of map.values()) {
      list.sort((a, b) => b.date.localeCompare(a.date));
    }
    return map;
  }, [operations]);

  const value = useMemo<StoreValue>(() => {
    const nameMap = new Map(accounts.map((a) => [a.id, a.name]));
    return {
      ready,
      accounts,
      operations,
      settings,
      balanceOf: (id) => balances.get(id) ?? 0,
      operationsOf: (id) => byAccount.get(id) ?? [],
      lastOperationDate: (id) => byAccount.get(id)?.[0]?.date ?? null,
      accountName: (id) => nameMap.get(id) ?? "—",
      addAccount: (name, startingBalance) => {
        const account: Account = {
          id: newId(),
          name: name.trim(),
          startingBalance,
          createdAt: new Date().toISOString(),
        };
        setAccounts((prev) => [...prev, account]);
        void db.putAccount(account);
        return account;
      },
      updateAccount: (account) => {
        setAccounts((prev) => prev.map((a) => (a.id === account.id ? account : a)));
        void db.putAccount(account);
      },
      removeAccount: (id, withOperations) => {
        setAccounts((prev) => prev.filter((a) => a.id !== id));
        void db.deleteAccountRecord(id);
        if (withOperations) {
          setOperations((prev) => prev.filter((o) => o.accountId !== id));
          void db.deleteOperationsByAccount(id);
        }
      },
      addOperation: (op) => {
        const operation: Operation = { ...op, id: newId(), createdAt: new Date().toISOString() };
        setOperations((prev) => [...prev, operation]);
        void db.putOperation(operation);
      },
      updateOperation: (op) => {
        setOperations((prev) => prev.map((o) => (o.id === op.id ? op : o)));
        void db.putOperation(op);
      },
      removeOperation: (id) => {
        setOperations((prev) => prev.filter((o) => o.id !== id));
        void db.deleteOperationRecord(id);
      },
      updateSettings: (patch) => {
        setSettings((prev) => {
          const next = { ...prev, ...patch };
          void db.saveSettings(next);
          return next;
        });
      },
      importData: async (nextAccounts, nextOperations) => {
        await db.replaceAll(nextAccounts, nextOperations);
        setAccounts(nextAccounts);
        setOperations(nextOperations);
      },
    };
  }, [ready, accounts, operations, settings, balances, byAccount]);

  const i18n = useMemo(
    () => ({
      lang: lang as Lang,
      dir: dir as "rtl" | "ltr",
      t: (key: StringKey) => strings[lang][key],
      setLang: (next: Lang) => value.updateSettings({ language: next }),
    }),
    [lang, dir, value],
  );

  const setThemeClassEarly = useCallback(() => {}, []);
  void setThemeClassEarly;

  return (
    <StoreContext.Provider value={value}>
      <I18nContext.Provider value={i18n}>{children}</I18nContext.Provider>
    </StoreContext.Provider>
  );
}
