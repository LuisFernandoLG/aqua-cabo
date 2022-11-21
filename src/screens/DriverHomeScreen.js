import { StyleSheet, View } from "react-native";
import BottomSheet from "react-native-simple-bottom-sheet";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useEffect, useRef, useState } from "react";
import { Button, Text } from "@rneui/themed";
import { useAuth } from "../hooks/useAuth";
import { useIsFocused } from "@react-navigation/native";
import { useMapModal } from "../hooks/useMapModal";
import { ModalX } from "../components/Modal";
import { api } from "../services/api";
import { GOOGLE_MAPS_APIKEY } from "@env";
import MapViewDirections from "react-native-maps-directions";
import { getRegionForCoordinates } from "../helpers/getRegionForCoordinates";
import { FlexContainer } from "../components/FlexContainer";
import { KeyboardAvoidingView } from "react-native";
import { Platform } from "react-native";
import { useContext } from "react";
import { netInfoContext } from "../contexts/NetInfoContext";
import { Icon } from "@rneui/base";
import { locationConstants } from "../constants/locationConstants";
import { WaterContainer } from "../components/WaterContainer";
import { FloatContainer } from "../components/FloatContainer";

const initialRegion = {
  latitude: 22.945646,
  longitude: -109.943914,
  latitudeDelta: 1,
  longitudeDelta: 1,
};

const initialMarker = {
  key: 1,
  coordinate: {
    longitude: -109.14538756232878,
    latitude: 22.144967420710498,
  },
  title: "Pipa 1",
  description: "Esta es la pipa número 1",
};

const sectionList = {
  WAITING_FOR_REQUESTS: "WAITING_FOR_REQUESTS",
  PENDING: "PENDING",
  TAKEN: "TAKEN",
  ARRIVED: "ARRIVED",
  CHARGING: "CHARGING",
};

