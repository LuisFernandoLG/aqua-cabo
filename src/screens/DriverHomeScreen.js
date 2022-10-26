import { StyleSheet, View } from "react-native";
import BottomSheet from "react-native-simple-bottom-sheet";

import MapView, { Marker } from "react-native-maps";
import { useEffect, useRef, useState } from "react";
import { RequestSheetContent } from "../components/userBottomSheetsClient/RequestSheetContent";
import { WaitingSheetContent } from "../components/userBottomSheetsClient/WatingSheetContent";
import { WelcomeSheetContent } from "../components/userBottomSheetsClient/WelcomeSheetContent";
import { FloatContainer } from "../components/FloatContainer";
import { Button, Text } from "@rneui/themed";
import firebase from "../../database/firebase";
import { useAuth } from "../hooks/useAuth";
import { useIsFocused } from "@react-navigation/native";
import { useMapModal } from "../hooks/useMapModal";
import { ModalX } from "../components/Modal";
import { api } from "../services/api";
import { GOOGLE_MAPS_APIKEY } from "@env";
import MapViewDirections from "react-native-maps-directions";
import { getRegionForCoordinates } from "../helpers/getRegionForCoordinates";

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

const clientRequests = {
  HIDE: 0,
  REQUESTING: 1,
  WAITING: 2,
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

  useEffect(() => {
    console.log("asignando");
    if (requestsAccepted.length > 0 && userLocation) {
      console.log({ mostrando: requestsAccepted[0] });
      setCurrentClientDestination(requestsAccepted[0]);
      const r = formatCurretRegion(requestsAccepted[0]);
      setCurrentRegion(r);
    }
  }, [requestsAccepted]);

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
  const [clientRequestSectionNum, setClientRequestSectionNum] = useState(
    clientRequests.HIDE
  );

  const sendCurrentLocationToDb = async () => {
    if (!user) return false;
    await api().sendDriverCoordsToDb({
      driverId: user.id,
      newCoords: userLocation,
    });
  };

  const onDisconnect = async () => {
    // const ref = await firebase.firebase.database().ref(`truckLocations/${user.id}`)
    // const ref = await firebase.firebase.database().ref(`.info/connected`)
    // console.log({res: res[0].f})
  };

  useEffect(() => {
    if (userLocation) {
      sendCurrentLocationToDb();
    }
  }, [userLocation]);

  useEffect(() => {
    console.log({ user });

    api().suscribeToClienRequests({ driverId: user.id }, () => {
      console.log("suscriber!!!");
    });

    api().suscribeToWatchClientRequests(
      { driverId: user.id },
      ({ requests }) => {
        setRequestsByClients(requests);
        console.log({ requests });
      }
    );

    api().suscribeToWatchRequestsTakenDriverVersion(
      { driverId: user.id },
      ({ takenRequests }) => {
        setRequestsAccepted(takenRequests);
      }
    );
  }, []);

  const updateUserLocation = (event) => {
    if (!event?.nativeEvent?.coordinate) return false;
    const location = event.nativeEvent.coordinate;
    if (isFocused) setUserLocation(location);
  };

  const setSheetSectionToRequesting = () => {
    addBusToFireStore();
    panelRef.current.togglePanel();
    if (clientRequestSectionNum === clientRequests.HIDE)
      setClientRequestSectionNum(clientRequests.REQUESTING);
  };

  const setSheetSectionToWaiting = () => {
    if (clientRequestSectionNum === clientRequests.REQUESTING)
      setClientRequestSectionNum(clientRequests.WAITING);
  };

  const cancellRequest = () => {
    if (clientRequestSectionNum === clientRequests.WAITING)
      setClientRequestSectionNum(clientRequests.HIDE);
  };

  useEffect(() => {
    // console.log({ clientRequestSectionNum });
  }, [clientRequestSectionNum]);

  const setRequesToTaken = async (requestId) => {
    api().setRequestToTaken({ requestId });
  };

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
          setRequesToTaken={setRequesToTaken}
        />
      )}

      {/* Mapa principal -------------------------- */}
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        region={currentRegion}
        showsUserLocation={true}
        onUserLocationChange={updateUserLocation}
        userLocationUpdateInterval={15000}
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
        {userLocation && (
          <Text>
            {/* longitude: {userLocation.longitude}, latitude:{" "} */}
            {userLocation.latitude},
          </Text>
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
