import { useQuery } from '@tanstack/react-query';

import { fetchWeatherForecast } from '../api/openmeteo';
import { useAppStore } from '../store/appStore';

export const useWeather = () => {
  const currentLocation = useAppStore((state) => state.currentLocation);
  const unit = useAppStore((state) => state.unit);

  return useQuery({
    queryKey: ['weather-forecast', currentLocation?.id, currentLocation?.latitude, currentLocation?.longitude, unit],
    enabled: Boolean(currentLocation),
    queryFn: ({ signal }) => {
      if (!currentLocation) {
        throw new Error('A location must be selected before requesting forecast data.');
      }

      return fetchWeatherForecast(currentLocation, unit, { signal });
    },
  });
};
