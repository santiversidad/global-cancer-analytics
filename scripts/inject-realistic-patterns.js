/* eslint-disable */
/**
 * Inyecta patrones epidemiológicos realistas al dataset.
 *
 * Fuentes médicas de referencia:
 * - GLOBOCAN 2022 (incidencia y prevalencia global)
 * - American Cancer Society (supervivencia por etapa, factores de riesgo)
 * - WHO Cancer Country Profiles
 *
 * Lo que se preserva: estructura, número de pacientes (50k), columnas, IDs.
 * Lo que se ajusta: tipo de cáncer (prevalencia real), etapa, factores de riesgo,
 * supervivencia, costo, severidad, género, edad — siguiendo distribuciones realistas.
 */

const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");

const INPUT  = path.join(__dirname, "..", "public", "data", "cancer.csv");
const OUTPUT = path.join(__dirname, "..", "public", "data", "cancer.csv");
const BACKUP = path.join(__dirname, "..", "public", "data", "cancer_original.csv");

// --- Utilidades de muestreo ---------------------------------------------------
function normal(mean, std) {
  // Box-Muller
  const u1 = Math.random() || 1e-9;
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * std;
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function pickWeighted(items, weights) {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r < 0) return items[i];
  }
  return items[items.length - 1];
}

const STAGES = ["Stage 0", "Stage I", "Stage II", "Stage III", "Stage IV"];

// --- Perfiles clínicos por tipo de cáncer -----------------------------------
// stageWeights: pesos relativos para Stage 0 → IV (suman 1)
// risk: niveles 0–10 promedio (con desviación estándar)
// age: distribución típica
// cost: costo base USD
// genderMaleProb: probabilidad de paciente masculino
const PROFILES = {
  Lung: {
    prevalence: 0.18,
    stageWeights: [0.05, 0.10, 0.20, 0.30, 0.35], // mayormente tardío
    risk: { Smoking: [8.5, 1.2], Alcohol_Use: [4.5, 1.8], Air_Pollution: [7.5, 1.4], Obesity_Level: [4.0, 1.5], Genetic_Risk: [5.0, 1.6] },
    age: [65, 10],
    cost: 85000,
    genderMaleProb: 0.60,
  },
  Breast: {
    prevalence: 0.18,
    stageWeights: [0.20, 0.35, 0.25, 0.15, 0.05], // mayormente temprano (mamografía)
    risk: { Smoking: [3.0, 1.5], Alcohol_Use: [5.5, 1.5], Air_Pollution: [3.5, 1.3], Obesity_Level: [6.0, 1.5], Genetic_Risk: [7.5, 1.3] },
    age: [58, 12],
    cost: 65000,
    genderMaleProb: 0.01, // 1% hombres
  },
  Colon: {
    prevalence: 0.16,
    stageWeights: [0.15, 0.25, 0.25, 0.20, 0.15],
    risk: { Smoking: [4.5, 1.6], Alcohol_Use: [6.0, 1.6], Air_Pollution: [4.0, 1.4], Obesity_Level: [7.5, 1.3], Genetic_Risk: [5.5, 1.7] },
    age: [62, 11],
    cost: 55000,
    genderMaleProb: 0.55,
  },
  Prostate: {
    prevalence: 0.12,
    stageWeights: [0.25, 0.35, 0.20, 0.12, 0.08], // PSA detecta temprano
    risk: { Smoking: [3.5, 1.5], Alcohol_Use: [4.5, 1.5], Air_Pollution: [3.5, 1.3], Obesity_Level: [5.5, 1.5], Genetic_Risk: [7.0, 1.4] },
    age: [68, 9],
    cost: 45000,
    genderMaleProb: 1.0,
  },
  Liver: {
    prevalence: 0.09,
    stageWeights: [0.05, 0.10, 0.15, 0.30, 0.40], // muy silencioso, tardío
    risk: { Smoking: [5.0, 1.7], Alcohol_Use: [8.5, 1.2], Air_Pollution: [4.5, 1.5], Obesity_Level: [6.5, 1.4], Genetic_Risk: [4.5, 1.7] },
    age: [60, 12],
    cost: 75000,
    genderMaleProb: 0.70,
  },
  Cervical: {
    prevalence: 0.07,
    stageWeights: [0.30, 0.35, 0.20, 0.10, 0.05], // Papanicolaou
    risk: { Smoking: [4.5, 1.6], Alcohol_Use: [3.5, 1.5], Air_Pollution: [3.0, 1.3], Obesity_Level: [4.0, 1.5], Genetic_Risk: [3.5, 1.6] },
    age: [45, 13],
    cost: 50000,
    genderMaleProb: 0.0, // 100% mujeres
  },
  Leukemia: {
    prevalence: 0.06,
    stageWeights: [0.15, 0.20, 0.25, 0.25, 0.15],
    risk: { Smoking: [3.5, 1.5], Alcohol_Use: [3.5, 1.5], Air_Pollution: [4.0, 1.5], Obesity_Level: [4.0, 1.5], Genetic_Risk: [7.5, 1.3] },
    age: [50, 22], // bimodal: jóvenes y mayores, alta varianza
    cost: 105000,
    genderMaleProb: 0.55,
  },
  Skin: {
    prevalence: 0.14,
    stageWeights: [0.40, 0.30, 0.15, 0.10, 0.05], // muy temprano
    risk: { Smoking: [3.0, 1.5], Alcohol_Use: [3.5, 1.5], Air_Pollution: [3.5, 1.3], Obesity_Level: [4.5, 1.5], Genetic_Risk: [5.0, 1.7] },
    age: [55, 15],
    cost: 22000,
    genderMaleProb: 0.55,
  },
};

