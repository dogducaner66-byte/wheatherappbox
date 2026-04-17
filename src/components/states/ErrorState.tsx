import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <section className="rounded-[2.25rem] border border-rose-300/20 bg-rose-500/10 p-6 backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl border border-rose-200/20 bg-rose-100/10 p-3 text-rose-100">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-rose-100/80">Forecast unavailable</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">We hit turbulence loading the live conditions.</h2>
          </div>
          <p className="max-w-2xl text-sm text-rose-50/85">{message}</p>
          <button
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            type="button"
            onClick={onRetry}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    </section>
  );
};
