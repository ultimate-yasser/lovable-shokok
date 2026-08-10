import { openDB, type IDBPDatabase } from "idb";
import type { Account, AppSettings, Operation } from "./types";

const DB_NAME = "shokok";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("accounts")) {
          db.createObjectStore("accounts", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("operations")) {
          const store = db.createObjectStore("operations", { keyPath: "id" });
          store.createIndex("accountId", "accountId");
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings");
        }
      },
    });
  }
  return dbPromise;
}

export async function loadAll(): Promise<{
  accounts: Account[];
  operations: Operation[];
  settings: Partial<AppSettings>;
}> {
  const db = await getDb();
  const [accounts, operations, settings] = await Promise.all([
    db.getAll("accounts") as Promise<Account[]>,
    db.getAll("operations") as Promise<Operation[]>,
    db.get("settings", "app") as Promise<Partial<AppSettings> | undefined>,
  ]);
  return { accounts, operations, settings: settings ?? {} };
}

export async function putAccount(account: Account) {
  (await getDb()).put("accounts", account);
}

export async function deleteAccountRecord(id: string) {
  (await getDb()).delete("accounts", id);
}

export async function putOperation(operation: Operation) {
  (await getDb()).put("operations", operation);
}

export async function deleteOperationRecord(id: string) {
  (await getDb()).delete("operations", id);
}

export async function deleteOperationsByAccount(accountId: string) {
  const db = await getDb();
  const tx = db.transaction("operations", "readwrite");
  const keys = await tx.store.index("accountId").getAllKeys(accountId);
  await Promise.all(keys.map((key) => tx.store.delete(key)));
  await tx.done;
}

export async function saveSettings(settings: AppSettings) {
  (await getDb()).put("settings", settings, "app");
}

export async function replaceAll(accounts: Account[], operations: Operation[]) {
  const db = await getDb();
  const tx = db.transaction(["accounts", "operations"], "readwrite");
  await tx.objectStore("accounts").clear();
  await tx.objectStore("operations").clear();
  for (const account of accounts) tx.objectStore("accounts").put(account);
  for (const operation of operations) tx.objectStore("operations").put(operation);
  await tx.done;
}