// --- Supervivencia y severidad por etapa (datos clínicos estándar) ----------
const SURVIVAL_BY_STAGE = {
  "Stage 0":   { mean: 9.2, std: 0.6 },
  "Stage I":   { mean: 8.0, std: 1.0 },
  "Stage II":  { mean: 6.0, std: 1.3 },
  "Stage III": { mean: 3.5, std: 1.5 },
  "Stage IV":  { mean: 1.2, std: 0.9 },
};
const SEVERITY_BY_STAGE = {
  "Stage 0":   { mean: 1.8, std: 0.7 },
  "Stage I":   { mean: 3.5, std: 0.8 },
  "Stage II":  { mean: 5.2, std: 0.9 },
  "Stage III": { mean: 7.2, std: 0.8 },
  "Stage IV":  { mean: 9.0, std: 0.6 },
};
const STAGE_COST_MULTIPLIER = {
  "Stage 0":   0.6,
  "Stage I":   0.85,
  "Stage II":  1.05,
  "Stage III": 1.45,
  "Stage IV":  1.90,
};

// --- País → ajustes finos (refleja patrones reales sin exagerar) ------------
const COUNTRY_BIAS = {
  China:     { Lung: 1.4, Liver: 1.5 },                          // tabaco + hepatitis
  India:     { Cervical: 1.8, Liver: 1.2 },                      // poco tamizaje
  Pakistan:  { Cervical: 1.5, Liver: 1.2 },
  Russia:    { Lung: 1.3, Liver: 1.4 },                          // tabaco + alcohol
  Australia: { Skin: 2.0 },                                      // exposición UV
  USA:       { Breast: 1.2, Prostate: 1.2 },                     // tamizaje
  Brazil:    { Cervical: 1.3 },
  UK:        { Skin: 1.2, Lung: 1.1 },
  Germany:   { Prostate: 1.1, Colon: 1.1 },
  Canada:    { Breast: 1.1, Colon: 1.1 },
};

function reassignCancerType(country) {
  const items = Object.keys(PROFILES);
  const weights = items.map((c) => {
    const baseW = PROFILES[c].prevalence;
    const bias = COUNTRY_BIAS[country]?.[c] ?? 1.0;
    return baseW * bias;
  });
  return pickWeighted(items, weights);
}

