import { loadPatients, applyFilters, parseFilters, type Patient } from "@/lib/data";

export async function getPageData(
  searchParamsPromise: Promise<Record<string, string | string[] | undefined>>
) {
  const allPatients = loadPatients();
  const filters = parseFilters(await searchParamsPromise);
  const patients: Patient[] = applyFilters(allPatients, filters);

  const options = {
    cancerTypes: [...new Set(allPatients.map((p) => p.Cancer_Type))].sort(),
    stages: ["Stage 0", "Stage I", "Stage II", "Stage III", "Stage IV"],
    countries: [...new Set(allPatients.map((p) => p.Country_Region))].sort(),
    genders: [...new Set(allPatients.map((p) => p.Gender))].sort(),
    yearMin: Math.min(...allPatients.map((p) => p.Year)),
    yearMax: Math.max(...allPatients.map((p) => p.Year)),
  };

  return {
    allPatients,
    patients,
    options,
    totalCount: allPatients.length,
    filteredCount: patients.length,
    isEmpty: patients.length === 0,
  };
}
