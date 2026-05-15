import fs from "fs";
import path from "path";
import Papa from "papaparse";

// Tipo TypeScript del paciente — equivalente al esquema del CSV
export interface Patient {
  Patient_ID: string;
  Age: number;
  Gender: string;
  Country_Region: string;
  Year: number;
  Genetic_Risk: number;
  Air_Pollution: number;
  Alcohol_Use: number;
  Smoking: number;
  Obesity_Level: number;
  Cancer_Type: string;
  Cancer_Stage: string;
  Treatment_Cost_USD: number;
  Survival_Years: number;
  Target_Severity_Score: number;
}

// ============================================================
// Filtros
// ============================================================
export interface Filters {
  cancerTypes?: string[];
  stages?: string[];
  countries?: string[];
  genders?: string[];
  yearFrom?: number;
  yearTo?: number;
}

export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const arr = (v: string | string[] | undefined): string[] | undefined => {
    if (!v) return undefined;
    const raw = Array.isArray(v) ? v.join(",") : v;
    const list = raw.split(",").filter(Boolean);
    return list.length ? list : undefined;
  };
  const num = (v: string | string[] | undefined): number | undefined => {
    const raw = Array.isArray(v) ? v[0] : v;
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : undefined;
  };
  return {
    cancerTypes: arr(sp.cancer),
    stages: arr(sp.stage),
    countries: arr(sp.country),
    genders: arr(sp.gender),
    yearFrom: num(sp.yearFrom),
    yearTo: num(sp.yearTo),
  };
}

export function applyFilters(patients: Patient[], f: Filters): Patient[] {
  return patients.filter((p) => {
    if (f.cancerTypes && !f.cancerTypes.includes(p.Cancer_Type)) return false;
    if (f.stages && !f.stages.includes(p.Cancer_Stage)) return false;
    if (f.countries && !f.countries.includes(p.Country_Region)) return false;
    if (f.genders && !f.genders.includes(p.Gender)) return false;
    if (f.yearFrom !== undefined && p.Year < f.yearFrom) return false;
    if (f.yearTo !== undefined && p.Year > f.yearTo) return false;
    return true;
  });
}

// Lee el CSV desde el filesystem (corre en el servidor, no en el navegador)
export function loadPatients(): Patient[] {
  const filePath = path.join(process.cwd(), "public", "data", "cancer.csv");
  const csv = fs.readFileSync(filePath, "utf-8");
  const { data } = Papa.parse<Patient>(csv, {
    header: true,
    dynamicTyping: true,    // convierte "25" en 25 automáticamente
    skipEmptyLines: true,
  });
  return data;
}

