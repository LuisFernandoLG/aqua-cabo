import { TruckMarker } from "./TruckMarker";

export const AvailableTruckGroup = ({ trucks }) => {
  return (
    <>
      {trucks.map(({ driverId, latitude, longitude }) => {
        return (
          <TruckMarker
            key={driverId}
            id={driverId}
            latitude={latitude}
            longitude={longitude}
          />
        );
      })}
    </>
  );
};
