import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AccountPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string) => void;
}) {
  const { t } = useI18n();
  const { accounts, addAccount } = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = accounts.find((a) => a.id === value);
  const sorted = useMemo(() => [...accounts].sort((a, b) => a.name.localeCompare(b.name)), [
    accounts,
  ]);
  const canCreate =
    query.trim().length > 0 &&
    !accounts.some((a) => a.name.trim().toLowerCase() === query.trim().toLowerCase());

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="h-12 w-full justify-between text-base font-semibold"
        >
          <span className={cn(!selected && "text-muted-foreground font-normal")}>
            {selected ? selected.name : t("selectAccount")}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter>
          <CommandInput placeholder={t("searchAccount")} value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{t("noResults")}</CommandEmpty>
            <CommandGroup>
              {sorted.map((account) => (
                <CommandItem
                  key={account.id}
                  value={account.name}
                  onSelect={() => {
                    onChange(account.id);
                    setOpen(false);
                  }}
                  className="text-base"
                >
                  <Check
                    className={cn(
                      "me-2 h-4 w-4",
                      account.id === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {account.name}
                </CommandItem>
              ))}
              {canCreate && (
                <CommandItem
                  value={`__create__${query}`}
                  onSelect={() => {
                    const created = addAccount(query, 0);
                    onChange(created.id);
                    setOpen(false);
                  }}
                  className="text-base"
                >
                  <Plus className="me-2 h-4 w-4" />
                  {t("addAccount")}: {query.trim()}
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
