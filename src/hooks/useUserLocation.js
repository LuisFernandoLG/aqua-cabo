import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

let interval = null;

export const useUserLocation = () => {
  const [myLocation, setMyLocation] = useState(null);
  const [myLocationErrors, setMyLocationErros] = useState(null);
  const [isLocationSharing, setIsLocationSharing] = useState(true);

  const requestLocationPermissions = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Error de permisos",
        "Para usar la app necesitas conceder permisos de ubicación"
      );
      setMyLocationErros("Permido denegado");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});

    return location;
  };

  const enableSharingLocation = () => {
    setIsLocationSharing(true);
  };

  const disableSharingLocation = () => {
    setIsLocationSharing(false);
  };

  const suscribeOnSharingLocation = () => {
    interval = setInterval(async () => {
      requestLocationPermissions().then((location) => {
        console.log("ACTUALIZANDO UBI");
        setMyLocation(location);
      });
    }, 3000);
  };

  const unsuscribeOnSharingLocation = () => {
    clearInterval(interval);
  };

  useEffect(() => {
    return () => {
      console.log("limpiando intervalo");
    };
  }, []);

  return {
    myLocation,
    myLocationErrors,
    isLocationSharing,
    enableSharingLocation,
    disableSharingLocation,
    suscribeOnSharingLocation,
    unsuscribeOnSharingLocation,
  };
};
