import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";

export const CustomDrawerContent = (props) => {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const goToSLoginScreen = () => {
    logout();
    navigation.navigate("DriverLogin");
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem label="Cerrar sesión" onPress={goToSLoginScreen} />
    </DrawerContentScrollView>
  );
};
