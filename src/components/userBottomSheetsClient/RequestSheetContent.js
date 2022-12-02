import { Icon } from "@rneui/base";
import { Button, Divider, Input, Text } from "@rneui/themed";
import { useRef, useState } from "react";
import { Alert } from "react-native";
import { StyleSheet } from "react-native";
import { View } from "react-native";
import { api } from "../../services/api";
import { FlexContainer } from "../FlexContainer";

export const RequestSheetContent = ({
  setSheetSectionToWaiting,
}) => {
  const [ltValue, setLtVale] = useState(0);
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);


  const handleDefaultLiters = (litros) => {
    setLoading(true)
    AsyncAlert(litros)
      .then(({litros, total}) => {
        console.log({litros,  total, y:"-------------------"})
        setSheetSectionToWaiting(litros, total);
      })
      .catch((e) => {
        console.log({ e });
      }).finally(()=>{
        setLoading(false)
      });
  };

  const AsyncAlert = async (litros) =>new Promise((resolve, reject) =>{
    api().getPriceLt((price) =>{
      if(price === false) reject("Error al  oobter precio del litrol");
      Alert.alert(
        "Solicitud",
        `¿Estás seguro de solicitdar ${litros}L por $${price * litros} ?`,
        [
          {
            text: "Cancelar",
            onPress: () => {
              reject(false);
            },
            style: "cancel",
          },
  
          {
            text: "Aceptar",
            style: "destructive",
            onPress: () => {
              console.log(price*litros)
              resolve({litros:litros, total:price*litros});
            },
          },
        ],
        { cancelable: false }
      )
        }  
)});
    

  const handleOnClick = () => {
    setLoading(true);
    if (ltValue.trim() === "") return alert("Ingrese un valor válido");
    if (ltValue === "0") return alert("Por favor ingrese una cantidad válida");
    AsyncAlert(ltValue)
      .then(({litros, total}) => {
        setSheetSectionToWaiting(litros, total);
      })
      .catch((e) => {
        console.log({ e });
      }).finally(()=>setLoading(false));
  };

  return (
    <View>
      <FlexContainer flex_ai_c>
        <Text style={styles.title} h4>
          Cantidad aproximada
        </Text>
      </FlexContainer>
      <FlexContainer flex_ai_c flex_jc_c mVertical={10}>
        <FlexContainer flex_ai_c flex_direction_r flex_jc_c>
          <Button
            containerStyle={styles.btnWater}
            type="outline"
            title={"1L"}
            onPress={() => handleDefaultLiters(1)}
            loading={loading}
          />
          <Button
            containerStyle={styles.btnWater}
            type="outline"
            title={"2L"}
            onPress={() => handleDefaultLiters(2)}
            loading={loading}
          />
          <Button
            containerStyle={styles.btnWater}
            type="outline"
            title={"3L"}
            onPress={() => handleDefaultLiters(3)}
            loading={loading}
          />
        </FlexContainer>
        <FlexContainer flex_ai_c flex_direction_r flex_jc_c>
          <Button
            containerStyle={styles.btnWater}
            type="outline"
            title={"4L"}
            onPress={() => handleDefaultLiters(4)}
            loading={loading}
          />
          <Button
            containerStyle={styles.btnWater}
            type="outline"
            title={"5L"}
            onPress={() => handleDefaultLiters(5)}
            loading={loading}
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
        <Button title="Solicitar pedido" onPress={handleOnClick} loading={loading}>
          Solicitar pedido
          <Icon name="send" style={{ marginLeft: 10 }} color={"white"} />
        </Button>
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
