import { Button, Divider, Input, Text } from "@rneui/themed";
import { useRef, useState } from "react";
import { Alert } from "react-native";
import { StyleSheet } from "react-native";
import { View } from "react-native";
import { FlexContainer } from "../FlexContainer";

export const RequestSheetContent = ({
  setSheetSectionToWaiting,
  isLoading,
}) => {
  const [ltValue, setLtVale] = useState(0);
  const inputRef = useRef(null);

  const handleDefaultLiters = (litros)=>{
    AsyncAlert(litros)
    .then(() => {
      setSheetSectionToWaiting(litros);
    })
    .catch((e) => {
      console.log({ e });
    });
  }

  const AsyncAlert = async (litros) =>
    new Promise((resolve, reject) => {
      Alert.alert(
        "Solicitud",
        `¿Estás seguro de solicitdar ${litros}L ?`,
        [
          {
            text: "Cancelar",
            onPress: () => {
              reject(false);
            },
            style:"cancel"
          },
          
          {
            text: "Aceptar",
            style:"destructive",
            onPress: () => {
              resolve(true);
            },
          },

        ],
        { cancelable: false }
      );
    });
  const handleOnClick = () => {
    if (ltValue.trim() === "") return alert("Ingrese un valor válido");
    if (ltValue === "0") return alert("Por favor ingrese una cantidad válida");
    AsyncAlert(ltValue)
      .then(() => {
        setSheetSectionToWaiting(ltValue);
      })
      .catch((e) => {
        console.log({ e });
      });
  };

  return (
    <View>
      <FlexContainer flex_ai_c>
        <Text style={styles.title} h4>
          {" "}
          Cantidad aproximada
        </Text>
      </FlexContainer>
      <FlexContainer flex_ai_c flex_jc_c mVertical={10}>
        <FlexContainer flex_ai_c flex_direction_r flex_jc_c>
          <Button
            containerStyle={styles.btnWater}
            type="outline"
            title={"1000L"}
            onPress={()=>handleDefaultLiters(1000)}
          />
          <Button
            containerStyle={styles.btnWater}
            type="outline"
            title={"2000L"}
            onPress={()=>handleDefaultLiters(2000)}
          />
          <Button
            containerStyle={styles.btnWater}
            type="outline"
            title={"3000L"}
            onPress={()=>handleDefaultLiters(3000)}
          />
        </FlexContainer>
        <FlexContainer flex_ai_c flex_direction_r flex_jc_c>
          <Button
            containerStyle={styles.btnWater}
            type="outline"
            title={"4000L"}
            onPress={()=>handleDefaultLiters(4000)}
          />
          <Button
            containerStyle={styles.btnWater}
            type="outline"
            title={"5000L"}
            onPress={()=>handleDefaultLiters(5000)}
          />
        </FlexContainer>
      </FlexContainer>

      <View>
        <FlexContainer>
          <Input
            keyboardType="number-pad"
            ref={inputRef}
            value={ltValue}
            placeholder="Cantidad de agua"
            onChangeText={(value) => setLtVale(value)}
          />
        </FlexContainer>
      </View>

      <FlexContainer flex_ai_c>
        <Button
          title="Solicitar pedido"
          onPress={handleOnClick}
          loading={isLoading}
          disabled={isLoading}
        />
      </FlexContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: 10,
  },
  btnWater: {
    marginRight: 10,
    marginTop: 10,
  },
});
