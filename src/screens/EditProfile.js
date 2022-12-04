import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Icon } from "@rneui/base";
import { Button, Input, Text } from "@rneui/themed";
import { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import { ScrollView } from "react-native";
import { KeyboardAvoidingView } from "react-native";
import { Dimensions } from "react-native";
import { StyleSheet } from "react-native";
import { FlexContainer } from "../components/FlexContainer";
import { firebaseErrors } from "../constants/firebaseErrors";
import { emailRegex, nameRegex, phoneRegex } from "../constants/regexs";
import { netInfoContext } from "../contexts/NetInfoContext";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";

const initialUser = {
  name: "",
  email: "",
  phone: "",
};

export const EditProfile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(initialUser);
  const [formErrors, setFormErrors] = useState(null);
  const [firebaseError, setFirebaseError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isConnected } = useContext(netInfoContext);

  const navigation = useNavigation();
  const { updateUserData } = useAuth();
  const isFocused = useIsFocused();

  const hanldeChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  useEffect(() => {
    if (isFocused) {
      setForm(user);
    }
  }, [isFocused]);

  const handleSubmit = () => {
    let errors = {};
    if (!nameRegex.test(form.name))
      errors = { ...errors, name: "Nombre no válido" };
    if (!emailRegex.test(form.email))
      errors = { ...errors, email: "Coreo no válido" };
    if (!phoneRegex.test(form.phone))
      errors = { ...errors, phone: "El teléfono debe contener 10 dígitos" };

    if (Object.values(errors).length === 0) {
      setFormErrors(null);
      setFirebaseError(null);
      setLoading(true);
      
      api()
      .updateUserData({ userId: user.id, user: form })
      .then((res) => {
        alert("Datos actualizados correctamente");
        updateUserData(form)
        })
        .catch((err) => {
          console.log(err);
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
          <Input
            placeholder="Nombre"
            style={styles.input}
            onChangeText={(value) => hanldeChange("name", value)}
            value={form?.name}
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
            value={form?.email}
            disabled={true}
            style={{ ...styles.input, borderWidth: 0 }}
            onChangeText={(value) => hanldeChange("email", value)}
            errorStyle={{ color: "red" }}
            errorMessage={formErrors?.email}
            label={
              <Text style={{ ...styles.label, color: "gray" }}>
                {form?.email !== "" ? "Correo" : ""}
              </Text>
            }
          />
          <Input
            style={styles.input}
            keyboardType="phone-pad"
            placeholder="Teléfono"
            value={(form?.phone).toString()}
            onChangeText={(value) => hanldeChange("phone", value)}
            errorStyle={{ color: "red" }}
            errorMessage={formErrors?.phone}
            label={
              <Text style={styles.label}>
                {form.phone !== "" ? "Teléfono" : ""}
              </Text>
            }
          />

          <Text style={styles.firebaseErrorr}>{firebaseError}</Text>

          { !isConnected ? (
            <>
              <Button>
                <Icon name="wifi-off" />
                <Text style={styles.noInternet}>
                  No hay conexión a internet
                </Text>
              </Button>
            </>
          ) : (
            <Button
              title="Actualizar"
              onPress={handleSubmit}
              loading={loading}
            />
          )}
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
  noInternet: {
    fontSize: 20,
    textAlign: "center",
  },
});
