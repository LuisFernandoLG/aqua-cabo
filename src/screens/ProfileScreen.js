import { Text } from "@rneui/base";
import { View } from "react-native";
import { FlexContainer } from "../components/FlexContainer";
import { useAuth } from "../hooks/useAuth";

export const ProfileScreen = () => {
  const { user } = useAuth();

  return (
    <View>
      <FlexContainer pdTop={20}>
        <FlexContainer flex_ai_c>
          <Text h4>Nombre</Text>
          <Text>{user.name}</Text>
        </FlexContainer>
        <FlexContainer flex_ai_c>
          <Text h4>email</Text>
          <Text>{user.email}</Text>
        </FlexContainer>
      </FlexContainer>
    </View>
  );
};
