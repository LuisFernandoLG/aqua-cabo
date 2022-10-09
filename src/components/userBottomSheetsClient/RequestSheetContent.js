import { Divider } from "@rneui/base";
import { Button, Input, Text } from "@rneui/themed";
import { useRef, useState } from "react";
import { View } from "react-native";
import { sleep } from "../../utils/sleep";
import { FlexContainer } from "../FlexContainer";

export const RequestSheetContent = ({ setSheetSectionToWaiting }) => {
  const [ltValue, setLtVale] = useState(0);
  const inputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleOnClick = () => {
    console.log("Primero");
    sleep(3000).then(() => {
      console.log("despues de 3");
      setSheetSectionToWaiting();
    });
  };

  return (
    <View>
      <FlexContainer flex_ai_c>
        <Text h4>Cantidad</Text>
        <Text h4>200L</Text>
      </FlexContainer>
      <View>
        <FlexContainer>
          <Input
            keyboardType="number-pad"
            ref={inputRef}
            placeholder="Cantidad de agua"
            onChangeText={(value) => setLtVale(value)}
          />
        </FlexContainer>
      </View>

      <FlexContainer flex_ai_c>
        <Button title="Solicitar pedido" onPress={handleOnClick} />
        <Divider color="#fff" width={20} />
        <Button color="secondary" title="Atrás" />
      </FlexContainer>
    </View>
  );
};
