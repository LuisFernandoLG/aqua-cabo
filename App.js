import * as Location from "expo-location";
import { useEffect } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { Router } from "./src/components/Router";
import { AuthProvider } from "./src/contexts/AuthContext";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import {BleManager} from "react-native-ble-plx"

const manager = new BleManager()

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const MESSAGE_UUID = '6d68efe5-04b6-4a85-abc4-c2670b7bf7fd';

export default function App() {

  const AsyncAlert = async () =>
    new Promise((resolve) => {
      Alert.alert(
        "Alerta",
        "Necesitamos acceder a tu ubiación para el correcto funicionamiento",
        [
          {
            text: "ok",
            onPress: () => {
              resolve("YES");
            },
          },
        ],
        { cancelable: false }
      );
    });

  return (
    <AuthProvider>
      <StatusBar />
      <View style={styles.container}>
        <Router />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
  },
  statusBar: {
    backgroundColor:"red"
  },
});
