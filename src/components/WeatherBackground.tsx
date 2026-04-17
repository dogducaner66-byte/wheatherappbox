import { motion } from 'framer-motion';

import type { WeatherConditionKind, WeatherForecast } from '../api/types';
import { getGradientDescriptor } from '../utils/gradients';

interface WeatherBackgroundProps {
  forecast: WeatherForecast | null;
}

const getScene = (condition: WeatherConditionKind | undefined): string => {
  switch (condition) {
    case 'clear':
      return 'clear';
    case 'partly-cloudy':
    case 'cloudy':
      return 'clouds';
    case 'fog':
      return 'fog';
    case 'drizzle':
    case 'rain':
      return 'rain';
    case 'snow':
      return 'snow';
    case 'thunderstorm':
      return 'storm';
    case 'unknown':
    default:
      return 'ambient';
  }
};

const RainScene = () => (
  <div className="absolute inset-0">
    {[18, 28, 40, 52, 64, 76].map((left, index) => (
      <motion.span
        animate={{ opacity: [0, 0.7, 0], y: ['-10%', '110%'] }}
        className="absolute top-0 h-20 w-px bg-white/30"
        key={left}
        style={{ left: `${left}%` }}
        transition={{ delay: index * 0.18, duration: 1.8, ease: 'linear', repeat: Number.POSITIVE_INFINITY }}
      />
    ))}
  </div>
);

const SnowScene = () => (
  <div className="absolute inset-0">
    {[14, 26, 38, 52, 66, 78].map((left, index) => (
      <motion.span
        animate={{ opacity: [0.15, 0.8, 0.15], x: [0, 10, -4, 0], y: ['-10%', '110%'] }}
        className="absolute top-0 h-2 w-2 rounded-full bg-white/80"
        key={left}
        style={{ left: `${left}%` }}
        transition={{ delay: index * 0.24, duration: 6, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
      />
    ))}
  </div>
);

const StormScene = () => (
  <>
    <RainScene />
    <motion.div
      animate={{ opacity: [0, 0.18, 0, 0.35, 0] }}
      className="absolute inset-0 bg-white"
      transition={{ duration: 3.4, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
    />
  </>
);

const FogScene = () => (
  <div className="absolute inset-0">
    {[0, 1, 2].map((index) => (
      <motion.div
        animate={{ opacity: [0.14, 0.34, 0.14], x: ['-3%', '5%', '-3%'] }}
        className="absolute left-[-10%] right-[-10%] h-16 rounded-full bg-white/10 blur-3xl"
        key={index}
        style={{ top: `${26 + index * 18}%` }}
        transition={{ delay: index * 0.25, duration: 7, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
      />
    ))}
  </div>
);

const CloudScene = () => (
  <div className="absolute inset-0">
    {[{ left: '8%', top: '16%' }, { left: '54%', top: '26%' }, { left: '24%', top: '54%' }].map((cloud) => (
      <motion.div
        animate={{ x: ['0%', '4%', '0%'] }}
        className="absolute h-28 w-44 rounded-full bg-white/10 blur-3xl"
        key={`${cloud.left}-${cloud.top}`}
        style={cloud}
        transition={{ duration: 10, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
      />
    ))}
  </div>
);

const ClearScene = () => (
  <motion.div
    animate={{ scale: [0.96, 1.04, 0.96], opacity: [0.2, 0.35, 0.2] }}
    className="absolute right-[-8%] top-[-10%] h-72 w-72 rounded-full bg-white/20 blur-3xl"
    transition={{ duration: 8, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
  />
);

export const WeatherBackground = ({ forecast }: WeatherBackgroundProps) => {
  const gradientKey = forecast?.current?.condition.gradient ?? 'clouds-night';
  const gradient = getGradientDescriptor(gradientKey);
  const scene = getScene(forecast?.current?.condition.kind);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      data-gradient={gradient.key}
      data-scene={scene}
      data-testid="weather-background"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient.backgroundClassName}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.38),_transparent_40%)]" />
      <motion.div
        animate={{ opacity: [0.3, 0.52, 0.3], scale: [0.98, 1.03, 0.98] }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.14),_transparent_26%),radial-gradient(circle_at_80%_10%,_rgba(56,189,248,0.2),_transparent_28%)]"
        transition={{ duration: 10, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        animate={{ x: ['-4%', '2%', '-4%'], y: ['0%', '2%', '0%'] }}
        className="absolute bottom-[-18%] left-[-8%] h-96 w-96 rounded-full bg-white/10 blur-3xl"
        transition={{ duration: 16, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        animate={{ x: ['3%', '-4%', '3%'], y: ['0%', '-2%', '0%'] }}
        className="absolute right-[-10%] top-[-14%] h-96 w-96 rounded-full bg-sky-300/10 blur-3xl"
        transition={{ duration: 18, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
      />

      {scene === 'clear' ? <ClearScene /> : null}
      {scene === 'clouds' ? <CloudScene /> : null}
      {scene === 'fog' ? <FogScene /> : null}
      {scene === 'rain' ? <RainScene /> : null}
      {scene === 'snow' ? <SnowScene /> : null}
      {scene === 'storm' ? <StormScene /> : null}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(2,6,23,0.08),_rgba(2,6,23,0.6))]" />
    </div>
  );
};
