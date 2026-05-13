"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { Filter, RotateCcw, LayoutDashboard, Globe2, TrendingUp, Activity, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Logo } from "@/components/Logo";

const NAV_ITEMS = [
  { href: "/",            label: "Resumen general",   icon: LayoutDashboard, desc: "Métricas clave" },
  { href: "/mapa",        label: "Mapa mundial",       icon: Globe2,         desc: "¿Dónde ocurre?" },
  { href: "/tendencias",  label: "Tipos y tendencias", icon: TrendingUp,     desc: "¿Qué y cuándo?" },
  { href: "/severidad",   label: "Análisis por etapa", icon: Activity,       desc: "¿Qué tan grave?" },
];

interface AvailableOptions {
  cancerTypes: string[];
  stages: string[];
  countries: string[];
  genders: string[];
  yearMin: number;
  yearMax: number;
}

interface Props {
  options: AvailableOptions;
  totalCount: number;
  filteredCount: number;
}

export function FilterSidebar({ options, totalCount, filteredCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getMulti = useCallback(
    (key: string): string[] => searchParams.get(key)?.split(",").filter(Boolean) ?? [],
    [searchParams]
  );

  const updateUrl = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname]
  );

  const toggleMulti = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = getMulti(key);
    const isActive = current.includes(value);
    const next = isActive ? current.filter((v) => v !== value) : [...current, value];
    if (next.length === 0) params.delete(key);
    else params.set(key, next.join(","));
    updateUrl(params);
  };

  const clearAll = () => router.push(pathname, { scroll: false });

  const yearFromUrl = Number(searchParams.get("yearFrom")) || options.yearMin;
  const yearToUrl = Number(searchParams.get("yearTo")) || options.yearMax;
  const [yearRange, setYearRange] = useState<[number, number]>([yearFromUrl, yearToUrl]);

  useEffect(() => {
    setYearRange([yearFromUrl, yearToUrl]);
  }, [yearFromUrl, yearToUrl]);

  const commitYearRange = (vals: number[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (vals[0] === options.yearMin) params.delete("yearFrom");
    else params.set("yearFrom", String(vals[0]));
    if (vals[1] === options.yearMax) params.delete("yearTo");
    else params.set("yearTo", String(vals[1]));
    updateUrl(params);
  };

  const hasFilters = searchParams.toString().length > 0;
  const [isOpen, setIsOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Botón flotante para reabrir cuando el sidebar está cerrado
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 w-9 h-9 rounded-lg bg-white border border-slate-300 shadow-sm hover:shadow-md hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-all"
        title="Abrir panel"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    );
  }

  return (
    <aside className="w-72 h-screen overflow-y-auto sticky top-0 bg-white border-r border-slate-300 p-5 flex-shrink-0 scrollbar-thin">
      {/* Botón cerrar */}
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-3 right-3 w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
        title="Cerrar panel"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Branding */}
      <div className="flex flex-col items-center text-center pb-5 border-b border-slate-200 mb-5">
        <Logo size={56} />
        <div className="mt-3 text-sm font-bold tracking-[0.18em] text-slate-900">CÁNCER GLOBAL</div>
        <div className="text-[10px] text-slate-400 tracking-[0.12em] mt-0.5">DASHBOARD DE ANÁLISIS</div>
      </div>

      {/* Navegación de secciones */}
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2 px-1">
          Secciones
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group ${
                  isActive ? "bg-indigo-50 text-indigo-900" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, #5C4DFF, #22C1A2)"
                      : "linear-gradient(135deg, #5C4DFF22, #22C1A222)",
                  }}
                >
                  <item.icon className={`h-4 w-4 ${isActive ? "text-white" : "text-indigo-600"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`truncate ${isActive ? "font-semibold" : "font-medium text-slate-900"}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Header de filtros — clickable para plegar */}
      <button
        onClick={() => setFiltersOpen((v) => !v)}
        className="w-full flex items-center gap-2 mb-1 pt-4 border-t border-slate-200 group"
      >
        <Filter className="h-4 w-4 text-indigo-600" />
        <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-900 flex-1 text-left">
          Filtros {hasFilters && <span className="text-[10px] ml-1 font-normal text-indigo-600">(activos)</span>}
        </h2>
        {filtersOpen ? (
          <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
        )}
      </button>

      {filtersOpen && (
        <>
          <p className="text-xs text-slate-500 mb-4">Refina los datos del dashboard</p>

          <div className="bg-slate-50 rounded-lg p-3 mb-5 text-xs space-y-1 border border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500">Total</span>
              <span className="font-semibold text-slate-900">{totalCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Filtrados</span>
              <span className="font-semibold text-emerald-600">{filteredCount.toLocaleString()}</span>
            </div>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex items-center justify-center gap-1 w-full mt-2 py-1.5 rounded text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Limpiar todos
              </button>
            )}
          </div>

          <FilterSection label="Tipo de cáncer">
            <Chips options={options.cancerTypes} active={getMulti("cancer")} onToggle={(v) => toggleMulti("cancer", v)} />
          </FilterSection>

          <FilterSection label="Etapa">
            <Chips options={options.stages} active={getMulti("stage")} onToggle={(v) => toggleMulti("stage", v)} />
          </FilterSection>

          <FilterSection label="País">
            <Chips options={options.countries} active={getMulti("country")} onToggle={(v) => toggleMulti("country", v)} />
          </FilterSection>

          <FilterSection label="Género">
            <Chips options={options.genders} active={getMulti("gender")} onToggle={(v) => toggleMulti("gender", v)} />
          </FilterSection>

          <FilterSection label={`Año: ${yearRange[0]} – ${yearRange[1]}`}>
            <div className="px-1 pt-3">
              <Slider
                min={options.yearMin}
                max={options.yearMax}
                step={1}
                value={yearRange}
                onValueChange={(v) => setYearRange([v[0], v[1]] as [number, number])}
                onValueCommit={commitYearRange}
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                <span>{options.yearMin}</span>
                <span>{options.yearMax}</span>
              </div>
            </div>
          </FilterSection>
        </>
      )}
    </aside>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2">{label}</div>
      {children}
    </div>
  );
}

function Chips({
  options,
  active,
  onToggle,
}: {
  options: string[];
  active: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const isActive = active.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
              isActive
                ? "text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
            style={isActive ? { background: "#5C4DFF" } : undefined}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
