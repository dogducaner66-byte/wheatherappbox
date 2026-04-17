import { WifiOff } from 'lucide-react';

export const OfflineState = () => {
  return (
    <section className="rounded-[2.25rem] border border-slate-200/10 bg-slate-900/45 p-6 backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-100">
          <WifiOff className="h-6 w-6" />
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Offline mode</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Reconnect to refresh the live weather stream.</h2>
          </div>
          <p className="max-w-2xl text-sm text-slate-300">
            The native-style forecast canvas is ready, but we need a network connection before the provider can deliver new
            conditions for your selected city.
          </p>
        </div>
      </div>
    </section>
  );
};
