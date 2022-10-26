import { useState } from "react";

export const useMapLocation = () => {
  const [location, setLocation] = useState(null);

  const updateLocation = (newLocation) => {
    setLocation(newLocation);
  };

  return {
    updateLocation,
    location,
  };
};
