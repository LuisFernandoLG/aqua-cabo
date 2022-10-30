import { StyleSheet, View } from "react-native";
import BottomSheet from "react-native-simple-bottom-sheet";

import MapView, { Marker } from "react-native-maps";
import { FlexContainer } from "../components/FlexContainer";
import { useEffect, useRef, useState } from "react";
import { RequestSheetContent } from "../components/userBottomSheetsClient/RequestSheetContent";
import { WaitingSheetContent } from "../components/userBottomSheetsClient/WatingSheetContent";
import { WelcomeSheetContent } from "../components/userBottomSheetsClient/WelcomeSheetContent";
import { useIsFocused } from "@react-navigation/native";
import { GOOGLE_MAPS_APIKEY } from "@env";
import MapViewDirections from "react-native-maps-directions";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { AvailableTruckGroup } from "../components/AvailableTruckGroup";
import { Button, Text } from "@rneui/themed";
import { Platform } from "react-native";

const sectionList = {
  PENDING: "PENDING",
  WAITING_FOR_REQUESTS: "WAITING_FOR_REQUESTS",
  TAKEN: "TAKEN",
  ARRIVED: "ARRIVED",
  CHARGING: "CHARGING",
};

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
  LOOKING: 2,
  WAITING: 3,
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
  const [currentRequest, setCurrentRequest] = useState(null);
  const [expectedTime, setExpectedTime] = useState(0);
  const [expectedDistance, setExpectedDistance] = useState(0);

  const panelRef = useRef(null);
  const [clientRequestSectionNum, setClientRequestSectionNum] = useState(
    clientRequests.REQUESTING
  );

  const isFocused = useIsFocused();
  let mapRef = useRef(null);

  // Un screen no llama a su clenup después de que se cambia de pantalla, por lo que el ciclo de vida normal de un componente en react native cambia un poco con esta clase de componentes
  // A su vez, la documentación recomienda usar el hooj useIsFocussed para sabre si está siendo mostrada la patanlla o no

  useEffect(() => {
    if (currentRequest) {
      if (currentRequest.status === "PENDING") setIsLoading(true);
      if (currentRequest.status === "TAKEN") {
        setRequestAccepted(currentRequest);
      }
    }
  }, [currentRequest]);

  useEffect(() => {
    api().suscribeToWatchTruckLocations((array) => {
      if (array) setTrucks(array);
    });

    api().suscibeToRequestChanges({ clientId: user.id }, (request) => {
      if (request.length === 0) {
        setCurrentRequest(null);
        setIsLoading(false);
        setTruckRequestAccepted(null);
        return null;
      }
      if (request.status === "DONE") {
        saveRequest({ request });
        setCurrentRequest(null);
        setIsLoading(false);
      } else {
        assignTruck({ request });
        setCurrentRequest(request);
      }
    });
  }, []);

  const saveRequest = async ({ request }) => {
    await api().saveClientRequest({
      clientId: user.id,
      request: request,
    });

    await api().removeClientRequest({ requestId: user.id });
    console.log("borrado y removido con exito");
  };

  const requestWater = async (water) => {
    setIsLoading(true);
    api().sendRequestToCloserDriver({
      clientId: user.id,
      clientCoords: userLocation,
      waterQuantity: parseInt(water),
      trucks,
    });
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
    if (userLocation) {
      api().sendClientCoordsToDb({
        cliendId: user.id,
        newCoords: userLocation,
      });
    }
  }, [userLocation]);

  const assignTruck = ({ request }) => {
    const t = trucks.find((item) => item.driverId === request.driverId);
    setTruckRequestAccepted(t);
  };
  return (
    <View>
      <MapView
        style={styles.map}
        initialRegion={region}
        // ref={mapRef}
        // onRegionChange={(region) => setRegion(region)}
        // region={region}
        showsUserLocation={true}
        userLocationUpdateInterval={15000}
        onUserLocationChange={updateUserLocation}
      >
        {truckRequestAccepted && (
          <>
            <Marker
              key={truckRequestAccepted.driverId}
              coordinate={{
                longitude: truckRequestAccepted.longitude,
                latitude: truckRequestAccepted.latitude,
              }}
              title={truckRequestAccepted.driverId}
              description={"any description"}
              image={require("../../assets/bus.png")}
            ></Marker>

            <MapViewDirections
              strokeWidth={3}
              origin={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              destination={{
                longitude: truckRequestAccepted.longitude,
                latitude: truckRequestAccepted.latitude,
              }}
              apikey={GOOGLE_MAPS_APIKEY}
              onReady={(result) => {
                setExpectedDistance(result.distance);
                setExpectedTime(result.duration);
              }}
            />
          </>
        )}
        {trucks && !truckRequestAccepted && (
          <AvailableTruckGroup trucks={trucks} />
        )}
      </MapView>

      <BottomSheet ref={(ref) => (panelRef.current = ref)}>
        <FlexContainer pdBottom={50}>
          {!currentRequest ? (
            <>
              <RequestSheetContent
                setSheetSectionToWaiting={requestWater}
                isLoading={isLoading}
              />
            </>
          ) : (
            <>
              {currentRequest.status === sectionList.PENDING && (
                <>
                  <Text style={{ textAlign: "center", marginBottom: 5 }} h4>
                    Buscando pipa
                  </Text>
                  <FlexContainer flex_ai_c>
                    <Button title="Solicitar pedido" loading={isLoading} />
                  </FlexContainer>
                </>
              )}

              {currentRequest.status === sectionList.TAKEN && (
                <WaitingSheetContent
                  currentRequest={currentRequest}
                  expectedDistance={expectedDistance}
                  expectedTime={expectedTime}
                />
              )}

              {currentRequest.status === sectionList.ARRIVED && (
                <>
                  <Text style={{textAlign:"center"}} h4>El camión ha llegado</Text>
                  <Text style={{textAlign:"center"}} h5>Prepara tus contenedores</Text>
                </>
              )}

              {currentRequest.status === sectionList.CHARGING && (
                <>
                  <Text style={{textAlign:"center"}} h4>Por favor pague al chofer</Text>
                  <Text style={{textAlign:"center"}} h4>$200</Text>

                </>
              )}
            </>
          )}
        </FlexContainer>
        {Platform.OS === "ios" ? (
          <View style={{ marginBottom: 40 }}></View>
        ) : (
          <View style={{ marginBottom: 20 }}></View>
        )}
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
