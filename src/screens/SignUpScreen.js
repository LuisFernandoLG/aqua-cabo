import { useNavigation } from "@react-navigation/native";
import { Button } from "@rneui/base";
import { Image, Input, Text } from "@rneui/themed";
import { useState } from "react";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
import { FlexContainer } from "../components/FlexContainer";
import { firebaseErrors } from "../constants/firebaseErrors";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { Dimensions } from "react-native";
import { ScrollView } from "react-native";
import { useContext } from "react";
import { netInfoContext } from "../contexts/NetInfoContext";
import { emailRegex, nameRegex, phoneRegex } from "../constants/regexs";

const initialForm = {
  name: "Víctor",
  email: "vic@gmail.com",
  phone: "6242420721",
  password: "1234567890",
  repassword: "1234567890",
};

export const SignUpScreen = () => {
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState(null);
  const [firebaseError, setFirebaseError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isConnected } = useContext(netInfoContext);

  const navigation = useNavigation();
  const { login: loginLocally } = useAuth();

  const goToLoginScreen = () => {
    navigation.navigate("login");
  };

  const hanldeChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    let errors = {};
    if (!nameRegex.test(form.name))
      errors = { ...errors, name: "Nombre no válido" };
    if (!emailRegex.test(form.email))
      errors = { ...errors, email: "Coreo no válido" };
    if (!phoneRegex.test(form.phone))
      errors = { ...errors, phone: "Teléfono no válido" };
    if (!(form.password.length > 7))
      errors = {
        ...errors,
        password: "La contraseña debe ser mayor a 8 caracteres",
      };
    if (form.password !== form.repassword)
      errors = { ...errors, repassword: "Las contraseñas deben coincidir" };

    if (Object.values(errors).length === 0) {
      setFormErrors(null);
      setFirebaseError(null);
      setLoading(true);
      api()
        .registerClient({
          email: form.email,
          password: form.password,
          userForm: form,
        })
        .then((item) => {
          loginLocally({ user: item });
        })
        .catch((e) => {
          console.log({ e });
          if (!isConnected) setFirebaseError("No hay conexión a internet");
        else setFirebaseError(firebaseErrors[e.errorCode]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else setFormErrors(errors);
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
            Registro de cliente
          </Text>
          <Input
            placeholder="Nombre"
            style={styles.input}
            onChangeText={(value) => hanldeChange("name", value)}
            value={form.name}
            errorStyle={{ color: "red" }}
            errorMessage={formErrors?.name}
            label={
              <Text style={styles.label}>
                {form.name !== "" ? "Nombre" : ""}
              </Text>
            }
          />
          <Input
            keyboardType="email-address"
            placeholder="Correo"
            value={form.email}
            style={styles.input}
            onChangeText={(value) => hanldeChange("email", value)}
            errorStyle={{ color: "red" }}
            errorMessage={formErrors?.email}
            label={
              <Text style={styles.label}>
                {form.email !== "" ? "Correo" : ""}
              </Text>
            }
          />
          <Input
            style={styles.input}
            keyboardType="phone-pad"
            placeholder="Teléfono"
            value={form.phone}
            onChangeText={(value) => hanldeChange("phone", value)}
            errorStyle={{ color: "red" }}
            errorMessage={formErrors?.phone}
            label={
              <Text style={styles.label}>
                {form.phone !== "" ? "Teléfono" : ""}
              </Text>
            }
          />

          <Input
            style={styles.input}
            // secureTextEntry={true}
            placeholder="Contraseña"
            value={form.password}
            onChangeText={(value) => hanldeChange("password", value)}
            errorMessage={formErrors?.password}
            label={
              <Text style={styles.label}>
                {form.password !== "" ? "Contraseña" : ""}
              </Text>
            }
          />

          <Input
            style={styles.input}
            // secureTextEntry={true}
            value={form.repassword}
            placeholder="Confirmar contraseña"
            onChangeText={(value) => hanldeChange("repassword", value)}
            errorMessage={formErrors?.repassword}
            label={
              <Text style={styles.label}>
                {form.repassword !== "" ? "Confirmar contraseña" : ""}
              </Text>
            }
          />
          <Text style={styles.firebaseErrorr}>{firebaseError}</Text>
          <Button
            title="Registrarse"
            onPress={handleSubmit}
            loading={loading}
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
