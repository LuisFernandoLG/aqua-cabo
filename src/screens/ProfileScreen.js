import { useNavigation } from "@react-navigation/native";
import { Divider, Text } from "@rneui/base";
import { Button, Icon } from "@rneui/themed";
import { View } from "react-native";
import { FlexContainer } from "../components/FlexContainer";
import { useAuth } from "../hooks/useAuth";

export const ProfileScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation()

  const goToEditProfiel = () => {
    navigation.navigate('EditProfile')
  }

  console.log({user})


  return (
    <View>
      <FlexContainer pdTop={20}>
        <FlexContainer flex_ai_c>
          <Text h4>Nombre</Text>
          <Text>{user.name}</Text>
        </FlexContainer>
        <Divider style={{marginVertical:10}}/>
        <FlexContainer flex_ai_c>
          <Text h4>email</Text>
          <Text>{user.email}</Text>
        </FlexContainer>
        <Divider style={{marginVertical:10}}/>
        <FlexContainer flex_ai_c>
          <Text h4>Phone</Text>
          <Text>{user?.phone}</Text>
        </FlexContainer>
      </FlexContainer>
        <FlexContainer flex_ai_c mVertical={30}>
        <Button onPress={goToEditProfiel}>
          <Icon name="edit"  color={"#fff"}  />
        </Button>
        </FlexContainer>

    </View>
  );
};
