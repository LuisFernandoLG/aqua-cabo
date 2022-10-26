import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";
import { AboutScreen } from "../screens/AboutScreen";
import { DriverHomeScreen } from "../screens/DriverHomeScreen";
import { DriverLoginScreen } from "../screens/DriverLoginScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { OrdersScreen } from "../screens/OrdersScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SignUpScreen } from "../screens/SignUpScreen";
import { CustomDrawerContent } from "./CustomDrawer";
import { DefaultTheme } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import { HomeScreen } from "../screens/HomeScreen";

export const Router = () => {
  const Drawer = createDrawerNavigator();
  const { user } = useAuth();

  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#fff",
    },
  };

  return (
    <NavigationContainer theme={MyTheme}>
      <Drawer.Navigator
        initialRouteName="login"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        {user?.type === "DRIVER" && (
          <>
            <Drawer.Screen
              name="DriverHome"
              options={{ title: "Driver" }}
              component={DriverHomeScreen}
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
          </>
        )}

        {user?.type === "CLIENT" && (
          <>
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
          </>
        )}

        {/* <Drawer.Screen name="noti" component={NotificationsScreen} /> */}
        <Drawer.Group screenOptions={{ presentation: "modal" }}>
          <Drawer.Screen
            name="DriverLogin"
            options={{
              drawerItemStyle: { display: "none" },
              headerShown: false,
              swipeEdgeWidth: 0,
            }}
            component={DriverLoginScreen}
          />
          <Drawer.Screen
            name="notifications"
            component={NotificationsScreen}
          />
          <Drawer.Screen
            name="login"
            options={{
              drawerItemStyle: { display: "none" },
              headerShown: false,
              swipeEdgeWidth: 0,
            }}
            component={LoginScreen}
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
        </Drawer.Group>
      </Drawer.Navigator>
    </NavigationContainer>
  );
};
