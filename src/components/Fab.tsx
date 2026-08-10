import { Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Fab({ label, onClick }: { label: string; onClick: () => void }) {
  const { dir } = useI18n();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95",
        dir === "rtl" ? "left-4" : "right-4",
      )}
    >
      <Plus className="h-6 w-6" />
      <span className="hidden xs:inline sm:inline">{label}</span>
    </button>
  );
}
