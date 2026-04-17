import { useCallback } from 'react';

import { useAppStore } from '../store/appStore';
import type { TemperatureUnit } from '../types/location';

export const useUnitPreference = () => {
  const unit = useAppStore((state) => state.unit);
  const setUnit = useAppStore((state) => state.setUnit);

  const updateUnit = useCallback(
    (nextUnit: TemperatureUnit) => {
      setUnit(nextUnit);
    },
    [setUnit],
  );

  return {
    unit,
    setUnit: updateUnit,
  };
};

