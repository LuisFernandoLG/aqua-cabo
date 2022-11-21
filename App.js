import { Alert, StyleSheet, View } from "react-native";
import { Linking } from "react-native";

import { Router } from "./src/components/Router";
import { AuthProvider } from "./src/contexts/AuthContext";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { useEffect } from "react";
import { NetInfoProvider } from "./src/contexts/NetInfoContext";
let times = 0;

export default function App() {
  const AsyncAlert = async () =>
    new Promise((resolve) => {
      Alert.alert(
        "Alerta",
        `Necesitamos acceder a tu ubiación para el correcto funicionamiento`,
        [
          {
            text: "Aceptar",
            onPress: () => {
              resolve(true);
            },
          },
        ],
        { cancelable: false }
      );
    });

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      await AsyncAlert()
        .then(() => {
          times++;
          if (times > 1) {
            Linking.openSettings();
          } else {
            requestLocationPermission();
          }
        })
        .catch(() => {
          // BackHandler.exitApp();
        });
    }

    let location = await Location.getCurrentPositionAsync({});
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <AuthProvider>
      <NetInfoProvider>
        <StatusBar />
        <View style={styles.container}>
          <Router />
        </View>
      </NetInfoProvider>
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
