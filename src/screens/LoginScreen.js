import { useNavigation } from "@react-navigation/native";
import { Button } from "@rneui/base";
import { Image, Input } from "@rneui/themed";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { FlexContainer } from "../components/FlexContainer";

export const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigation = useNavigation();

  const goToSignUpScreen = () => {
    navigation.navigate("SignUp");
  };

  const goToHomeScreen = () => {
    navigation.navigate("Home");
  };

  return (
    <FlexContainer flex_ai_c mVertical={100} mHorizontal={40}>
      <Image style={styles.logo} source={require("../../assets/logo.png")} />
      <Input
        keyboardType="email-address"
        placeholder="Correo"
        onChangeText={(value) => setEmail(value)}
      />

      <Input
        keyboardType="visible-password"
        placeholder="Contraseña"
        onChangeText={(value) => setPassword(value)}
      />
      <Button title="Iniciar sesión" onPress={goToHomeScreen} />
      <Button title="Registrarse" type="clear" onPress={goToSignUpScreen} />
    </FlexContainer>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 100,
    height: 130,
    resizeMode: "contain",
  },
  description: {
    lineHeight: 25,
    textAlign: "center",
  },
});
