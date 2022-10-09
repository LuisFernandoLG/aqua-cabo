import { useNavigation } from "@react-navigation/native";
import { Button } from "@rneui/base";
import { Image, Input } from "@rneui/themed";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { FlexContainer } from "../components/FlexContainer";

export const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigation = useNavigation();

  const goToLoginScreen = () => {
    navigation.navigate("Login");
  };

  return (
    <FlexContainer flex_ai_c mVertical={100} mHorizontal={40}>
      <Button title="Atrás" type="clear" onPress={goToLoginScreen} />
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
      <Button title="Registrarse" />
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
