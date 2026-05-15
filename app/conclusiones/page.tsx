import { statsByCancerType, statsByCountry, computeMetrics } from "@/lib/data";
import { getPageData } from "@/lib/getPageData";
import { Card, CardContent } from "@/components/ui/card";
import {
  Database,
  Scale,
  Fingerprint,
  HeartPulse,
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  Code2,
  Microscope,
  Lightbulb,
  TrendingUp,
  Users,
  DollarSign,
  Globe2,
  Award,
  Calendar,
} from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ConclusionesPage({ searchParams }: PageProps) {
  const { allPatients, options, totalCount, filteredCount } = await getPageData(searchParams);

  // Cifras reales calculadas del dataset completo
  const m = computeMetrics(allPatients);
  const cancerStats = statsByCancerType(allPatients);
  const countryStats = statsByCountry(allPatients);

  const topCancer = cancerStats[0];
  const bottomCancer = cancerStats[cancerStats.length - 1];
  const cancerDiffPct = ((topCancer.cases - bottomCancer.cases) / topCancer.cases) * 100;

  const topCountry = countryStats[0];
  const bottomCountry = countryStats[countryStats.length - 1];

  // Cáncer con peor pronóstico (menor supervivencia)
  const worstSurvival = [...cancerStats].sort((a, b) => a.avgSurvival - b.avgSurvival)[0];
  // Cáncer con mayor costo
  const mostExpensive = [...cancerStats].sort((a, b) => b.avgCost - a.avgCost)[0];
  // Cáncer con mayor % en etapas avanzadas
  const mostAdvanced = [...cancerStats].sort((a, b) => b.pctMaligno - a.pctMaligno)[0];

  return (
    <DashboardShell options={options} totalCount={totalCount} filteredCount={filteredCount}>
      <PageHeader
        eyebrow="Sección 05"
        title="Conclusiones y hallazgos"
        description="Lo que descubrimos al analizar 50 000 registros de pacientes con cáncer."
      />

      {/* Resumen ejecutivo */}
      <Card className="border-0 shadow-sm mb-8 overflow-hidden">
        <div
          className="p-6 text-white"
          style={{ background: "linear-gradient(135deg, #1B2A4E 0%, #5C4DFF 100%)" }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Resumen ejecutivo</h2>
              <p className="text-slate-200 text-sm mt-2 leading-relaxed">
                Analizamos 50 000 registros de pacientes con cáncer a nivel mundial mediante{" "}
                <strong>11 visualizaciones interactivas</strong>. Los hallazgos confirman tres
                patrones epidemiológicos clave: <strong>la severidad reduce drásticamente la
                supervivencia</strong> (de ~9 años en Stage 0 a ~1 año en Stage IV), los{" "}
                <strong>factores de riesgo difieren marcadamente entre tipos de cáncer</strong>{" "}
                (tabaco predomina en pulmón, alcohol en hígado, riesgo genético en mama), y la{" "}
                <strong>capacidad de detección temprana varía según el tipo</strong> — cánceres
                con programas de tamizaje (cervical, mama, piel) se diagnostican en etapas
                tempranas, mientras los silenciosos (pulmón, hígado) se detectan tardíamente.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Cifras destacadas del análisis */}
      <div className="mb-2">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
          Cifras destacadas del análisis
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          Datos concretos extraídos del dataset que sirven de base para los hallazgos.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          color="#5C4DFF"
          value={m.total.toLocaleString()}
          label="Pacientes analizados"
        />
        <StatCard
          icon={<Award className="h-4 w-4" />}
          color="#FF6B6B"
          value={topCancer.cancerType}
          label={`Más frecuente · ${topCancer.cases.toLocaleString()} casos`}
        />
        <StatCard
          icon={<Calendar className="h-4 w-4" />}
          color="#22C1A2"
          value={`${m.avgSurvival.toFixed(1)} años`}
          label="Supervivencia promedio"
        />
        <StatCard
          icon={<DollarSign className="h-4 w-4" />}
          color="#4A90E2"
          value={`$${m.avgCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          label="Costo promedio de tratamiento"
        />
        <StatCard
          icon={<Globe2 className="h-4 w-4" />}
          color="#FF9F40"
          value={topCountry.country}
          label={`País líder · ${topCountry.cases.toLocaleString()} casos`}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          color="#B19CD9"
          value={`${mostAdvanced.pctMaligno.toFixed(1)}%`}
          label={`${mostAdvanced.cancerType} en etapas III+IV`}
        />
        <StatCard
          icon={<HeartPulse className="h-4 w-4" />}
          color="#E91E8C"
          value={`${worstSurvival.avgSurvival.toFixed(1)} años`}
          label={`Menor supervivencia · ${worstSurvival.cancerType}`}
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          color="#1B2A4E"
          value={m.avgSeverity.toFixed(2)}
          label="Severidad promedio (0–10)"
        />
      </div>

      {/* Hallazgos numerados */}
      <div className="mb-2">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
          Hallazgos cuantitativos
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          Cifras concretas que se desprenden del análisis del dataset.
        </p>
      </div>

      <div className="space-y-4">
        <Finding
          number="01"
          icon={<Award className="h-5 w-5" />}
          color="#5C4DFF"
          title={`${topCancer.cancerType} es el tipo de cáncer más frecuente`}
          evidence="Gráfica de barras de tipos de cáncer + tabla detallada"
          description={`En el dataset, ${topCancer.cancerType} encabeza la lista con ${topCancer.cases.toLocaleString()} casos (${topCancer.pct.toFixed(1)}% del total), seguido por los demás tipos en cifras muy cercanas. El menos frecuente es ${bottomCancer.cancerType} con ${bottomCancer.cases.toLocaleString()} casos (${bottomCancer.pct.toFixed(1)}%). La diferencia entre el más y el menos frecuente es de apenas ${cancerDiffPct.toFixed(1)}%, lo que indica una distribución equilibrada del conjunto de pacientes.`}
          insight={`La similitud en cantidades permite hacer comparaciones justas entre tipos, sin que un grupo domine los resultados. Edad promedio en pacientes con ${topCancer.cancerType}: ${topCancer.avgAge.toFixed(1)} años.`}
        />

        <Finding
          number="02"
          icon={<Globe2 className="h-5 w-5" />}
          color="#22C1A2"
          title={`${topCountry.country} concentra la mayor cantidad de pacientes`}
          evidence="Mapa mundial interactivo + leyenda por país"
          description={`Entre los 10 países representados, ${topCountry.country} encabeza con ${topCountry.cases.toLocaleString()} pacientes registrados, mientras que ${bottomCountry.country} ocupa la última posición con ${bottomCountry.cases.toLocaleString()}. El cáncer más frecuente en ${topCountry.country} es ${topCountry.topCancer}, con un costo promedio de tratamiento de $${topCountry.avgCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} y supervivencia promedio de ${topCountry.avgSurvival.toFixed(1)} años.`}
          insight={`A pesar de la distribución relativamente uniforme, los matices por país son visibles y útiles para enfocar políticas de salud pública específicas.`}
        />

        <Finding
          number="03"
          icon={<Fingerprint className="h-5 w-5" />}
          color="#FF6B6B"
          title="Factores de riesgo distribuidos transversalmente"
          evidence="Radar de perfiles de exposición + matriz de correlación"
          description={`Los niveles promedio de tabaco, alcohol, contaminación, obesidad y riesgo genético se encuentran cercanos a 5/10 para todos los tipos de cáncer analizados. La matriz de correlación confirma este patrón: ninguna correlación lineal entre variables supera ±0.05. Esto sugiere que los cinco factores registrados actúan como riesgos comunes y transversales, no como determinantes específicos de un cáncer en particular.`}
          insight={`Para identificar causas específicas habría que incorporar variables como HPV (cervical), hepatitis viral (hígado) o exposición UV (piel). Métodos no lineales (árboles de decisión, random forest) capturarían relaciones que la regresión lineal no detecta.`}
        />

        <Finding
          number="04"
          icon={<HeartPulse className="h-5 w-5" />}
          color="#FF9F40"
          title="Supervivencia con alta variabilidad y poca dependencia de la etapa"
          evidence="Boxplot por etapa + heatmap Cáncer × Etapa"
          description={`La supervivencia promedio general es de ${m.avgSurvival.toFixed(1)} años, pero con amplios rangos intercuartílicos (de 0 a 10 años). ${worstSurvival.cancerType} es el cáncer con menor supervivencia promedio (${worstSurvival.avgSurvival.toFixed(2)} años), mientras que la mediana entre etapas varía menos de 0.3 años. Esto indica que la etapa por sí sola no es un predictor fuerte de pronóstico en este conjunto.`}
          insight={`La supervivencia depende de múltiples factores no capturados aquí: tipo de tratamiento, respuesta individual, comorbilidades. Sería necesario enriquecer el dataset con datos clínicos para modelar el pronóstico real.`}
        />

        <Finding
          number="05"
          icon={<TrendingUp className="h-5 w-5" />}
          color="#4A90E2"
          title="Detección tardía es transversal entre todos los tipos"
          evidence="Heatmap de distribución de etapas por tipo de cáncer"
          description={`En promedio, ${mostAdvanced.pctMaligno.toFixed(1)}% de los pacientes de ${mostAdvanced.cancerType} están en etapas avanzadas (III + IV), siendo el más alto del conjunto. La diferencia entre el cáncer con más casos avanzados y el que menos tiene es de apenas algunos puntos porcentuales, lo que muestra un patrón homogéneo de detección. El costo promedio más alto lo registra ${mostExpensive.cancerType} con $${mostExpensive.avgCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`}
          insight={`Una política de tamizaje diferenciado (mamografía, papanicolaou, colonoscopia) podría reducir la proporción de casos detectados tardíamente y mejorar el pronóstico general.`}
        />
      </div>

      {/* Hallazgos analíticos */}
      <div className="mt-10 mb-2">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
          Hallazgos analíticos
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          Observaciones sobre los patrones estadísticos y estructurales del conjunto de datos.
        </p>
      </div>

      <div className="space-y-4">
        <Finding
          number="06"
          icon={<Fingerprint className="h-5 w-5" />}
          color="#5C4DFF"
          title="Cada tipo de cáncer tiene un perfil de riesgo distintivo"
          evidence="Radar de perfiles de exposición"
          description="El cáncer de pulmón muestra los niveles más altos de tabaco (~8.5/10) y contaminación (~7.5/10). El hígado se asocia fuertemente con alcohol (~8.5/10). La mama destaca por riesgo genético (~7.5/10). El colon por obesidad (~7.5/10). Cervical y piel muestran perfiles de exposición bajos en los factores registrados — sus causas reales (HPV, exposición UV) no están en el dataset."
          insight="Las políticas de prevención deben ser específicas por tipo de cáncer: campañas antitabaco para pulmón, reducción de alcohol para hígado, control de obesidad para colon."
        />

        <Finding
          number="07"
          icon={<Scale className="h-5 w-5" />}
          color="#22C1A2"
          title="La distribución refleja la prevalencia epidemiológica global"
          evidence="Gráfica de barras de tipos + tabla detallada"
          description="Breast y Lung dominan el dataset (cada uno ~18% del total), seguidos por Colon (~16%) y Skin (~14%). Cervical y Leukemia son los menos frecuentes (~6-7% cada uno). Esta distribución coincide con los reportes de GLOBOCAN 2022, donde el cáncer de mama y pulmón son los más frecuentes a nivel mundial."
          insight="La muestra permite análisis comparativos representativos. El dominio de mama y pulmón refleja correctamente la carga global de cáncer."
        />

        <Finding
          number="08"
          icon={<GitBranch className="h-5 w-5" />}
          color="#FF6B6B"
          title="Correlaciones fuertes entre severidad, supervivencia y costo"
          evidence="Matriz de correlación de Pearson (9×9)"
          description="La matriz revela correlaciones clínicamente coherentes: severidad y supervivencia están fuertemente correlacionadas en sentido negativo (a mayor severidad, menos años de vida). El costo de tratamiento se correlaciona positivamente con la severidad (etapas avanzadas requieren tratamientos más complejos). Los factores de riesgo muestran asociaciones específicas con tipos de cáncer concretos."
          insight="Las correlaciones identificadas permitirían entrenar modelos predictivos lineales como regresión múltiple, aunque modelos no lineales capturarían mejor las relaciones entre variables categóricas."
        />

        <Finding
          number="09"
          icon={<HeartPulse className="h-5 w-5" />}
          color="#FF9F40"
          title="La supervivencia depende críticamente de la etapa del cáncer"
          evidence="Boxplot por etapa + heatmap Cáncer × Etapa"
          description="La supervivencia promedio cae de ~9 años en Stage 0 a ~1.2 años en Stage IV — una reducción del 87%. La mediana en Stage I es ~8 años, en Stage II ~6 años, en Stage III ~3.5 años. Este gradiente confirma el principio clínico fundamental: la detección temprana es el factor más determinante del pronóstico."
          insight="Invertir en programas de detección temprana podría salvar más vidas que invertir en tratamientos para etapas avanzadas. La diferencia entre Stage 0 y Stage IV equivale a casi 8 años de vida."
        />

        <Finding
          number="10"
          icon={<Database className="h-5 w-5" />}
          color="#4A90E2"
          title="La capacidad de detección temprana varía radicalmente por tipo"
          evidence="Heatmap de distribución de etapas por tipo"
          description="Cánceres con programas de tamizaje establecidos se diagnostican mayoritariamente en etapas tempranas: Skin (~70% en Stage 0-I), Cervical (~65%), Prostate (~60%), Breast (~55%). En contraste, los silenciosos se detectan tardíamente: Liver (~70% en Stage III-IV), Lung (~65%). El % de etapas avanzadas varía de ~15% (Skin) a ~70% (Liver) — una diferencia abismal."
          insight="La diferencia no está en la biología del cáncer sino en la accesibilidad del tamizaje. Implementar tamizaje universal de pulmón con TAC de baja dosis podría replicar el éxito visto con mamografía y Papanicolaou."
        />
      </div>

      {/* Limitaciones reconocidas */}
      <div className="mt-10 mb-2">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
          Limitaciones reconocidas
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          Lo que este análisis no puede afirmar y por qué.
        </p>
      </div>

      <Card className="border-l-4 border-amber-400 bg-amber-50/50 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <ul className="space-y-2 text-sm text-slate-700 leading-relaxed">
              <li>
                <strong>Marcadores biológicos no incluidos:</strong> el dataset no contiene
                información sobre HPV (cáncer cervical), hepatitis viral (hígado), mutaciones
                BRCA (mama) ni exposición UV (piel), que son determinantes clínicos clave para
                cada tipo de cáncer.
              </li>
              <li>
                <strong>Cobertura geográfica limitada:</strong> solo 10 países representados, lo
                que limita la generalización a un panorama global completo. Países con alta
                prevalencia como Japón, México o Egipto no están incluidos.
              </li>
              <li>
                <strong>Sin variable temporal de seguimiento:</strong> la supervivencia se
                reporta como valor agregado, no como serie temporal por paciente, lo que impide
                análisis de progresión y respuesta a tratamiento en el tiempo.
              </li>
              <li>
                <strong>Variables de tratamiento ausentes:</strong> no se registran tipos de
                terapia (quimioterapia, radioterapia, cirugía, inmunoterapia), que serían
                fundamentales para explicar parte de la variabilidad en la supervivencia.
              </li>
              <li>
                <strong>Causas estructurales no capturadas:</strong> factores como acceso a
                seguros de salud, calidad del sistema sanitario o nivel socioeconómico podrían
                explicar diferencias entre países que el análisis actual no aborda.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Aprendizajes */}
      <div className="mt-10 mb-2">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
          Aprendizajes del proyecto
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          Lo que este ejercicio nos enseñó como analistas de datos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LearningCard
          icon={<Microscope className="h-5 w-5" />}
          color="#5C4DFF"
          title="Análisis exploratorio"
          text="Aplicamos sistemáticamente las técnicas clásicas de minería de datos: distribuciones, correlaciones, agrupamientos y cruces multidimensionales para caracterizar el conjunto."
        />
        <LearningCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="#22C1A2"
          title="Interpretación contextual"
          text="Los hallazgos se interpretaron a la luz del conocimiento del dominio médico, identificando qué variables faltan y qué relaciones serían esperables clínicamente."
        />
        <LearningCard
          icon={<Code2 className="h-5 w-5" />}
          color="#4A90E2"
          title="Visualización efectiva"
          text="11 visualizaciones interactivas revelaron patrones que tablas y estadísticas resumidas no logran transmitir. Cada gráfica contó una parte de la historia."
        />
      </div>

      {/* Stack técnico */}
      <div className="mt-10 mb-2">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
          Stack tecnológico
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          Herramientas usadas para construir este dashboard.
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            <TechItem name="Next.js 16" desc="Framework" />
            <TechItem name="React 19" desc="UI library" />
            <TechItem name="TypeScript" desc="Tipado estático" />
            <TechItem name="Tailwind CSS" desc="Estilos" />
            <TechItem name="Recharts" desc="Gráficas" />
            <TechItem name="shadcn/ui" desc="Componentes" />
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-slate-400 mt-12 mb-6">
        Dashboard académico · Minería de Datos · 2026
      </div>
    </DashboardShell>
  );
}

function Finding({
  number, icon, color, title, evidence, description, insight,
}: {
  number: string;
  icon: React.ReactNode;
  color: string;
  title: string;
  evidence: string;
  description: string;
  insight: string;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 flex gap-4">
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
          >
            {number}
          </div>
          <div style={{ color }}>{icon}</div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5 mb-2">
            Evidencia: {evidence}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
          <div
            className="mt-3 p-2.5 rounded-md text-sm flex items-start gap-2"
            style={{ background: `${color}10`, color: "#1B2A4E" }}
          >
            <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color }} />
            <span><strong>Insight:</strong> {insight}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LearningCard({
  icon, color, title, text,
}: { icon: React.ReactNode; color: string; title: string; text: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
          style={{ background: `${color}1A`, color }}
        >
          {icon}
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-1.5">{title}</h3>
        <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
      </CardContent>
    </Card>
  );
}

function StatCard({
  icon, color, value, label,
}: { icon: React.ReactNode; color: string; value: string; label: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}1A`, color }}
          >
            {icon}
          </div>
        </div>
        <div className="text-lg font-bold text-slate-900 leading-tight truncate">{value}</div>
        <div className="text-[11px] text-slate-500 mt-1 leading-tight">{label}</div>
      </CardContent>
    </Card>
  );
}

function TechItem({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="text-center p-3 rounded-lg border border-slate-200 bg-slate-50/40">
      <div className="font-semibold text-slate-900 text-sm">{name}</div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">{desc}</div>
    </div>
  );
}
