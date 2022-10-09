import firebase from "../../database/firebase";
import { Image, Input, Button, Text } from "@rneui/themed";
import React, { useEffect, useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { FlexContainer } from "../components/FlexContainer";
import { useAuth } from "../hooks/useAuth";
import { useNavigation } from "@react-navigation/native";

export const DriverLoginScreen = () => {
  const [email, setEmail] = useState("luis@gmail.com");
  const [password, setPassword] = useState("nomelase.com");
  const [isLoading, setIsLoading] = useState(null);
  const [errors, setErrors] = useState(null);

  const { isLogged, login: loginOnDb } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (isLogged) navigation.navigate("DriverHome");
  }, [isLogged]);

  const login = async () => {
    if (!email && !login) return false;

    const querySnapshot = await firebase.db
      .collection("users")
      .where("email", "==", email)
      .where("password", "==", password)
      .get();

    let user = {};
    querySnapshot.forEach((doc) => {
      user = { ...doc.data(), id: doc.id };
    });

    if (!querySnapshot.empty) {
      loginOnDb({ user });
      navigation.navigate("DriverHome");
    } else {
      setErrors("El correo o contraseña son incorrectos");
    }
  };
  const goToSignUpScreen = () => {};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <FlexContainer flex_jc_c flex_ai_c pdHorizontal={50}>
            <View style={styles.logoContainer}>
              <Image
                style={styles.logo}
                source={require("../../assets/logo.png")}
              />
            </View>
            <Text h3>Bievenido deveulta</Text>
            <Text style={styles.subtitle}>
              Ingresa con tu cuenta de conductor
            </Text>
            <Input
              keyboardType="email-address"
              placeholder="Correo"
              value={email}
              inputStyle={styles.input}
              onChangeText={(value) => setEmail(value)}
            />

            <Input
              placeholder="Contraseña"
              secureTextEntry={true}
              inputStyle={styles.input}
              containerStyle={styles.inputContainer}
              value={password}
              onChangeText={(value) => setPassword(value)}
            />

            <FlexContainer>
              <Text style={styles.errorMsg}>{errors || ""}</Text>
            </FlexContainer>

            <Button
              title="Iniciar sesión"
              onPress={login}
              loading={isLoading}
              containerStyle={{
                width: 200,
                marginHorizontal: 50,
                marginVertical: 10,
              }}
            />
            <Button
              title="Registrarse"
              type="clear"
              onPress={goToSignUpScreen}
            />
          </FlexContainer>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    marginBottom: 80,
    justifyContent: "space-around",
  },
  logo: {
    width: 220,
    height: 130,
    resizeMode: "contain",
  },
  logoContainer: {
    marginBottom: 0,
    // borderColor: "#000",
    // borderWidth: 2,
    paddingVertical: 40,
  },
  title: {},

  subtitle: {
    marginBottom: 10,
  },
  errorMsg: {
    color: "red",
  },
  input: {
    backgroundColor: "#fff",

    padding: 10,
  },
  inputContainer: {
    borderWidth: 0,
  },
});
