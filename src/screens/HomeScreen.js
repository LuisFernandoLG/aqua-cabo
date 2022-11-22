import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
import BottomSheet from "react-native-simple-bottom-sheet";

import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
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
import { getTimestampInSeconds } from "../helpers/getTimeStampInSeconds";
import { useContext } from "react";
import { netInfoContext } from "../contexts/NetInfoContext";
import { Icon } from "@rneui/themed";
import { Alert } from "react-native";
import { Loader } from "../components/Loader";
import { locationConstants } from "../constants/locationConstants";
import { SectionList } from "react-native";
import { useFirebase } from "../hooks/useFirebase";

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

const initialTrucks = [];
const initialUserLocation = {};

export const HomeScreen = ({ navigation }) => {
  const [region, setRegion] = useState(initialRegion);
  const [userLocation, setUserLocation] = useState(initialUserLocation);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [trucks, setTrucks] = useState(initialTrucks);
  const [truckRequestAccepted, setTruckRequestAccepted] = useState(null);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [expectedTime, setExpectedTime] = useState(0);
  const [expectedDistance, setExpectedDistance] = useState(0);
  const { isConnected: isConnectedToInternet } = useContext(netInfoContext);

  const { allTrucks, removeListeners, listenToTrucks, listenToRequestChanges } =
    useFirebase();

  const panelRef = useRef(null);

  let isFocused = useIsFocused();
  let mapRef = useRef(null);

  const startToListenChanges = () => {
    listenToRequestChanges({ clientId: user.id }, (request) => {
      if (request?.length === 0) {
        setCurrentRequest(null);
        setIsLoading(false);
        setTruckRequestAccepted(null);
        return null;
      }

      if (request.status === "CANCELLED") {
        saveRequest({ request });
        setCurrentRequest(null);
        setIsLoading(false);
        alert("¡La solicitud fue cancelada!");
        return null;
      }
      if (request.status === "DONE") {
        saveRequest({ request });
        setCurrentRequest(null);
        setIsLoading(false);
        return null;
      }
      if (request.status === "TAKEN") {
        assignTruck({ request });
        setCurrentRequest(request);
        return null;
      } else {
        setCurrentRequest(request);
      }
    });
  };

  useEffect(() => {
    if (isFocused) {
      listenToTrucks();
      startToListenChanges();
    } else {
      removeListeners();
    }
  }, [isFocused]);

  const getActiveTrucks = (array, timeTolerance) => {
    const newTrucks = [];

    array.forEach((element) => {
      const now = getTimestampInSeconds();
      const isOnline = element?.isOnline;
      let diff = (now - element.lastStatus) / 60000;
      if (diff <= 0.1 && isOnline) newTrucks.push(element);

    });

    return newTrucks;
  };

  const cancellRequest = async () => {
    const requestId = user.id;
    await api().changeRequestStatus({ requestId, newStatus: "CANCELLED" });
  };

  useEffect(() => {
    if (allTrucks.length > 0) {
      const newTrucks = getActiveTrucks(allTrucks, 1);
      setTrucks(newTrucks);
    }
  }, [allTrucks]);

  useEffect(() => {}, [isFocused]);

  const saveRequest = async ({ request }) => {
    await api().saveClientRequest({
      clientId: user.id,
      request: request,
    });

    await api().removeClientRequest({ requestId: user.id });
  };

  const showMessage = () =>
    new Promise((resolve) => {
      Alert.alert(
        "Oops",
        "Parece que no hay pipas disponibles",
        [
          {
            text: "Aceptar",
            onPress: () => {
              resolve("YES");
            },
          },
        ],
        { cancelable: false }
      );
    });

  const requestWater = async (water) => {
    if (trucks.length === 0) return showMessage();
    else {
      setIsLoading(true);
      api()
        .sendRequestToCloserDriver({
          clientId: user.id,
          clientCoords: userLocation,
          waterQuantity: parseInt(water),
          trucks,
          user:user
        })
        .catch((error) => {
          alert(error);
        });
    }
  };

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
    if (userLocation && user && isFocused) {
      setTrucks(getActiveTrucks(trucks, 0.5));
      api()
        .sendClientCoordsToDb({
          cliendId: user.id,
          newCoords: userLocation,
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [userLocation]);

  const assignTruck = () => {
    if (currentRequest) {
      const t = allTrucks.find(
        (item) => item.driverId === currentRequest.driverId
      );
      if (t) setTruckRequestAccepted(t);
    }
  };

  useEffect(() => {
    if (trucks && currentRequest) assignTruck();
  }, [currentRequest]);



  if (!isFocused) return null;

  return (
    <View>
      <MapView
        style={styles.map}
        initialRegion={region}
        // ref={mapRef}
        // onRegionChange={(region) => setRegion(region)}
        // region={region}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        userLocationUpdateInterval={locationConstants.clientLocationUpdateSpeed}
        userLocationFastestInterval={
          locationConstants.clientLocationUpdateSpeed
        }
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
              description={`${truckRequestAccepted.waterQuantity}L`}
              image={require("../../assets/bus.png")}
            ></Marker>

            {currentRequest?.status !== "PENDING" ? (
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
            ) : null}
          </>
        )}
        {/* {trucks && !truckRequestAccepted && (
          )} */}
        <AvailableTruckGroup trucks={trucks} />
      </MapView>

      {/* <ScrollView> */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.bsheet}>
          <BottomSheet ref={(ref) => (panelRef.current = ref)}>
         
            {isConnectedToInternet ? (
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
                        <Text
                          style={{ textAlign: "center", marginBottom: 5 }}
                          h4
                        >
                          Buscando pipa
                        </Text>
                        <FlexContainer flex_ai_c>
                          <Loader />
                        </FlexContainer>
                      </>
                    )}

                    {currentRequest.status === sectionList.TAKEN && (
                      <WaitingSheetContent
                        currentRequest={currentRequest}
                        expectedDistance={expectedDistance}
                        expectedTime={expectedTime}
                        cancellRequest={cancellRequest}
                      />
                    )}

                    {currentRequest.status === sectionList.ARRIVED && (
                      <>
                        <Text style={{ textAlign: "center" }} h4>
                          El camión ha llegado
                        </Text>
                        <Text style={{ textAlign: "center" }} h5>
                          Prepara tus contenedores
                        </Text>
                      </>
                    )}

                    {currentRequest.status === sectionList.CHARGING && (
                      <>
                        <Text style={{ textAlign: "center" }} h4>
                          Por favor pague al chofer
                        </Text>
                        <Text style={{ textAlign: "center" }} h4>
                          $200
                        </Text>
                      </>
                    )}
                  </>
                )}
              </FlexContainer>
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
        </View>
      </KeyboardAvoidingView>
      {/* </ScrollView> */}
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
  noInternet: {
    fontSize: 20,
    textAlign: "center",
  },
  bsheet: {
    zIndex: 100,
  },
});
