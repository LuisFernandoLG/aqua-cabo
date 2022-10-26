import { StyleSheet, View } from "react-native";
import BottomSheet from "react-native-simple-bottom-sheet";

import MapView, { Marker } from "react-native-maps";
import { FlexContainer } from "../components/FlexContainer";
import { useEffect, useRef, useState } from "react";
import { RequestSheetContent } from "../components/userBottomSheetsClient/RequestSheetContent";
import { WaitingSheetContent } from "../components/userBottomSheetsClient/WatingSheetContent";
import { WelcomeSheetContent } from "../components/userBottomSheetsClient/WelcomeSheetContent";
import firebase from "../../database/firebase";
import { useIsFocused } from "@react-navigation/native";
import { GOOGLE_MAPS_APIKEY } from "@env";
import MapViewDirections from "react-native-maps-directions";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";

const initialRegion = {
  latitude: 22.945646,
  longitude: -109.943914,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const initialMarker = {
  key: 1,
  coordinate: {
    longitude: -109.94538756232878,
    latitude: 22.944967420710498,
  },
  title: "Pipa 1",
  description: "Esta es la pipa número 1",
};

const clientRequests = {
  HIDE: 0,
  REQUESTING: 1,
  WAITING: 2,
};

export const HomeScreen = ({ navigation }) => {
  const [region, setRegion] = useState(initialRegion);
  const [marker, setMarker] = useState(initialMarker);
  const [trucks, setTrucks] = useState([]);
  const [userLocation, setUserLocation] = useState({});
  const [destination, setDestination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [requestAccepted, setRequestAccepted] = useState(null);
  const [truckRequestAccepted, setTruckRequestAccepted] = useState(null);

  const panelRef = useRef(null);
  const [clientRequestSectionNum, setClientRequestSectionNum] = useState(
    clientRequests.REQUESTING
  );

  const isFocused = useIsFocused();
  let mapRef = useRef(null);

  // Un screen no llama a su clenup después de que se cambia de pantalla, por lo que el ciclo de vida normal de un componente en react native cambia un poco con esta clase de componentes
  // A su vez, la documentación recomienda usar el hooj useIsFocussed para sabre si está siendo mostrada la patanlla o no
  useEffect(() => {
    updateUserLocation(userLocation);
  }, [userLocation]);

  useEffect(() => {
    api().suscribeToWatchTruckLocations(({ trucksArray }) => {
      // console.log({ trucksArray });
      setTrucks(trucksArray);
    });

    api().suscribeToPendingRequestsClientVersion(
      { clientId: user.id },
      ({ pendingRequests }) => {
        console.log({ vic: pendingRequests.length });
        if (pendingRequests.length > 0) {
          console.log("EXISTEN REQUESTS PENDIENTES");
          setIsLoading(true);
        }
      }
    );

    api().suscribeToWatchRequestsTakenClientVersion(
      { clientId: user.id },
      ({ takenRequests }) => {
        if (!takenRequests) return false;
        if (takenRequests.length === 0) return false;
        setIsLoading(false);
        setRequestAccepted(takenRequests[0]);
        const truckFound = trucks.find(
          ({ driverId }) => driverId === takenRequests[0].driverId
        );

        setTruckRequestAccepted(truckFound);

        // Cuando carga, si hay pedidos, cambiará de estado, sino no.
        setSheetSectionToWaiting(200);
      }
    );
  }, [userLocation]);

  const setSheetSectionToRequesting = () => {
    addBusToFireStore();
    panelRef.current.togglePanel();
    if (clientRequestSectionNum === clientRequests.HIDE)
      setClientRequestSectionNum(clientRequests.REQUESTING);
  };

  const requestWater = () => {
    api().sendRequestToCloserDriver({
      clientId: user.id,
      clientCoords: userLocation,
      waterQuantity: 200,
      trucks,
    });
    setIsLoading(true)
  };

  const setSheetSectionToWaiting = async (waterQuantity) => {
    if (clientRequestSectionNum === clientRequests.REQUESTING)
      setClientRequestSectionNum(clientRequests.WAITING);
  };

  const cancellRequest = () => {
    if (clientRequestSectionNum === clientRequests.WAITING)
      setClientRequestSectionNum(clientRequests.HIDE);
  };

  useEffect(() => {}, [clientRequestSectionNum]);

  const relocateView = () => {
    // if (!myLocation) return false;

    const lat = myLocation?.coords?.latitude || initialRegion.latitude;
    const long = myLocation?.coords?.longitude || initialRegion.longitude;
    setRegion({
      latitude: lat,
      longitude: long,
    });

    mapRef.current.animateToRegion({
      latitude: lat,
      longitude: long,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    });
  };

  const updateUserLocation = (event) => {
    if (!event?.nativeEvent?.coordinate) return false;
    const location = event.nativeEvent.coordinate;

    if (isFocused) setUserLocation(location);
  };

  useEffect(() => {
    if (userLocation)
      api().sendClientCoordsToDb({
        cliendId: user.id,
        newCoords: userLocation,
      });
  }, [userLocation]);

  return (
    <View>
      <MapView
        style={styles.map}
        initialRegion={region}
        // ref={mapRef}
        // onRegionChange={(region) => setRegion(region)}
        // region={region}
        showsUserLocation={true}
        userLocationUpdateInterval={10000}
        onUserLocationChange={updateUserLocation}
      >
        {truckRequestAccepted && (
          <>
            <Marker
              key={truckRequestAccepted.driverId}
              coordinate={truckRequestAccepted.coordinate}
              title={truckRequestAccepted.driverId}
              description={"any description"}
              image={require("../../assets/bus.png")}
            ></Marker>

            {/*  */}
            <MapViewDirections
              strokeWidth={3}
              origin={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              destination={truckRequestAccepted.coordinate}
              apikey={GOOGLE_MAPS_APIKEY}
            />
          </>
        )}
        {!truckRequestAccepted &&
          trucks.map(({ id, driverId, coordinate }) => {
            console.log({ id, driverId, truckRequestAccepted });
            return (
              <Marker
                key={driverId}
                coordinate={coordinate}
                title={id}
                description={"any description"}
                image={require("../../assets/bus.png")}

                // onPress={setSheetSectionToRequesting}
              />
            );
          })}
      </MapView>
      <BottomSheet ref={(ref) => (panelRef.current = ref)}>
        <FlexContainer pdBottom={50}>
          {clientRequestSectionNum === clientRequests.HIDE && (
            <WelcomeSheetContent />
          )}

          {clientRequestSectionNum === clientRequests.REQUESTING && (
            <RequestSheetContent
              setSheetSectionToWaiting={requestWater} 
              isLoading={isLoading}
            />
          )}

          {clientRequestSectionNum === clientRequests.WAITING && (
            <WaitingSheetContent cancellRequest={cancellRequest} />
          )}
        </FlexContainer>
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
