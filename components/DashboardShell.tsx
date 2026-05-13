import { FilterSidebar } from "@/components/FilterSidebar";

interface Props {
  options: React.ComponentProps<typeof FilterSidebar>["options"];
  totalCount: number;
  filteredCount: number;
  children: React.ReactNode;
}

export function DashboardShell({ options, totalCount, filteredCount, children }: Props) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <FilterSidebar options={options} totalCount={totalCount} filteredCount={filteredCount} />
      <main className="flex-1 p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
