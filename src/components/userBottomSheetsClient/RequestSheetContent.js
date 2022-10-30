import { Divider } from "@rneui/base";
import { Button, Input, Text } from "@rneui/themed";
import { useRef, useState } from "react";
import { View } from "react-native";
import { sleep } from "../../utils/sleep";
import { FlexContainer } from "../FlexContainer";

export const RequestSheetContent = ({
  setSheetSectionToWaiting,
  isLoading,
}) => {
  const [ltValue, setLtVale] = useState(0);
  const inputRef = useRef(null);

  const handleOnClick = () => {
    console.log("Primero");
    sleep(3000).then(() => {
      console.log("despues de 3");
      setSheetSectionToWaiting(ltValue);
    });
  };

  return (
    <View>
      <FlexContainer flex_ai_c>
        <Text h4> {isLoading ? "Buscando" : "Cantidad"} Buscando </Text>

        {isLoading ? null : (
          <>
            <Text h4>200L</Text>
          </>
        )}
      </FlexContainer>

      {!isLoading && (
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
      )}

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
