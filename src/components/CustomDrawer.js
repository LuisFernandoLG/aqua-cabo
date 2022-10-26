import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";

export const CustomDrawerContent = (props) => {
  const navigation = useNavigation();
  const { logout, user } = useAuth();

  const goToSLoginScreen = () => {
    logout();
    if (user.type === "DRIVER") navigation.navigate("DriverLogin");
    else navigation.navigate("login");
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem label="Cerrar sesión" onPress={goToSLoginScreen} />
    </DrawerContentScrollView>
  );
};
