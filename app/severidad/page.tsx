import { countByCategory, survivalByStage, survivalHeatmap, correlationMatrix, stageDistByCancer } from "@/lib/data";
import { getPageData } from "@/lib/getPageData";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader, SectionTitle } from "@/components/PageHeader";
import { StageDonut } from "@/components/charts/StageDonut";
import { SurvivalBoxplot } from "@/components/charts/SurvivalBoxplot";
import { SurvivalHeatmap } from "@/components/charts/SurvivalHeatmap";
import { CorrelationMatrix } from "@/components/charts/CorrelationMatrix";
import { StageDistHeatmap } from "@/components/charts/StageDistHeatmap";

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
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StageDonut data={countByCategory(patients, "Cancer_Stage")} />
            <SurvivalBoxplot data={survivalByStage(patients)} />
          </div>

          <div>
            <SectionTitle
              title="¿Cuáles se diagnostican tarde?"
              description="Distribución porcentual de etapas dentro de cada tipo de cáncer. Identifica qué tipos tienden a detectarse en estadios avanzados (III + IV)."
            />
            <StageDistHeatmap data={stageDistByCancer(patients)} />
          </div>

          <div>
            <SectionTitle
              title="Matriz de pronóstico"
              description="Cruce entre tipo de cáncer y etapa, coloreado por años de supervivencia promedio. Identifica de un vistazo qué combinaciones tienen mejor o peor pronóstico."
            />
            <SurvivalHeatmap data={survivalHeatmap(patients)} />
          </div>

          <div>
            <SectionTitle
              title="Correlación entre variables numéricas"
              description="Análisis exploratorio clásico de minería de datos. Identifica qué variables tienden a moverse juntas y cuáles son independientes."
            />
            <CorrelationMatrix data={correlationMatrix(patients)} />
          </div>
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