export const DriverHomeScreen = ({ navigation }) => {
  const [marker, setMarker] = useState(initialMarker);
  const { user, isLogged } = useAuth();
  const isFocused = useIsFocused();
  const [userLocation, setUserLocation] = useState(null);
  const [requestsByClients, setRequestsByClients] = useState([]);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [requestsAccepted, setRequestsAccepted] = useState([]);
  const { openModal, closeModal, isOpen } = useMapModal();
  const [currentClientDestination, setCurrentClientDestination] =
    useState(null);
  const [currentRegion, setCurrentRegion] = useState(initialRegion);

  const [waterToFill, setWaterToFill] = useState(0);
  const [waterFilled, setWaterToFilled] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState("I don't know");
  const mapRef = useRef(null);
  const { isConnected: hasInternet } = useContext(netInfoContext);

  useEffect(() => {
    if (isFocused) {
      api().suscribeToAmIConnected((_isConnected) => {
        if (_isConnected) {
          console.log("Asignando destructor");
          api().setOfflineOnDisconnect({ driverId: user.id }, () => {});
          setIsConnected("sí conectado");
        } else {
          setIsConnected("No conectado");
        }
      });
    } else {
    }
  }, [isFocused]);

  useEffect(() => {
    if (pendingRequest && userLocation) {
    }
  }, [userLocation, requestsAccepted]);

  const formatCurretRegion = (dest) => {
    const points = [
      {
        longitude: dest.clientCoords.longitude,
        latitude: dest.clientCoords.latitude,
      },

      {
        longitude: userLocation.longitude,
        latitude: userLocation.latitude,
      },
    ];

    return getRegionForCoordinates(points);
  };

  // Un screen no llama a su clenup después de que se cambia de pantalla, por lo que el ciclo de vida normal de un componente en react native cambia un poco con esta clase de componentes
  // A su vez, la documentación recomienda usar el hooj useIsFocussed para sabre si está siendo mostrada la patanlla o no
  // useEffect(() => {
  //   if (isFocused) suscribeOnSharingLocation();
  //   else unsuscribeOnSharingLocation();
  // }, [isFocused]);

  const panelRef = useRef(null);

  const sendCurrentLocationToDb = async () => {
    if (!user) return false;
    api().sendDriverCoordsToDb({
      driverId: user.id,
      newCoords: userLocation,
    });
  };

  const animateToRegion = (destTegion, miliseconds) => {
    if (mapRef) mapRef.current.animateToRegion(destTegion, miliseconds);
  };

  // CADA VEZ QUE LA UBUCACION CAMBIÉ
  useEffect(() => {
    if (userLocation) {
      if (isFocused) {
        // Update and animate to show between two points
        sendCurrentLocationToDb();
      }
    }
  }, [userLocation]);

  useEffect(() => {
    api().suscribeToWatchClientRequests({ driverId: user.id }, (requests) => {
      const notDoneRequests = requests.filter((item) => item.status !== "DONE");
      if (notDoneRequests.length === 0) {
        setCurrentClientDestination(null);
        setRequestsAccepted([]);
        setRequestsByClients([]);
        setPendingRequest(null);

        setLoading(false);
      }
      const waitingRequests = notDoneRequests.filter(
        (item) => item.status === "PENDING" && item.status !== "CANCELLED"
      );

      console.log(JSON.stringify(waitingRequests, null, 3));
      const takenRequests = notDoneRequests.filter(
        (item) => item.status === "TAKEN" || "ARRIVED"
      );

      if (takenRequests.length > 0) {
        setCurrentClientDestination(takenRequests[0]);
      }

      setRequestsByClients(waitingRequests);
      setRequestsAccepted(takenRequests);
    });
  }, []);

  useEffect(() => {
    if (requestsByClients.length !== 0) {
      setPendingRequest(requestsByClients[0]);
    }
  }, [requestsByClients]);

  const updateUserLocation = (event) => {
    if (isFocused) {
      if (!event?.nativeEvent?.coordinate) return false;
      const location = event.nativeEvent.coordinate;
      setUserLocation(location);
    }
  };

  const setRequesToTaken = async (requestId) => {
    await api().changeRequestStatus(
      { requestId, newStatus: "TAKEN" },
      (status) => {
        setCurrentClientDestination({ ...currentClientDestination, status });
      }
    );
  };

  const setAlreadyArrived = () => {
    const requestId = currentClientDestination.clientId;
    api().changeRequestStatus({ requestId, newStatus: "ARRIVED" }, (status) => {
      setCurrentClientDestination({ ...currentClientDestination, status });
    });
  };

  const turnOnWater = () => {
    api().changeStateOfWater({ sensorId: "aaa1", value: true });
  };

  const turnOffWater = () => {
    api().changeStateOfWater({ sensorId: "aaa1", value: false });
  };

  const setCharging = () => {
    const requestId = currentClientDestination.clientId;
    api().changeRequestStatus(
      { requestId, newStatus: "CHARGING" },
      (status) => {
        setCurrentClientDestination({ ...currentClientDestination, status });
      }
    );
  };

  const setRequestFinish = async () => {
    const requestId = currentClientDestination.clientId;
    await api().changeRequestStatus({ requestId, newStatus: "DONE" });
  };

  const cancellRequest = async () => {
    const requestId = currentClientDestination.clientId;
    await api().changeRequestStatus({ requestId, newStatus: "CANCELLED" });
  };

  const fill = async () => {
    setWaterToFilled(waterFilled + 1);
  };

  useEffect(() => {
    if (waterFilled >= waterToFill) {
    }
  }, [waterFilled]);

  useEffect(() => {
    if (isFocused && userLocation) {
      animateToRegion(
        { ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.0167 },
        1000
      );
    }
  }, [isFocused]);

  return (
    <>
      <FloatContainer left={10} top={10} position="absolute">
        <WaterContainer styles={styles.floatWaterBtn} />
      </FloatContainer>

      <View>
        {userLocation &&
          requestsByClients.length > 0 &&
          pendingRequest?.status === sectionList.PENDING &&
          currentClientDestination && (
            <ModalX
              driverCoords={userLocation}
              clientCoords={pendingRequest.clientCoords}
              request={pendingRequest}
              isOpen={isOpen}
              cancellRequest={cancellRequest}
              closeModal={closeModal}
              setRequesToTaken={() => setRequesToTaken(pendingRequest.clientId)}
            />
          )}

        {/* Mapa principal -------------------------- */}
        <MapView
          initialRegion={userLocation || initialRegion}
          showsUserLocation={true}
          onUserLocationChange={updateUserLocation}
          userLocationUpdateInterval={
            locationConstants.driverLocationUpdateSpeed
          }
          userLocationFastestInterval={
            locationConstants.driverLocationUpdateSpeed
          }
          provider={PROVIDER_GOOGLE}
          ref={mapRef}
          style={styles.map}
        >
          {userLocation && currentClientDestination && (
            <>
              <MapViewDirections
                strokeWidth={3}
                origin={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                }}
                destination={{
                  latitude: currentClientDestination.clientCoords.latitude,
                  longitude: currentClientDestination.clientCoords.longitude,
                }}
                apikey={GOOGLE_MAPS_APIKEY}
              />

              <Marker
                coordinate={{
                  latitude: currentClientDestination.clientCoords.latitude,
                  longitude: currentClientDestination.clientCoords.longitude,
                }}
                title={marker.title}
                image={require("../../assets/bus.png")}
              />
            </>
          )}
        </MapView>

        {/* Botoom sheet ------------------------------------------ */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <BottomSheet ref={(ref) => (panelRef.current = ref)}>
            {hasInternet ? (
              <>
                {!currentClientDestination && (
                  <>
                    <Text style={{ textAlign: "center" }} h4>
                      Esperando por clientes
                    </Text>
                  </>
                )}

                {currentClientDestination && (
                  <>
                    {currentClientDestination.status ===
                      sectionList.WAITING_FOR_REQUESTS && (
                      <Text>Esperando por clientes</Text>
                    )}

                    {currentClientDestination.status ===
                      sectionList.PENDING && (
                      <>
                        <Text style={{ textAlign: "center" }} h4>
                          En proceso de decisión
                        </Text>
                      </>
                    )}

                    {currentClientDestination.status === sectionList.TAKEN && (
                      <>
                        <Text>Dirigete hacia la ubicación del cliente</Text>
                        <Button title={"Llegué"} onPress={setAlreadyArrived} />
                      </>
                    )}

                    {currentClientDestination.status ===
                      sectionList.ARRIVED && (
                      <FlexContainer flex_ai_c>
                        <Text h4>Llenar: {waterToFill} L</Text>
                        <Text h5>Progreso: {waterFilled}L</Text>
                        <Button
                          containerStyle={{ minWidth: "50%", marginTop: 20 }}
                          title={"Encender"}
                          onPress={turnOnWater}
                        />
                        <Button
                          containerStyle={{
                            marginVertical: 10,
                            minWidth: "50%",
                          }}
                          title={"Apagar"}
                          onPress={turnOffWater}
                        />
                        <Button
                          containerStyle={{ minWidth: "50%" }}
                          title={"Cobrar"}
                          onPress={setCharging}
                        />
                      </FlexContainer>
                    )}

                    {currentClientDestination.status ===
                      sectionList.CHARGING && (
                      <>
                        <Text style={{ textAlign: "center" }} h4>
                          Cobrar $200
                        </Text>
                        <Button title={"Hecho"} onPress={setRequestFinish} />
                      </>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <Icon name="wifi-off" />
                <Text style={styles.noInternet}>
                  No hay conexión a internet
                </Text>
              </>
            )}

            {Platform.OS === "ios" ? (
              <View style={{ marginBottom: 40 }}></View>
            ) : (
              <View style={{ marginBottom: 20 }}></View>
            )}
          </BottomSheet>
        </KeyboardAvoidingView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
    zIndex: -1,
  },
  noInternet: {
    fontSize: 20,
    textAlign: "center",
  },
  floatWaterBtn: {
    position: "absolute",
    width: 20,
    height: 20,
    top: 10,
    left: 10,
    zIndex: 10,
  },
});
