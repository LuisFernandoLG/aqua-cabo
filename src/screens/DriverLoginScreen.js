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
import { api } from "../services/api";

export const DriverLoginScreen = () => {
  const [email, setEmail] = useState("iram@cabo.com");
  const [password, setPassword] = useState("12345678");
  const [isLoading, setIsLoading] = useState(null);
  const [errors, setErrors] = useState(null);

  const { isLogged, login: loginLocally, user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (isLogged && user.type === "DRIVER") navigation.navigate("DriverHome");
  }, [isLogged]);

  const login = async () => {
    setErrors("")
    setIsLoading(true);
    if (!email && !login) return false;

    api()
      .login({ email, password })
      .then((authUser) => {
        console.log({ authUser });
        loginLocally({ user: authUser });
      })
      .catch(() => {
        setErrors("Correo o contraseña incorrectos");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const goToSignUpScreen = () => {
    navigation.navigate("SignUpDriver");

  };
  const goToClientLoginScreen = () => {
    navigation.navigate("login");
  };

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
            <FlexContainer mVertical={20} flex_jc_c flex_ai_c>
              <Text h3>Bienvenido</Text>
              <Text>Ingresa con tu cuenta de conductor</Text>
            </FlexContainer>
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

            <FlexContainer flex_jc_c>
              <Button
                title="Iniciar sesión"
                onPress={login}
                loading={isLoading}
              />

              <Button
                title="Registrarse"
                titleStyle={{ color: "black" }}
                onPress={goToSignUpScreen}
                buttonStyle={{ backgroundColor: "rgba(244, 244, 244, 1)" }}
                containerStyle={styles.middleBtn}
              />

              <Button
                title="Soy Cliente"
                type="clear"
                onPress={goToClientLoginScreen}
              />
            </FlexContainer>
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
  },
  title: {},

  subtitle: {
    // marginBottom: 10,
  },
  errorMsg: {
    color: "red",
  },
  input: {
    backgroundColor: "#fff",

    // padding: 10,
  },
  inputContainer: {
    borderWidth: 0,
  },
  middleBtn: {
    marginVertical: 10,
  },
});
