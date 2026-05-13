import { countByCategory, survivalByStage } from "@/lib/data";
import { getPageData } from "@/lib/getPageData";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";
import { StageDonut } from "@/components/charts/StageDonut";
import { SurvivalBoxplot } from "@/components/charts/SurvivalBoxplot";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SeveridadPage({ searchParams }: PageProps) {
  const { patients, options, totalCount, filteredCount, isEmpty } = await getPageData(searchParams);

  return (
    <DashboardShell options={options} totalCount={totalCount} filteredCount={filteredCount}>
      <PageHeader
        eyebrow="Sección 04"
        title="¿Qué tan grave?"
        description="Distribución por etapa del cáncer (0 = inicial, IV = avanzada) y supervivencia asociada a cada nivel de severidad."
      />

      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StageDonut data={countByCategory(patients, "Cancer_Stage")} />
          <SurvivalBoxplot data={survivalByStage(patients)} />
        </div>
      )}
    </DashboardShell>
  );
}

function EmptyState() {
  return (
    <Card className="p-12 text-center text-slate-500 border-0 shadow-sm">
      <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-amber-400" />
      <h2 className="text-lg font-semibold text-slate-700 mb-1">No hay datos con los filtros seleccionados</h2>
      <p className="text-sm">Ajusta los filtros del sidebar.</p>
    </Card>
  );
}
