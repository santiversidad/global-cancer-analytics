import { countByCategory, countByYearAndType, riskFactorsByCancerType } from "@/lib/data";
import { getPageData } from "@/lib/getPageData";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader, SectionTitle } from "@/components/PageHeader";
import { CancerTypeBar } from "@/components/charts/CancerTypeBar";
import { YearlyTrend } from "@/components/charts/YearlyTrend";
import { RiskFactorsRadar } from "@/components/charts/RiskFactorsRadar";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TendenciasPage({ searchParams }: PageProps) {
  const { patients, options, totalCount, filteredCount, isEmpty } = await getPageData(searchParams);

  return (
    <DashboardShell options={options} totalCount={totalCount} filteredCount={filteredCount}>
      <PageHeader
        eyebrow="Sección 03"
        title="Tipos y tendencias"
        description="¿Qué tipos de cáncer son más frecuentes y cómo evolucionan los casos año tras año?"
      />

      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CancerTypeBar data={countByCategory(patients, "Cancer_Type")} />
            <YearlyTrend data={countByYearAndType(patients)} />
          </div>

          <div>
            <SectionTitle
              title="Perfil de exposición a factores de riesgo"
              description="Compara cómo varían los niveles de tabaco, alcohol, contaminación, obesidad y riesgo genético entre los pacientes de cada tipo de cáncer."
            />
            <RiskFactorsRadar data={riskFactorsByCancerType(patients)} />
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
