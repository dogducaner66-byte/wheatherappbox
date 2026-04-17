import { motion } from 'framer-motion';

export const LoadingState = () => {
  return (
    <section className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/8 p-6 backdrop-blur-xl">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-200">Syncing forecast</p>
        <h2 className="mt-2 text-3xl font-semibold">Pulling the latest weather packet.</h2>
      </div>

      <div className="space-y-4">
        <motion.div
          animate={{ opacity: [0.35, 0.75, 0.35] }}
          className="h-8 w-40 rounded-full bg-white/10"
          transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          animate={{ opacity: [0.35, 0.75, 0.35] }}
          className="h-16 w-56 rounded-[2rem] bg-white/10"
          transition={{ delay: 0.12, duration: 1.4, repeat: Number.POSITIVE_INFINITY }}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <motion.div
              animate={{ opacity: [0.28, 0.68, 0.28] }}
              className="h-28 rounded-[1.75rem] bg-white/10"
              key={index}
              transition={{ delay: index * 0.08, duration: 1.4, repeat: Number.POSITIVE_INFINITY }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
