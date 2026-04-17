import { cn } from "@/lib/utils";
import type { SpecialtyMeta } from "@/lib/clinical/sections";

/** Visual banner shown at the top of specialty-specific sections. */
export function SpecialtyBanner({ meta }: { meta: SpecialtyMeta }) {
  const Icon = meta.icon;
  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-xl border",
      meta.color, meta.borderColor
    )}>
      <Icon className={cn("h-4 w-4", meta.textColor)} />
      <span className={cn("text-xs font-semibold", meta.textColor)}>
        Sección específica de {meta.label}
      </span>
    </div>
  );
}
