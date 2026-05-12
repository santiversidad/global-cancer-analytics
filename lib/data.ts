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
