import { Text } from "@rneui/base";
import { Image } from "@rneui/themed";
import { StyleSheet, View } from "react-native";
import { FlexContainer } from "../components/FlexContainer";

export const AboutScreen = () => {
  return (
    <View>

    <FlexContainer flex_jc_c flex_ai_c mHorizontal={40} pdTop={20}>
      <Image style={styles.logo} source={require("../../assets/logo.png")} />
      <Text style={styles.description}>
        AquaCabo es un proyecto enfocado a la sociedad de Los Cabos, con el fin
        de ayudar a aquellos quienes se les dificulta conseguir agua potable
        para su hogar.
      </Text>
    <Text h4>Desarrolladores</Text>
    <Text>Programador 1</Text>
    <Text>Programador 2</Text>
    <Text>Programador 3</Text>
    </FlexContainer>
    </View>
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
    textAlign:"center"
  },
});
