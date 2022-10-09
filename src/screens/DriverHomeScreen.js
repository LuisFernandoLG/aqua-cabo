import { StyleSheet, View } from "react-native";
import BottomSheet from "react-native-simple-bottom-sheet";

import MapView, { Marker } from "react-native-maps";
import { FlexContainer } from "../components/FlexContainer";
import { useEffect, useRef, useState } from "react";
import { RequestSheetContent } from "../components/userBottomSheetsClient/RequestSheetContent";
import { WaitingSheetContent } from "../components/userBottomSheetsClient/WatingSheetContent";
import { WelcomeSheetContent } from "../components/userBottomSheetsClient/WelcomeSheetContent";
import { FloatContainer } from "../components/FloatContainer";
import { Button, Text } from "@rneui/themed";
import { useUserLocation } from "../hooks/useUserLocation";
import firebase from "../../database/firebase";
import { useAuth } from "../hooks/useAuth";
import { useIsFocused } from "@react-navigation/native";

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
  const { myLocation, suscribeOnSharingLocation, unsuscribeOnSharingLocation } =
    useUserLocation();
  const { user, isLogged } = useAuth();
  const isFocused = useIsFocused();

  // Un screen no llama a su clenup después de que se cambia de pantalla, por lo que el ciclo de vida normal de un componente en react native cambia un poco con esta clase de componentes
  // A su vez, la documentación recomienda usar el hooj useIsFocussed para sabre si está siendo mostrada la patanlla o no
  useEffect(() => {
    if (isFocused) suscribeOnSharingLocation();
    else unsuscribeOnSharingLocation();
  }, [isFocused]);

  useEffect(() => {
    console.log({ user, isLogged });
  }, [user, isLogged]);

  const panelRef = useRef(null);
  const [clientRequestSectionNum, setClientRequestSectionNum] = useState(
    clientRequests.HIDE
  );

  const sendCoords = async () => {
    // const truck = {
    //   driverId: user.id,
    //   longitude: myLocation.longitude,
    //   latitude: myLocation.latitude,
    // };
    // const truckRef = firebase.db.collection("truckLocations").doc();
    // await truckRef.set(truck);
  };

  useEffect(() => {
    // if (myLocation) sendCoords();
  }, [myLocation]);

  const testing = async () => {
    if (!user) return false;
    const truck = {
      driverId: user.id,
      longitude: myLocation.coords.longitude,
      latitude: myLocation.coords.latitude,
    };
    try {
      console.log({ truck });
      const truckRef = await firebase.db
        .collection("truckLocations")
        .doc(truck.driverId)
        .set(truck);
    } catch (error) {
      console.log({ errorRR: error });
    }
  };

  useEffect(() => {
    testing();
  }, [myLocation]);

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

  useState(() => {
    console.log({ LUIS: myLocation });
  }, [myLocation]);

  useEffect(() => {
    console.log({ clientRequestSectionNum });
  }, [clientRequestSectionNum]);

  return (
    <View>
      <FloatContainer top={0} right={0}>
        <Button
          title="Holis"
          containerStyle={{
            width: 60,
          }}
        />
      </FloatContainer>
      <MapView style={styles.map} initialRegion={initialRegion}>
        <Marker
          coordinate={marker.coordinate}
          title={marker.title}
          description={marker.description}
          image={require("../../assets/bus.png")}
        />
        {myLocation && (
          <Marker
            title={"Yo"}
            coordinate={{
              longitude: myLocation.coords.longitude,
              latitude: myLocation.coords.latitude,
            }}
          />
        )}
      </MapView>
      <BottomSheet ref={(ref) => (panelRef.current = ref)}>
        {myLocation && (
          <Text>
            longitude: {myLocation.coords.longitude}, latitude:{" "}
            {myLocation.coords.latitude},
          </Text>
        )}
        <Text>Holi</Text>
        <Text>Holi</Text>
        <Text>Holi</Text>
        <Text>Holi</Text>
        <Text>Holi</Text>
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
