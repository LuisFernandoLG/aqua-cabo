import { useNavigation } from "@react-navigation/native";
import { Button } from "@rneui/base";
import { Image, Input, Text } from "@rneui/themed";
import { useContext } from "react";
import { useEffect, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { FlexContainer } from "../components/FlexContainer";
import { WaterContainer } from "../components/WaterContainer";
import { firebaseErrors } from "../constants/firebaseErrors";
import { netInfoContext } from "../contexts/NetInfoContext";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";

export const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("client@gmail.com");
  const [password, setPassword] = useState("12345678");
  const [isLoading, setIsLoading] = useState(null);
  const [errors, setErrors] = useState(null);

  const { isLogged, login: loginLocally, user } = useAuth();
  const { isConnected } = useContext(netInfoContext);

  useEffect(() => {
    if (user?.type === "DRIVER") navigation.navigate("DriverHome");
    if (user?.type === "CLIENT") navigation.navigate("Home");
  }, [isLogged, user]);

  const goToSignUpScreen = () => {
    navigation.navigate("SignUp");
  };

  const goToLoginDriverScreen = () => {
    navigation.navigate("DriverLogin");
  };

  const login = async () => {
    setErrors("");
    setIsLoading(true);
    if (!email && !login) return false;

    api()
      .login({ email, password })
      .then((authUser) => {
        if(authUser.type === "DRIVER"){
          setErrors("Lo sentimos, tu cuenta no pertenece a la de un cliente.")
        }
        else{
          loginLocally({ user: authUser });
        }
      })
      .catch((e) => {
        const errorsMsg = firebaseErrors[e] || "Correo o contraseña incorrectos"
        if (!isConnected) setErrors("No hay conexión a internet");
        else setErrors(errorsMsg);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const goToResetPasswordScreen = () => {
    navigation.navigate("ResetPassword");
  };
  


  return (
    <ScrollView>
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
              <Text h3>Bienvenido</Text>
              <Text>Ingresa con tu cuenta de cliente</Text>
            </FlexContainer>
            <Input
              keyboardType="email-address"
              placeholder="Correo"
              value={email}
              onChangeText={(value) => setEmail(value.trim())}
            />

            <Input
              secureTextEntry={true}
              placeholder="Contraseña"
              value={password}
              onChangeText={(value) => setPassword(value)}
            />
            <FlexContainer >
              <Text style={styles.errorMsg}>{errors || ""}</Text>
            </FlexContainer>
            <FlexContainer >
              <Text style={{marginBottom:10, color:"blue"}} onPress={goToResetPasswordScreen}>{"Recuperar contraseña"}</Text>
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

              {/* <WaterContainer/> */}

            </FlexContainer>
          </FlexContainer>
        </View>
        {/* </TouchableWitmehoutFeedback> */}
      </KeyboardAvoidingView>
    </ScrollView>
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
    width: Dimensions.get("window").width,
    paddingHorizontal: 20,

    marginTop: 10,
  },
  inner: {
    marginBottom: Platform.OS === "ios" ? 0 : 80,
    justifyContent: "space-around",
  },
  errorMsg: {
    color: "red",
    marginBottom:10,
    textAlign: "center",

  },
  middleBtn: {
    marginVertical: 10,
  },
});
