import { ShieldAlert } from 'lucide-react';

export const PermissionDenied = () => {
  return (
    <section className="rounded-[2.25rem] border border-amber-300/20 bg-amber-500/10 p-6 backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl border border-amber-200/20 bg-amber-100/10 p-3 text-amber-50">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-100/80">Location permission denied</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Search for a city to unlock the live forecast.</h2>
          </div>
          <p className="max-w-2xl text-sm text-amber-50/85">
            Your browser blocked location access, so Weatherbox is staying private-first. Search manually and the premium
            forecast surface will light up instantly.
          </p>
        </div>
      </div>
    </section>
  );
};
