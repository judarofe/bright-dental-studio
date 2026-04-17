import { SpecialtyBanner } from "@/components/clinical/workspace/SpecialtyBanner";
import { OdontogramEditor } from "@/components/clinical/OdontogramEditor";
import type { SpecialtyMeta } from "@/lib/clinical/sections";
import type { Odontograma } from "@/data/clinicalTypes";

interface Props {
  odontograma: Odontograma | null | undefined;
  meta: SpecialtyMeta;
}

export function OdontogramaSection({ odontograma, meta }: Props) {
  return (
    <div className="space-y-4">
      <SpecialtyBanner meta={meta} />
      <OdontogramEditor odontograma={odontograma} eventos={odontograma?.eventos ?? []} />
    </div>
  );
}
