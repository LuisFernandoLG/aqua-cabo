import { Button } from "@rneui/base";
import { Text } from "@rneui/themed";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView from "react-native-maps";
import firebase from "../../database/firebase";
import { ModalX } from "../components/Modal";
import { useMapModal } from "../hooks/useMapModal";

const initialId = "rCL5Wdu63511w7PuxivX";

export const NotificationsScreen = ({ navigation }) => {
  const [text, setText] = useState("");
  const { openModal, closeModal, isOpen } = useMapModal();
  

  const loadData = async () => {
    const textRef = firebase.db.collection("texts").doc(initialId);
    const doc = await textRef.get();
    const textt = doc.data();
    setText(textt);
  };

  const loadDataRT = async () => {
    const suscriber = firebase.db
      .collection("texts")
      .doc(initialId)
      .onSnapshot((doc) => {
        const v = doc.data();
        console.log(v);
        setText(v);
      });

    return () => suscriber();
  };

  useEffect(() => {
    loadData();
    loadDataRT();
  }, []);

  const updateText = async () => {
    // try {
    //   const doc = firebase.db.collection("texts").doc(initialId)
    //   const res = doc.update({content:})
    // } catch (error) {
    // }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {/* <Mini clientPosition driverPosition handleAnswer isOpen>
      </Mini> */}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    width: "100%",
    height: "100%",
  },
});
