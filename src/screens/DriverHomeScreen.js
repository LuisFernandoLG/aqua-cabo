import { StyleSheet, View } from "react-native";
import BottomSheet from "react-native-simple-bottom-sheet";
import MapView, { Marker } from "react-native-maps";
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
import { SectionList } from "react-native";

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
  WAITING_FOR_REQUESTS: 0,
  ARRIVED: 1,
  FILLING: 2,
  CHARGING: 3,
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
  const [section, setSection] = useState(sectionList.WAITING_FOR_REQUESTS);

  const [waterToFill, setWaterToFill] = useState(0);
  const [waterFilled, setWaterToFilled] = useState(0);

  useEffect(() => {
    console.log({ requestsAccepted });
    if (requestsAccepted.length > 0 && userLocation) {
      setCurrentClientDestination(requestsAccepted[0]);
      const r = formatCurretRegion(requestsAccepted[0]);

      if (requestsAccepted[0].status === "TAKEN")
        setSection(sectionList.ARRIVED);
      if (requestsAccepted[0].status === "ARRIVED")
        setSection(sectionList.FILLING);
      if (requestsAccepted[0].status === "CHARGING")
        setSection(sectionList.CHARGING);

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
      sendCurrentLocationToDb();
    }
  }, [userLocation]);

  useEffect(() => {
    console.log({ user });

    api().suscribeToWatchClientRequests({ driverId: user.id }, (requests) => {
      if (!requests) setSection(SectionList.WAITING);

      const notDoneRequests = requests.filter((item) => item.status !== "DONE");

      const waitingRequests = notDoneRequests.filter(
        (item) => item.status === "PENDING"
      );
      const takenRequests = notDoneRequests.filter(
        (item) => item.status === "TAKEN" || "ARRIVED"
      );

      setRequestsByClients(waitingRequests);
      setRequestsAccepted(takenRequests);
      console.log({ notDoneRequests });
    });

    // api().suscribeToWatchRequestsTakenDriverVersion(
    //   { driverId: user.id },
    //   ({ takenRequests }) => {
    //     setRequestsAccepted(takenRequests);
    //   }
    // );
  }, []);

  const updateUserLocation = (event) => {
    if (!event?.nativeEvent?.coordinate) return false;
    const location = event.nativeEvent.coordinate;
    if (isFocused) setUserLocation(location);
  };

  const setRequesToTaken = async (requestId) => {
    api().changeRequestStatus({ requestId, newStatus: "TAKEN" });
  };

  const setAlreadyArrived = () => {
    const requestId = currentClientDestination.clientId;
    api().changeRequestStatus({ requestId, newStatus: "ARRIVED" });
    setSection(sectionList.FILLING);
  };

  const setCharging = () => {
    const requestId = currentClientDestination.clientId;
    api().changeRequestStatus({ requestId, newStatus: "CHARGING" });
    setSection(sectionList.CHARGING);
  };

  const setRequestFinish = () => {
    const requestId = currentClientDestination.clientId;
    api().changeRequestStatus({ requestId, newStatus: "DONE" });
    setSection(sectionList.WAITING_FOR_REQUESTS);
  };

  const fill = async () => {
    setWaterToFilled(waterFilled + 1);
  };

  useEffect(() => {
    console.log("Lllenando");
    if (waterFilled >= waterToFill) {
      // clearInterval(reduceWater)
    }
  }, [waterFilled]);

  return (
    <View>
      {/* { requestsByClients.length > 0 && } */}
      {userLocation && requestsByClients.length > 0 && (
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
        userLocationUpdateInterval={150000}
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
      <BottomSheet ref={(ref) => (panelRef.current = ref)}>
        {section === sectionList.ARRIVED && (
          <Button title={"Llegué"} onPress={setAlreadyArrived} />
        )}

        {section === sectionList.WAITING_FOR_REQUESTS && (
          <Text>Esperando por clientes</Text>
        )}

        {section === sectionList.FILLING && (
          <>
            <Text>Llenar: {waterToFill}L</Text>
            <Text>Llenado: {waterFilled}L</Text>
            <Button title={"Llenar"} onPress={fill} />
            <Button title={"llenar más"} />
            <Button title={"Cobrar"} onPress={setCharging} />
          </>
        )}

        {section === sectionList.CHARGING && (
          <>
            <Text>Cobrando $200 pesos</Text>
            <Button title={"Terminar"} onPress={setRequestFinish} />
          </>
        )}

        {requestsByClients.map(({ quantity, id, status }) => {
          return (
            <Text key={id}>
              {quantity} {status}
            </Text>
          );
        })}
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
