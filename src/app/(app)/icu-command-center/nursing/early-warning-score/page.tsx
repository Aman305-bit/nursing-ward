export default function IcuCommandCenterNursingEarlyWarningScoreRoute() {
  return (
    <div className="min-h-[calc(100vh-88px)] bg-slate-50 p-4">
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <iframe
          className="h-[calc(100vh-130px)] min-h-[760px] w-full"
          src="/icu-early-warning-score/index.html"
          title="Early Warning Score"
        />
      </div>
    </div>
  );
}
