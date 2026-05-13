import { statsByCountry } from "@/lib/data";
import { getPageData } from "@/lib/getPageData";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader, SectionTitle } from "@/components/PageHeader";
import { WorldMap } from "@/components/charts/WorldMap";
import { WorldHeatMap } from "@/components/charts/WorldHeatMap";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MapaPage({ searchParams }: PageProps) {
  const { patients, options, totalCount, filteredCount, isEmpty } = await getPageData(searchParams);

  return (
    <DashboardShell options={options} totalCount={totalCount} filteredCount={filteredCount}>
      <PageHeader
        eyebrow="Sección 02"
        title="¿Dónde ocurre?"
        description="Distribución geográfica de los pacientes a nivel mundial. Compara entre la cantidad de casos y el costo de tratamiento por país."
      />

      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          <div>
            <SectionTitle
              title="Mapa de casos por país"
              description="Cada país tiene un color distintivo. Clic para ver estadísticas detalladas."
            />
            <WorldMap data={statsByCountry(patients)} />
          </div>

          <div>
            <SectionTitle
              title="Mapa de calor — costo de tratamiento"
              description="Los países más rojos tienen mayor costo promedio. Los verdes son más económicos."
            />
            <WorldHeatMap data={statsByCountry(patients)} />
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
      <p className="text-sm">Ajusta los filtros del sidebar para ver los mapas.</p>
    </Card>
  );
}
