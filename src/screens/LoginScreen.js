import { useNavigation } from "@react-navigation/native";
import { Button } from "@rneui/base";
import { Image, Input, Text } from "@rneui/themed";
import { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { FlexContainer } from "../components/FlexContainer";
import { useAuth } from "../hooks/useAuth";
import firebase from "../../database/firebase";

export const LoginScreen = () => {
  const [email, setEmail] = useState("jesus@gmail.com");
  const [password, setPassword] = useState("123");
  const [isLoading, setIsLoading] = useState(null);
  const [errors, setErrors] = useState(null);

  const { isLogged, login: loginOnDb } = useAuth();
  const navigation = useNavigation();

  const goToSignUpScreen = () => {
    navigation.navigate("SignUp");
  };

  const goToLoginDriverScreen = () => {
    navigation.navigate("DriverLogin");
  };

  useEffect(() => {
    if (isLogged) navigation.navigate("Home");
  }, [isLogged]);

  const login = async () => {
    let user = {};
    setIsLoading(true);
    if (!email && !login) return false;

    try {
      const querySnapshot = await firebase.db
        .collection("users")
        .where("email", "==", email)
        .where("password", "==", password)
        .get();

      querySnapshot.forEach((doc) => {
        user = { ...doc.data(), id: doc.id };
      });

      if (querySnapshot.empty)
        throw new Error("El correo o contraseña son incorrectos");

      console.log({ user });

      if (user.type === "DRIVER")
        throw new Error("Lo sentimos, pero no eres un cliente");
      loginOnDb({ user });
    } catch (error) {
      setErrors(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* <Button title={"HOli"} onPress={() => alert("Holi")} /> */}
      {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
      <View style={styles.inner}>
        <FlexContainer flex_jc_c flex_ai_c pdHorizontal={50}>
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={require("../../assets/logo.png")}
            />
          </View>
          <FlexContainer mVertical={20} flex_jc_c flex_ai_c>
            <Text h3>Bievenido</Text>
            <Text>Ingresa con tu cuenta de cliente</Text>
          </FlexContainer>
          <Input
            keyboardType="email-address"
            placeholder="Correo"
            value={email}
            onChangeText={(value) => setEmail(value)}
          />

          <Input
            keyboardType="visible-password"
            placeholder="Contraseña"
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
              isLoading={isLoading}
            />
            <Button
              title="Registrarse"
              titleStyle={{ color: "black" }}
              onPress={goToSignUpScreen}
              buttonStyle={{ backgroundColor: "rgba(244, 244, 244, 1)" }}
              containerStyle={styles.middleBtn}
            />
            <Button
              title="Soy conductor"
              type="clear"
              onPress={goToLoginDriverScreen}
              containerStyle={styles.middleBtn}
            />
          </FlexContainer>
        </FlexContainer>
      </View>
      {/* </TouchableWitmehoutFeedback> */}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 200,
    height: 110,
    resizeMode: "contain",
  },
  description: {
    // lineHeight: 25,
    textAlign: "center",
  },
  container: {
    // borderWidth:2,
    // borderColor:"red",
    flex: 1,
    justifyContent: "center",
  },
  inner: {
    marginBottom: Platform.OS === "ios" ? 0 : 80,
    justifyContent: "space-around",
  },
  errorMsg: {
    color: "red",
  },
  middleBtn: {
    marginVertical: 10,
  },
});
