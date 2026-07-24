export default function StorageLoading() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      <div className="h-20 w-full bg-white/5 rounded-lg"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="h-32 bg-white/5 rounded-lg border border-white/10"></div>
        <div className="h-32 bg-white/5 rounded-lg border border-white/10"></div>
        <div className="h-32 bg-white/5 rounded-lg border border-white/10"></div>
        <div className="h-32 bg-white/5 rounded-lg border border-white/10"></div>
      </div>
      <div className="h-96 w-full bg-white/5 rounded-lg border border-white/10"></div>
    </div>
  );
}
