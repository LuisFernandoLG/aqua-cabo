import { Text } from "@rneui/base"
import { View } from "react-native"
import { FlexContainer } from "../components/FlexContainer"

export const ProfileScreen = ()=>{
  return <View>
    <FlexContainer pdTop={20}>
      <FlexContainer flex_ai_c>
      <Text h4>Nombre</Text>
      <Text>Kautzman Díaz Francisco Iram</Text>
      </FlexContainer>
      <FlexContainer flex_ai_c>
      <Text h4>Teléfono</Text>
      <Text>624 242 07 21</Text>
      </FlexContainer>

    </FlexContainer>
  </View>
}