import { Divider } from "@rneui/base";
import { Button, Input, Text } from "@rneui/themed";
import { View } from "react-native";
import { FlexContainer } from "../FlexContainer";

export const WaitingSheetContent = ({
  currentRequest,
  expectedTime,
  expectedDistance,
  cancellRequest
}) => {
  return (
    <View>
      <FlexContainer flex_direction_r flex_jc_sb>
        <FlexContainer flex_direction_r>
          <Text style={{ fontWeight: "800", marginRight: 10 }}>
            Hora de llegada
          </Text>
          <Text>4:15</Text>
        </FlexContainer>
        <View>
          <Text style={{ fontWeight: "800" }}>
            {currentRequest.waterQuantity} L
          </Text>
        </View>
      </FlexContainer>
      <Divider width={10} color="#fff" />
      <FlexContainer flex_direction_r>
        <Text>{(expectedTime).toString().substring(0,1) || 0}m - </Text>
        <Text>{(expectedDistance).toString().substring(0,5) || 0} Km</Text>
      </FlexContainer>
      <Divider width={10} color="#fff" />

      <Button title="Cancelar" color={"warning"} onPress={cancellRequest} />
    </View>
  );
};
