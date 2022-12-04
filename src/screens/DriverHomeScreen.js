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
import { useDriver } from "../hooks/useDriver";
import { ScrollView } from "react-native-gesture-handler";
import { useAutomaticWater } from "../hooks/useAutomaticWater";

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

let initialTotalWater = 0;

export const DriverHomeScreen = ({ navigation }) => {
  const [marker, setMarker] = useState(initialMarker);
  const { user } = useAuth();
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

  const { suscribeToWatchClientRequests, removeListeners } = useDriver();
  const panelRef = useRef(null);
  const [manualLiter, setManualLiter] = useState(0);
  const [isAutomaticWaterButtonPressed, setIsAutomaticWaterButtonPressed] =
    useState(false);

  const {
    water,
    openAutomaticWater,
    waterConsuption,
    turnOffWater,
    turnOnWater,
    wasButtonPressed,
    setWasButtonPressed
  } = useAutomaticWater();

  const activateValve = () => {
    turnOnWater();
    setIsAutomaticWaterButtonPressed(true);
    
  };

 
  const deactivateValve = () => {
    turnOffWater();
    setWaterToFill(initialTotalWater - water);
  };

  useEffect(() => {
    if (isFocused) {
      api().suscribeToAmIConnected((_isConnected) => {
        if (_isConnected) {
          api().setOfflineOnDisconnect({ driverId: user.id }, () => {});
          setIsConnected("sí conectado");
        } else {
          setIsConnected("No conectado");
        }
      });
    } else {
    }
  }, [isFocused]);

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
    if (userLocation && isFocused && hasInternet) sendCurrentLocationToDb();
  }, [userLocation]);

  const startToListenToRequestChanges = () => {
    suscribeToWatchClientRequests({ driverId: user.id }, (requests) => {
      const notDoneRequests = requests.filter(
        (item) => item.status !== "DONE" && item.status !== "CANCELLED"
      );
      if (notDoneRequests.length === 0) {
        setCurrentClientDestination(null);
        setRequestsAccepted([]);
        setRequestsByClients([]);
        setPendingRequest(null);

        setLoading(false);
      }
      const waitingRequests = notDoneRequests.filter(
        (item) => item.status === "PENDING"
      );

      console.log(JSON.stringify(waitingRequests, null, 3));
      const takenRequests = notDoneRequests.filter(
        (item) => item.status === "TAKEN" || "ARRIVED"
      );

      if (takenRequests.length > 0) {
        setCurrentClientDestination(takenRequests[0]);
      }

      const sortedPending = waitingRequests.sort(
        (a, b) => a.clientCoords.timestamp - b.clientCoords.timestamp
      );
      const sortedAccepted = takenRequests.sort(
        (a, b) => a.clientCoords.timestamp - b.clientCoords.timestamp
      );

      setRequestsByClients(sortedPending);
      setRequestsAccepted(sortedAccepted);
    });
  };

  useEffect(() => {
    if (isFocused) {
      startToListenToRequestChanges();
    } else {
      removeListeners();
    }
  }, [isFocused]);

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
    //here is when the trucks comes to the client
    initialTotalWater = JSON.parse(JSON.stringify(water));
    setIsAutomaticWaterButtonPressed(false)
    setWaterToFill(0)
    setWasButtonPressed(false)


    const requestId = currentClientDestination.clientId;
    api().changeRequestStatus({ requestId, newStatus: "ARRIVED" }, (status) => {
      setCurrentClientDestination({ ...currentClientDestination, status });
    });
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

  // a function that

  const setRequestFinish = async () => {
    const requestId = currentClientDestination.clientId;
    await api().changeRequestStatus({ requestId, newStatus: "DONE" });
  };

  const cancellRequest = async () => {
    const requestId = pendingRequest.clientId;
    await api().changeRequestStatus({ requestId, newStatus: "CANCELLED" });
  };

  
  useEffect(() => {
    if (isFocused && userLocation) {
      animateToRegion(
        { ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.0167 },
        1000
      );
    }
  }, [isFocused]);

  const getTotal = () => {
    const priceByLiter = pendingRequest?.total / pendingRequest?.waterQuantity
    const kmCost = currentClientDestination?.kmCost || 0;
    const total = (priceByLiter * (initialTotalWater - water)) + kmCost
    
    console.log({total, priceByLiter, initialTotalWater, water, kmCost})
    const str = total.toString();
    const rounded = str.substring(0, 6);

    // $3.57MX per km


    api().updateTotalByRequestId({clientId: pendingRequest.clientId, total: rounded})
    return rounded;
  };

  return (
    <>
      <FloatContainer left={10} top={10} position="absolute">
        <WaterContainer
          waterLevel={water}
          isConnected={hasInternet}
          styles={styles.floatWaterBtn}
        />
      </FloatContainer>

      <View>
        {userLocation &&
          requestsByClients.length > 0 &&
          pendingRequest?.status === sectionList.PENDING &&
          currentClientDestination &&
          hasInternet && (
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
          {userLocation && hasInternet && currentClientDestination && (
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
          <ScrollView>
            <View style={styles.bsheet}>
              {pendingRequest && <></>}
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
                          <Text style={{ textAlign: "center" }} h5>
                            {pendingRequest?.user?.name} solicitda agua
                          </Text>
                        </>
                      )}

                      {currentClientDestination.status ===
                        sectionList.TAKEN && (
                        <>
                          <Text>Dirigete hacia la ubicación del cliente</Text>
                          <Button
                            title={"Llegué"}
                            onPress={setAlreadyArrived}
                          />
                        </>
                      )}

                      {currentClientDestination.status ===
                        sectionList.ARRIVED && (
                        <FlexContainer flex_ai_c>
                          <Text h5>
                            Llenar: {pendingRequest?.waterQuantity} L
                          </Text>
                          <Button
                            containerStyle={{ minWidth: "50%", marginTop: 0 }}
                            title={
                              "Llenar automaticamente: " +
                              pendingRequest?.waterQuantity +
                              "L"
                            }
                            onPress={() =>
                              openAutomaticWater(pendingRequest?.waterQuantity)
                            }
                            disabled={isAutomaticWaterButtonPressed || wasButtonPressed}
                          />
                          <Button
                            containerStyle={{ minWidth: "50%", marginTop: 10 }}
                            title={"Encender"}
                            onPress={activateValve}
                          />
                          <Button
                            containerStyle={{
                              marginVertical: 10,
                              minWidth: "50%",
                            }}
                            title={"Apagar"}
                            onPress={deactivateValve}
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
                            Cobrar ${getTotal()}
                            
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
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "60%",
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
  bsheet: {
    width: "100%",
    flexGrow: 1,
    flex: 1,
    padding: 20,
  },
});
