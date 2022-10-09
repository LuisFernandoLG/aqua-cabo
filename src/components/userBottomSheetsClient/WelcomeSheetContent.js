import { Text } from "@rneui/themed";

import { View } from "react-native";
import { FlexContainer } from "../FlexContainer";

export const WelcomeSheetContent = () => {
  return (
    <View>
      <FlexContainer flex_direction_r flex_jc_c>
        <Text h4>Comienza a pedir agua (:</Text>
      </FlexContainer>
    </View>
  );
};
