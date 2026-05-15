export default function Loading() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar skeleton */}
      <div className="w-72 h-screen bg-white border-r border-slate-300 p-5 flex-shrink-0">
        <div className="flex flex-col items-center pb-5 border-b border-slate-200 mb-5">
          <div className="w-14 h-14 rounded-lg bg-slate-100 animate-pulse" />
          <div className="h-3 w-32 bg-slate-100 rounded mt-3 animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <div className="h-4 w-24 bg-indigo-100 rounded mb-3 animate-pulse" />
            <div className="h-8 w-80 bg-slate-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-white rounded-xl shadow-sm animate-pulse" />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-80 bg-white rounded-xl shadow-sm animate-pulse" />
            <div className="h-80 bg-white rounded-xl shadow-sm animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
