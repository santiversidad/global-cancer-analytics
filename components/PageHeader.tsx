interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHeader({ eyebrow, title, description }: Props) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-1 h-5 rounded-full"
            style={{ background: "linear-gradient(180deg, #22C1A2, #5C4DFF)" }}
          />
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            {eyebrow}
          </span>
        </div>
      )}
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
      {description && (
        <p className="text-base text-slate-500 mt-2 max-w-3xl">{description}</p>
      )}
    </div>
  );
}

export function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}
