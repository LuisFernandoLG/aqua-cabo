import { StyleSheet, View } from "react-native";
import BottomSheet from "react-native-simple-bottom-sheet";

import MapView, { Marker } from "react-native-maps";
import { FlexContainer } from "../components/FlexContainer";
import { useEffect, useRef, useState } from "react";
import { RequestSheetContent } from "../components/userBottomSheetsClient/RequestSheetContent";
import { WaitingSheetContent } from "../components/userBottomSheetsClient/WatingSheetContent";
import { WelcomeSheetContent } from "../components/userBottomSheetsClient/WelcomeSheetContent";
import firebase from "../../database/firebase";

const initialRegion = {
  latitude: 22.945646,
  longitude: -109.943914,
  latitudeDelta: 1,
  longitudeDelta: 1,
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
  const [marker, setMarker] = useState(initialMarker);
  const [trucks, setTrucks] = useState([]);

  const loadData = async () => {
    const textRef = firebase.db.collection("truckLocations").doc();
    const doc = await textRef.get();
    const textt = doc.data();
    setText(textt);
  };

  const loadDataRT = async () => {
    const suscriber = firebase.db
      .collection("truckLocations")
      .onSnapshot((querySnapshot) => {
        let trucksArray = [];
        querySnapshot.docs.forEach((doc) => {
          // I need to know if it desapears when another screen is opened PENDING
          const { driverId, longitude, latitude } = doc.data();
          trucksArray.push({
            driverId,
            coordinate: { longitude, latitude },
            id: doc.id,
          });
        });

        setTrucks(trucksArray);
      });

    return () => suscriber();
  };

  useEffect(() => {
    loadDataRT();
  }, []);

  const panelRef = useRef(null);
  const [clientRequestSectionNum, setClientRequestSectionNum] = useState(
    clientRequests.HIDE
  );

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
    console.log({ clientRequestSectionNum });
  }, [clientRequestSectionNum]);

  useEffect(() => {
    console.log({ trucks });
  }, [trucks]);

  return (
    <View>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {trucks.map(({ id, driverId, coordinate }) => {
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
        <FlexContainer pdBottom={20}>
          {clientRequestSectionNum === clientRequests.HIDE && (
            <WelcomeSheetContent />
          )}

          {clientRequestSectionNum === clientRequests.REQUESTING && (
            <RequestSheetContent
              setSheetSectionToWaiting={setSheetSectionToWaiting}
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
