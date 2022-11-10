import { StyleSheet, View } from "react-native";
import BottomSheet from "react-native-simple-bottom-sheet";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
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
  const [requestsAccepted, setRequestsAccepted] = useState([]);
  const { openModal, closeModal, isOpen } = useMapModal();
  const [currentClientDestination, setCurrentClientDestination] =
    useState(null);
    const [currentRegion, setCurrentRegion] = useState(initialRegion);

  const [waterToFill, setWaterToFill] = useState(0);
  const [waterFilled, setWaterToFilled] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState("I don't know");



  useEffect(() => {
    if (isFocused) {
      api().suscribeToAmIConnected((isConnected) => {
        if(isConnected){
          api().setOfflineOnDisconnect({driverId:123})
          setIsConnected("sí conectado")
        } else{
          setIsConnected("No conectado")
        }
      });
    }else{
      // api().unsuscribeOfAllListener()
    }
  }, [isFocused]);


  useEffect(() => {
    if (requestsAccepted.length > 0 && userLocation) {
      setCurrentClientDestination(requestsAccepted[0]);
      const r = formatCurretRegion(requestsAccepted[0]);
      setWaterToFill(requestsAccepted[0].waterQuantity);

      setCurrentRegion(r);
    }
  }, [userLocation]);

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
    await api().sendDriverCoordsToDb({
      driverId: user.id,
      newCoords: userLocation,
    });
  };

  useEffect(() => {
    if (userLocation) {
      console.log("ENVIANDO. . ... . .. . . .");
      sendCurrentLocationToDb();
    }
  }, [userLocation]);

  useEffect(() => {
    api().suscribeToWatchClientRequests({ driverId: user.id }, (requests) => {
      const notDoneRequests = requests.filter((item) => item.status !== "DONE");
      if (notDoneRequests.length === 0) {
        setCurrentClientDestination(null);
        setRequestsAccepted([]);
        setRequestsByClients([]);
        setLoading(false);
      }

      const waitingRequests = notDoneRequests.filter(
        (item) => item.status === "PENDING"
      );
      const takenRequests = notDoneRequests.filter(
        (item) => item.status === "TAKEN" || "ARRIVED"
      );

      console.log({ waitingRequests });
      setRequestsByClients(waitingRequests);
      setRequestsAccepted(takenRequests);
      console.log({ notDoneRequests });
    });
  }, []);

  const updateUserLocation = (event) => {
    if (!event?.nativeEvent?.coordinate) return false;
    const location = event.nativeEvent.coordinate;
    if (isFocused) setUserLocation(location);
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

  const fill = async () => {
    setWaterToFilled(waterFilled + 1);
  };

  useEffect(() => {
    if (waterFilled >= waterToFill) {
    }
  }, [waterFilled]);

  return (
    <View>
      {userLocation &&
        requestsByClients.length > 0 &&
        currentClientDestination?.status === sectionList.PENDING && currentClientDestination && (
          <ModalX
            driverCoords={userLocation}
            clientCoords={requestsByClients[0].clientCoords}
            request={requestsByClients[0]}
            isOpen={isOpen}
            closeModal={closeModal}
            setRequesToTaken={() =>
              setRequesToTaken(requestsByClients[0].clientId)
            }
          />
        )}

      {/* Mapa principal -------------------------- */}
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        region={currentRegion}
        showsUserLocation={true}
        onUserLocationChange={updateUserLocation}
        userLocationUpdateInterval={5000}
        provider={PROVIDER_GOOGLE}
      >
        {userLocation && currentClientDestination &&  (
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
          <Text>{isConnected}</Text>
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

              {currentClientDestination.status === sectionList.PENDING && (
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

              {currentClientDestination.status === sectionList.ARRIVED && (
                <FlexContainer flex_ai_c>
                  <Text h4>Llenar: {waterToFill} L</Text>
                  <Text h5>Progreso: {waterFilled}L</Text>
                  <Button
                    containerStyle={{ minWidth: "50%", marginTop: 20 }}
                    title={"Llenar"}
                    onPress={fill}
                  />
                  <Button
                    containerStyle={{ marginVertical: 10, minWidth: "50%" }}
                    title={"llenar más"}
                  />
                  <Button
                    containerStyle={{ minWidth: "50%" }}
                    title={"Cobrar"}
                    onPress={setCharging}
                  />
                </FlexContainer>
              )}

              {currentClientDestination.status === sectionList.CHARGING && (
                <>
                  <Text style={{ textAlign: "center" }} h4>
                    Cobrar $200
                  </Text>
                  <Button title={"Hecho"} onPress={setRequestFinish} />
                </>
              )}
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
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
