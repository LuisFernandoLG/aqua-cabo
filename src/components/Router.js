import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";
import { AboutScreen } from "../screens/AboutScreen";
import { DriverHomeScreen } from "../screens/DriverHomeScreen";
import { DriverLoginScreen } from "../screens/DriverLoginScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { OrdersScreen } from "../screens/OrdersScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SignUpScreen } from "../screens/SignUpScreen";
import { CustomDrawerContent } from "./CustomDrawer";
import { DefaultTheme } from "@react-navigation/native";
import { HomeScreen } from "../screens/HomeScreen";
import { SignUpDriverScreen } from "../screens/SignUpDriverScreen";
import { EditProfile } from "../screens/EditProfile";
import { ResetPasswordScreen } from "../screens/ResetPasswordScreen";

export const Router = () => {
  const Drawer = createDrawerNavigator();
  const { user, isLogged } = useAuth();

  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#fff",
    },
  };

  const isDriver = user?.type === "DRIVER";
  const isClient = user?.type === "CLIENT";

  return (
    <NavigationContainer theme={MyTheme}>
      <Drawer.Navigator
        initialRouteName="login"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        backBehavior="history"
      >
        <Drawer.Group>
          <Drawer.Screen
            name="Home"
            options={{
              title: "AquaCabo",
              drawerItemStyle: { display: isDriver ? "none" : "flex" },
            }}
            component={HomeScreen}
          />

          <Drawer.Screen
            name="DriverHome"
            options={{
              title: "Conductor",
              drawerItemStyle: { display: isDriver ? "flex" : "none" },
            }}
            component={DriverHomeScreen}
          />

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
            name="login"
            options={{
              drawerItemStyle: { display: "none" },
              headerShown: false,
              swipeEdgeWidth: 0,
            }}
            component={LoginScreen}
          />

          <Drawer.Screen
            name="Orders"
            options={{
              title: "Pedidos",
              drawerItemStyle: { display: isDriver ? "none" : "flex" },
            }}
            component={OrdersScreen}
          />

          <Drawer.Screen
            name="Profile"
            options={{ title: "Perfil" }}
            component={ProfileScreen}
          />

          <Drawer.Screen
            name="EditProfile"
            options={{
              title: "Editar Perfil",
              drawerItemStyle: { display: "none" },
              
            }}
            component={EditProfile}
          />

          
          <Drawer.Screen
            name="ResetPassword"
            options={{
              title: "Restablecer contrase??a",
              drawerItemStyle: { display: "none" },
              headerShown: false,
              swipeEdgeWidth: 0,
            }}
            component={ResetPasswordScreen}
          />



          <Drawer.Screen
            name="About"
            options={{ title: "Acerca de" }}
            component={AboutScreen}
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

          <Drawer.Screen
            name="SignUpDriver"
            options={{
              drawerItemStyle: { display: "none" },
              headerShown: false,
              swipeEdgeWidth: 0,
            }}
            component={SignUpDriverScreen}
          />
        </Drawer.Group>
      </Drawer.Navigator>
    </NavigationContainer>
  );
};
