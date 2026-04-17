import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ClinicalSectionDef, SpecialtyMeta } from "@/lib/clinical/sections";

interface Props {
  baseSections: ClinicalSectionDef[];
  specialtySections: ClinicalSectionDef[];
  meta: SpecialtyMeta;
  activeSection: string;
  onSelect: (id: string) => void;
}

/**
 * Two-flavor section navigation:
 *  - Desktop: vertical sidebar grouped by "base" + specialty.
 *  - Mobile: horizontally-scrollable chip rows mirroring the same groups.
 */
export function SectionNav({ baseSections, specialtySections, meta, activeSection, onSelect }: Props) {
  const SpecIcon = meta.icon;

  const renderDesktopItem = (s: ClinicalSectionDef) => (
    <button
      key={s.id}
      onClick={() => onSelect(s.id)}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left",
        activeSection === s.id
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      <s.icon className="h-3.5 w-3.5 shrink-0" />
      {s.label}
    </button>
  );

  return (
    <>
      {/* Desktop nav */}
      <Card className="border-0 shadow-sm shrink-0 hidden md:block w-56">
        <CardContent className="p-2">
          <nav className="space-y-0.5">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 px-3 pt-2 pb-1 font-semibold">
              Historia clínica base
            </p>
            {baseSections.map(renderDesktopItem)}

            {specialtySections.length > 0 && (
              <>
                <Separator className="my-2" />
                <div className="flex items-center gap-1.5 px-3 pt-1 pb-1">
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-semibold flex items-center gap-1.5">
                    <SpecIcon className="h-3 w-3" /> {meta.label}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn("text-[8px] h-3.5 px-1 rounded-full border-0", meta.color, meta.textColor)}
                  >
                    Activa
                  </Badge>
                </div>
                {specialtySections.map(renderDesktopItem)}
              </>
            )}
          </nav>
        </CardContent>
      </Card>

      {/* Mobile chips */}
      <div className="md:hidden w-full mb-2">
        <div className="space-y-2">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-1 px-1">
              Historia clínica base
            </p>
            <div className="flex overflow-x-auto gap-1.5 pb-1 -mx-1 px-1">
              {baseSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelect(s.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors",
                    activeSection === s.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-muted-foreground"
                  )}
                >
                  <s.icon className="h-3 w-3" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {specialtySections.length > 0 && (
            <div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-1 px-1 flex items-center gap-1">
                <SpecIcon className="h-3 w-3" /> {meta.label}
              </p>
              <div className="flex overflow-x-auto gap-1.5 pb-1 -mx-1 px-1">
                {specialtySections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSelect(s.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors",
                      activeSection === s.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    <s.icon className="h-3 w-3" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
