import { motion } from 'framer-motion';

import type { WeatherCondition } from '../api/types';

interface WeatherIconProps {
  condition: Pick<WeatherCondition, 'kind' | 'label'>;
  isDay: boolean;
  className?: string;
}

const svgClassName = 'h-full w-full';
const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 3,
};

const SunGlyph = () => (
  <>
    <motion.circle
      animate={{ scale: [0.96, 1.04, 0.96] }}
      cx="32"
      cy="32"
      fill="currentColor"
      opacity="0.85"
      r="11"
      transition={{ duration: 4, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
    />
    <motion.g
      animate={{ rotate: 360 }}
      style={{ originX: '50%', originY: '50%' }}
      transition={{ duration: 18, ease: 'linear', repeat: Number.POSITIVE_INFINITY }}
    >
      {[
        [32, 7, 32, 15],
        [32, 49, 32, 57],
        [7, 32, 15, 32],
        [49, 32, 57, 32],
        [14, 14, 19, 19],
        [45, 45, 50, 50],
        [14, 50, 19, 45],
        [45, 19, 50, 14],
      ].map(([x1, y1, x2, y2]) => (
        <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} x2={x2} y1={y1} y2={y2} {...strokeProps} />
      ))}
    </motion.g>
  </>
);

const MoonGlyph = () => (
  <motion.path
    animate={{ rotate: [0, 8, 0] }}
    d="M40 11a17 17 0 1 0 13 28A18 18 0 1 1 40 11Z"
    fill="currentColor"
    opacity="0.9"
    style={{ originX: '50%', originY: '50%' }}
    transition={{ duration: 6, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
  />
);

const CloudGlyph = ({ offset = 0 }: { offset?: number }) => (
  <motion.g
    animate={{ x: [offset, offset + 2, offset] }}
    transition={{ duration: 5, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
  >
    <path d="M19 42h24a8 8 0 0 0 0-16 12 12 0 0 0-23-3A9 9 0 0 0 19 42Z" fill="currentColor" opacity="0.9" />
  </motion.g>
);

const RainGlyph = () => (
  <>
    <CloudGlyph />
    {[24, 32, 40].map((x, index) => (
      <motion.line
        animate={{ opacity: [0.25, 1, 0.25], y1: [42, 46, 42], y2: [50, 54, 50] }}
        key={x}
        transition={{ delay: index * 0.12, duration: 1.2, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
        x1={x}
        x2={x - 2}
        y1="44"
        y2="52"
        {...strokeProps}
      />
    ))}
  </>
);

const SnowGlyph = () => (
  <>
    <CloudGlyph />
    {[24, 32, 40].map((x, index) => (
      <motion.g
        animate={{ opacity: [0.3, 1, 0.3], rotate: [0, 25, 0], y: [0, 2, 0] }}
        key={x}
        style={{ originX: `${x}px`, originY: '49px' }}
        transition={{ delay: index * 0.15, duration: 1.8, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
      >
        <line x1={x} x2={x} y1="45" y2="53" {...strokeProps} />
        <line x1={x - 3} x2={x + 3} y1="49" y2="49" {...strokeProps} />
      </motion.g>
    ))}
  </>
);

const ThunderGlyph = () => (
  <>
    <CloudGlyph />
    <motion.path
      animate={{ opacity: [0.65, 1, 0.65] }}
      d="M31 43h7l-4 8h5l-9 12 3-9h-5l3-11Z"
      fill="currentColor"
      transition={{ duration: 1.2, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
    />
  </>
);

const FogGlyph = () => (
  <>
    <CloudGlyph />
    {[0, 1, 2].map((index) => (
      <motion.path
        animate={{ opacity: [0.3, 0.7, 0.3], x: [0, 3, 0] }}
        d={`M18 ${45 + index * 5}h28`}
        key={index}
        transition={{ delay: index * 0.2, duration: 2.2, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
        {...strokeProps}
      />
    ))}
  </>
);

const renderIconGlyph = (condition: WeatherConditionProps, isDay: boolean) => {
  switch (condition.kind) {
    case 'clear':
      return isDay ? <SunGlyph /> : <MoonGlyph />;
    case 'partly-cloudy':
      return (
        <>
          <g className="opacity-90">{isDay ? <SunGlyph /> : <MoonGlyph />}</g>
          <CloudGlyph offset={3} />
        </>
      );
    case 'cloudy':
      return (
        <>
          <CloudGlyph offset={-2} />
          <CloudGlyph offset={3} />
        </>
      );
    case 'fog':
      return <FogGlyph />;
    case 'drizzle':
    case 'rain':
      return <RainGlyph />;
    case 'snow':
      return <SnowGlyph />;
    case 'thunderstorm':
      return <ThunderGlyph />;
    case 'unknown':
    default:
      return <CloudGlyph />;
  }
};

type WeatherConditionProps = Pick<WeatherCondition, 'kind' | 'label'>;

export const WeatherIcon = ({ className = 'h-16 w-16', condition, isDay }: WeatherIconProps) => {
  return (
    <motion.svg
      animate={{ scale: [0.99, 1.01, 0.99] }}
      aria-label={condition.label}
      className={`${svgClassName} ${className}`}
      role="img"
      transition={{ duration: 4.5, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
      viewBox="0 0 64 64"
    >
      {renderIconGlyph(condition, isDay)}
    </motion.svg>
  );
};
