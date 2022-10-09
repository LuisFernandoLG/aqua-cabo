import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { AboutScreen } from "../screens/AboutScreen";
import { DriverHomeScreen } from "../screens/DriverHomeScreen";
import { DriverLoginScreen } from "../screens/DriverLoginScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { OrdersScreen } from "../screens/OrdersScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SignUpScreen } from "../screens/SignUpScreen";
import { CustomDrawerContent } from "./CustomDrawer";

export const Router = () => {
  const Drawer = createDrawerNavigator();

  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen
          name="Home"
          options={{ title: "AquaCabo" }}
          component={HomeScreen}
        />
        <Drawer.Screen
          name="Orders"
          options={{ title: "Pedidos" }}
          component={OrdersScreen}
        />
        <Drawer.Screen
          name="Profile"
          options={{ title: "Perfil" }}
          component={ProfileScreen}
        />
        <Drawer.Screen
          name="About"
          options={{ title: "Acerca de" }}
          component={AboutScreen}
        />

        {/* Driver */}
        <Drawer.Screen
          name="DriverHome"
          options={{ title: "Driver" }}
          component={DriverHomeScreen}
        />

        <Drawer.Screen
          name="DriverLogin"
          options={{
            // drawerItemStyle: { display: "none" },
            headerShown: false,
            swipeEdgeWidth: 0,
          }}
          component={DriverLoginScreen}
        />
        <Drawer.Screen
          name="SignUp"
          options={{
            drawerItemStyle: { display: "none" },
            headerShown: false,
            swipeEdgeWidth: 0,
          }}
          component={SignUpScreen}
        />

        <Drawer.Screen name="noti" component={NotificationsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};
