import { Icon, Text } from "@rneui/themed";
import { StyleSheet } from "react-native";
import { FlexContainer } from "./FlexContainer";

export const WaterContainer = ({ style, isConnected, waterLevel }) => {
  

  return (
    <FlexContainer flex_ai_c>
      <Icon name="battery-full" color={"blue"} raised={true} />
      {isConnected ? <Text>{waterLevel}L</Text> : <Text>???</Text>}
    </FlexContainer>
  );
};

const styles = StyleSheet.create({
  label: {
    fontWeight: 700,
  },
});
