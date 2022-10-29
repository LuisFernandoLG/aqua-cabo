import { Alert, StyleSheet, View } from "react-native";

import { Router } from "./src/components/Router";
import { AuthProvider } from "./src/contexts/AuthContext";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { useEffect } from "react";

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

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
    }

    let location = await Location.getCurrentPositionAsync({});
    location;
  };
  useEffect(requestLocationPermission, []);

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
    backgroundColor: "red",
  },
});
