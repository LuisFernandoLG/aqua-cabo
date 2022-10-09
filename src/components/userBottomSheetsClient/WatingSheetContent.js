import { Divider } from "@rneui/base";
import { Button, Input, Text } from "@rneui/themed";
import { useRef, useState } from "react";
import { View } from "react-native";
import { FlexContainer } from "../FlexContainer";

export const WaitingSheetContent = ({ cancellRequest }) => {
  const [ltValue, setLtVale] = useState(0);
  const inputRef = useRef(null);

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
          <Text style={{ fontWeight: "800" }}>200L</Text>
        </View>
      </FlexContainer>
      <Divider width={10} color="#fff" />
      <FlexContainer flex_direction_r>
        <Text>6min - </Text>
        <Text>300m</Text>
      </FlexContainer>
      <Divider width={10} color="#fff" />

      <Button title="Cancelar" color={"warning"} onPress={cancellRequest} />
    </View>
  );
};