// --- Lectura ----------------------------------------------------------------
console.log("Leyendo CSV original...");
const csv = fs.readFileSync(INPUT, "utf-8");
const parsed = Papa.parse(csv, { header: true, dynamicTyping: true, skipEmptyLines: true });
const rows = parsed.data;
console.log(`Cargados ${rows.length} pacientes.`);

// Backup del original
if (!fs.existsSync(BACKUP)) {
  fs.copyFileSync(INPUT, BACKUP);
  console.log(`Backup guardado en ${BACKUP}`);
}

// --- Transformación ---------------------------------------------------------
console.log("Inyectando patrones epidemiológicos...");
const transformed = rows.map((row) => {
  const country = row.Country_Region || "USA";

  // 1) Tipo de cáncer según prevalencia real + sesgos por país
  const cancerType = reassignCancerType(country);
  const profile = PROFILES[cancerType];

  // 2) Etapa según distribución específica del cáncer
  const stage = pickWeighted(STAGES, profile.stageWeights);

  // 3) Género (cervical, próstata, mama tienen restricciones biológicas)
  let gender;
  const r = Math.random();
  if (r < profile.genderMaleProb) gender = "Male";
  else gender = "Female";
  // Conserva ~2% "Other" si el cáncer no es sexo-específico
  if (profile.genderMaleProb > 0.05 && profile.genderMaleProb < 0.95 && Math.random() < 0.02) {
    gender = "Other";
  }

  // 4) Edad según perfil del cáncer
  const age = Math.round(clamp(normal(profile.age[0], profile.age[1]), 18, 95));

  // 5) Factores de riesgo según perfil del cáncer
  const risk = {};
  for (const [factor, [mean, std]] of Object.entries(profile.risk)) {
    risk[factor] = Number(clamp(normal(mean, std), 0, 10).toFixed(1));
  }

  // 6) Supervivencia según etapa (con algo de ruido)
  const survBase = SURVIVAL_BY_STAGE[stage];
  const survival = Number(clamp(normal(survBase.mean, survBase.std), 0, 10).toFixed(1));

  // 7) Severidad según etapa
  const sevBase = SEVERITY_BY_STAGE[stage];
  const severity = Number(clamp(normal(sevBase.mean, sevBase.std), 0, 10).toFixed(2));

  // 8) Costo: base del cáncer × multiplicador de etapa × ruido
  const costMul = STAGE_COST_MULTIPLIER[stage];
  const noise = 1 + (Math.random() - 0.5) * 0.3; // ±15%
  const cost = Math.round(profile.cost * costMul * noise);

  return {
    Patient_ID: row.Patient_ID,
    Age: age,
    Gender: gender,
    Country_Region: country,
    Year: row.Year,
    Genetic_Risk: risk.Genetic_Risk,
    Air_Pollution: risk.Air_Pollution,
    Alcohol_Use: risk.Alcohol_Use,
    Smoking: risk.Smoking,
    Obesity_Level: risk.Obesity_Level,
    Cancer_Type: cancerType,
    Cancer_Stage: stage,
    Treatment_Cost_USD: cost,
    Survival_Years: survival,
    Target_Severity_Score: severity,
  };
});

// --- Escritura --------------------------------------------------------------
const out = Papa.unparse(transformed);
fs.writeFileSync(OUTPUT, out, "utf-8");

console.log(`✓ Generados ${transformed.length} pacientes con patrones realistas.`);
console.log(`✓ Escrito en ${OUTPUT}`);
console.log("\nResumen rápido:");
const summary = {};
for (const r of transformed) summary[r.Cancer_Type] = (summary[r.Cancer_Type] || 0) + 1;
for (const [k, v] of Object.entries(summary).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(10)} ${v.toLocaleString()} pacientes`);
}
