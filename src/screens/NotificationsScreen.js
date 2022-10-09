import { Button } from "@rneui/base";
import { Text } from "@rneui/themed";
import { useEffect, useState } from "react";
import { View } from "react-native";
import firebase from "../../database/firebase";

const initialId = "rCL5Wdu63511w7PuxivX";

export const NotificationsScreen = ({ navigation }) => {
  const [text, setText] = useState("");

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
      <Button onPress={() => navigation.goBack()} title="Go back home" />
      <Text>{text.content}</Text>
    </View>
  );
};