// Conteo agrupado por una columna categórica
export function countByCategory(patients: Patient[], key: keyof Patient): { name: string; value: number }[] {
  const counts: Record<string, number> = {};
  for (const p of patients) {
    const k = String(p[key]);
    counts[k] = (counts[k] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// Agrupa por año y tipo de cáncer, devuelve formato para LineChart
// Resultado: [{ year: 2015, Lung: 620, Breast: 600, ... }, ...]
export function countByYearAndType(patients: Patient[]): Array<Record<string, number | string>> {
  const map: Record<number, Record<string, number>> = {};
  for (const p of patients) {
    if (!map[p.Year]) map[p.Year] = {};
    map[p.Year][p.Cancer_Type] = (map[p.Year][p.Cancer_Type] || 0) + 1;
  }
  return Object.entries(map)
    .map(([year, types]) => ({ year: Number(year), ...types }))
    .sort((a, b) => (a.year as number) - (b.year as number));
}

// Estadísticas agregadas por país, listas para el mapa
export interface CountryStats {
  country: string;
  iso: string;          // código ISO-3 (USA, CHN, ...)
  cases: number;
  avgSurvival: number;
  avgCost: number;
  topCancer: string;
}

// Mapeo de nombres del dataset a códigos ISO-3
const COUNTRY_TO_ISO: Record<string, string> = {
  USA: "USA",
  UK: "GBR",
  China: "CHN",
  India: "IND",
  Pakistan: "PAK",
  Brazil: "BRA",
  Germany: "DEU",
  Canada: "CAN",
  Russia: "RUS",
  Australia: "AUS",
};

export function statsByCountry(patients: Patient[]): CountryStats[] {
  const buckets: Record<string, Patient[]> = {};
  for (const p of patients) {
    if (!buckets[p.Country_Region]) buckets[p.Country_Region] = [];
    buckets[p.Country_Region].push(p);
  }

  return Object.entries(buckets)
    .map(([country, group]) => {
      const cancerCounts: Record<string, number> = {};
      for (const p of group) {
        cancerCounts[p.Cancer_Type] = (cancerCounts[p.Cancer_Type] || 0) + 1;
      }
      const topCancer = Object.entries(cancerCounts).sort((a, b) => b[1] - a[1])[0][0];

      return {
        country,
        iso: COUNTRY_TO_ISO[country] ?? country,
        cases: group.length,
        avgSurvival: group.reduce((s, p) => s + (p.Survival_Years || 0), 0) / group.length,
        avgCost: group.reduce((s, p) => s + (p.Treatment_Cost_USD || 0), 0) / group.length,
        topCancer,
      };
    })
    .sort((a, b) => b.cases - a.cases);
}

// Puntos para el scatter — extrae solo lo necesario y muestrea si hay muchos
export interface ScatterPoint {
  age: number;
  survival: number;
  stage: string;
}

export function getScatterPoints(patients: Patient[], maxPoints = 3000): ScatterPoint[] {
  // Muestreo determinístico para rendimiento (50k puntos en SVG es muy lento)
  const step = Math.max(1, Math.floor(patients.length / maxPoints));
  const points: ScatterPoint[] = [];
  for (let i = 0; i < patients.length; i += step) {
    const p = patients[i];
    points.push({
      age: p.Age,
      survival: p.Survival_Years,
      stage: p.Cancer_Stage,
    });
  }
  return points;
}

// Estadísticas de boxplot (mínimo, Q1, mediana, Q3, máximo) por etapa
export interface BoxStats {
  stage: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  count: number;
}

function percentile(sorted: number[], p: number): number {
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function survivalByStage(patients: Patient[]): BoxStats[] {
  const buckets: Record<string, number[]> = {};
  for (const p of patients) {
    if (typeof p.Survival_Years !== "number") continue;
    if (!buckets[p.Cancer_Stage]) buckets[p.Cancer_Stage] = [];
    buckets[p.Cancer_Stage].push(p.Survival_Years);
  }

  return Object.entries(buckets).map(([stage, vals]) => {
    const sorted = [...vals].sort((a, b) => a - b);
    return {
      stage,
      min: sorted[0],
      q1: percentile(sorted, 0.25),
      median: percentile(sorted, 0.5),
      q3: percentile(sorted, 0.75),
      max: sorted[sorted.length - 1],
      count: sorted.length,
    };
  });
}

// Resumen detallado por tipo de cáncer (para tabla del Resumen)
export interface CancerTypeStats {
  cancerType: string;
  cases: number;
  pct: number;
  avgAge: number;
  avgCost: number;
  avgSurvival: number;
  pctMaligno: number; // % en etapa avanzada (III + IV)
}

export function statsByCancerType(patients: Patient[]): CancerTypeStats[] {
  const buckets: Record<string, Patient[]> = {};
  for (const p of patients) {
    if (!buckets[p.Cancer_Type]) buckets[p.Cancer_Type] = [];
    buckets[p.Cancer_Type].push(p);
  }
  const total = patients.length;

  return Object.entries(buckets)
    .map(([cancerType, group]) => {
      const avanzadas = group.filter(
        (p) => p.Cancer_Stage === "Stage III" || p.Cancer_Stage === "Stage IV"
      ).length;
      return {
        cancerType,
        cases: group.length,
        pct: (group.length / total) * 100,
        avgAge: group.reduce((s, p) => s + (p.Age || 0), 0) / group.length,
        avgCost: group.reduce((s, p) => s + (p.Treatment_Cost_USD || 0), 0) / group.length,
        avgSurvival: group.reduce((s, p) => s + (p.Survival_Years || 0), 0) / group.length,
        pctMaligno: (avanzadas / group.length) * 100,
      };
    })
    .sort((a, b) => b.cases - a.cases);
}

// Promedio de cada factor de riesgo (0-10) por tipo de cáncer, formato para RadarChart.
// Cada fila es un eje del radar; cada tipo de cáncer es una serie.
export interface RadarRow {
  factor: string;
  [cancerType: string]: string | number;
}

export function riskFactorsByCancerType(patients: Patient[]): RadarRow[] {
  const buckets: Record<string, Patient[]> = {};
  for (const p of patients) {
    if (!buckets[p.Cancer_Type]) buckets[p.Cancer_Type] = [];
    buckets[p.Cancer_Type].push(p);
  }

  const FACTORS: Array<{ label: string; col: keyof Patient }> = [
    { label: "Tabaco",        col: "Smoking" },
    { label: "Alcohol",       col: "Alcohol_Use" },
    { label: "Contaminación", col: "Air_Pollution" },
    { label: "Obesidad",      col: "Obesity_Level" },
    { label: "Genético",      col: "Genetic_Risk" },
  ];

  return FACTORS.map(({ label, col }) => {
    const row: RadarRow = { factor: label };
    for (const [cancer, group] of Object.entries(buckets)) {
      const avg = group.reduce((s, p) => s + (Number(p[col]) || 0), 0) / group.length;
      row[cancer] = Number(avg.toFixed(2));
    }
    return row;
  });
}

// Datos del heatmap: combinación tipo de cáncer × etapa, con supervivencia promedio
export interface HeatmapCell {
  cancerType: string;
  stage: string;
  avgSurvival: number;
  count: number;
}

export function survivalHeatmap(patients: Patient[]): HeatmapCell[] {
  const buckets: Record<string, Patient[]> = {};
  for (const p of patients) {
    const key = `${p.Cancer_Type}|${p.Cancer_Stage}`;
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(p);
  }

  return Object.entries(buckets).map(([key, group]) => {
    const [cancerType, stage] = key.split("|");
    return {
      cancerType,
      stage,
      avgSurvival: group.reduce((s, p) => s + (p.Survival_Years || 0), 0) / group.length,
      count: group.length,
    };
  });
}

// Matriz de correlación entre variables numéricas — base del análisis exploratorio
export interface CorrelationCell {
  x: string;
  y: string;
  value: number;
}

function pearson(pairs: Array<[number, number]>): number {
  const n = pairs.length;
  if (n === 0) return 0;
  let sumX = 0, sumY = 0;
  for (const [x, y] of pairs) { sumX += x; sumY += y; }
  const meanX = sumX / n;
  const meanY = sumY / n;
  let cov = 0, varX = 0, varY = 0;
  for (const [x, y] of pairs) {
    const dx = x - meanX;
    const dy = y - meanY;
    cov += dx * dy;
    varX += dx * dx;
    varY += dy * dy;
  }
  const denom = Math.sqrt(varX * varY);
  return denom === 0 ? 0 : cov / denom;
}

export function correlationMatrix(patients: Patient[]): CorrelationCell[] {
  const cols: Array<keyof Patient> = [
    "Age",
    "Genetic_Risk",
    "Air_Pollution",
    "Alcohol_Use",
    "Smoking",
    "Obesity_Level",
    "Treatment_Cost_USD",
    "Survival_Years",
    "Target_Severity_Score",
  ];

  const result: CorrelationCell[] = [];
  for (const x of cols) {
    for (const y of cols) {
      const pairs = patients
        .map((p) => [Number(p[x]), Number(p[y])] as [number, number])
        .filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
      result.push({ x: String(x), y: String(y), value: pearson(pairs) });
    }
  }
  return result;
}

// Distribución de etapas por tipo de cáncer (cada fila suma 100%)
export interface StageDistCell {
  cancerType: string;
  stage: string;
  count: number;
  pct: number;
}

export function stageDistByCancer(patients: Patient[]): StageDistCell[] {
  const buckets: Record<string, Patient[]> = {};
  for (const p of patients) {
    if (!buckets[p.Cancer_Type]) buckets[p.Cancer_Type] = [];
    buckets[p.Cancer_Type].push(p);
  }

  const STAGES = ["Stage 0", "Stage I", "Stage II", "Stage III", "Stage IV"];
  const cells: StageDistCell[] = [];

  for (const [cancerType, group] of Object.entries(buckets)) {
    const total = group.length;
    for (const stage of STAGES) {
      const count = group.filter((p) => p.Cancer_Stage === stage).length;
      cells.push({
        cancerType,
        stage,
        count,
        pct: total > 0 ? (count / total) * 100 : 0,
      });
    }
  }
  return cells;
}

// Calcula las métricas principales del dashboard
export function computeMetrics(patients: Patient[]) {
  const total = patients.length;

  // Tipo de cáncer más común
  const cancerCounts: Record<string, number> = {};
  for (const p of patients) {
    cancerCounts[p.Cancer_Type] = (cancerCounts[p.Cancer_Type] || 0) + 1;
  }
  const cancerComun = Object.entries(cancerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  // Promedios
  const avgSurvival = patients.reduce((s, p) => s + (p.Survival_Years || 0), 0) / total;
  const avgCost = patients.reduce((s, p) => s + (p.Treatment_Cost_USD || 0), 0) / total;
  const avgSeverity = patients.reduce((s, p) => s + (p.Target_Severity_Score || 0), 0) / total;

  return { total, cancerComun, avgSurvival, avgCost, avgSeverity };
}
