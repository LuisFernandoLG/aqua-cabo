import { useNavigation } from "@react-navigation/native";
import { Button } from "@rneui/base";
import { Input, Text } from "@rneui/themed";
import { useState } from "react";
import { Dimensions } from "react-native";
import { KeyboardAvoidingView } from "react-native";
import { Platform } from "react-native";
import { StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { FlexContainer } from "../components/FlexContainer";
import { firebaseErrors } from "../constants/firebaseErrors";
import { emailRegex } from "../constants/regexs";
import { api } from "../services/api";

export const ResetPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState("");

  const navigation = useNavigation();

  const goToLoginScreen = () => {
    navigation.goBack();
  };

  const handleSubmit = () => {
    if (!emailRegex.test(email)) setErrors("Email inválido");

    setIsLoading(true);
    api()
      .resetPassword({ email })
      .then(() => {
        alert(
          "Se ha enviado un correo a tu cuenta de correo electrónico para restablecer tu contraseña"
        );
        setEmail("");
        setErrors("");
        navigation.navigate("Login");
      })
      .catch((e) => {
        console.log({ e });
        setErrors(firebaseErrors[e] || "No se pudo enviar el correo");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <ScrollView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <FlexContainer flex_ai_c mVertical={100} mHorizontal={40}>
          <Button title="Atrás" type="clear" onPress={goToLoginScreen} />
          <Text style={{ marginVertical: 20 }} h4>
            Recuperar contraseña
          </Text>
          <Input
            keyboardType="email-address"
            placeholder="Correo"
            value={email}
            style={styles.input}
            onChangeText={(value) => setEmail(value)}
            errorStyle={{ color: "red" }}
            errorMessage={errors}
            label={
              <Text style={styles.label}>{email !== "" ? "Correo" : ""}</Text>
            }
          />
          {/* <Text style={styles.firebaseErrorr}>{errors}</Text> */}
          <Button
            title="Recuperar"
            onPress={handleSubmit}
            loading={isLoading}
          />
        </FlexContainer>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  input: {
    padding: 10,
    backgroundColor: "#eeeeee",
  },
  label: {
    fontWeight: "800",
  },
  firebaseErrorr: {
    color: "red",
  },
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
    width: Dimensions.get("window").width,
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: "center",
    // justifyContent: "center",
    // flex: 1,
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
