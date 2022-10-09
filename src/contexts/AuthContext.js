import { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const authContext = createContext();

const initialUser = null;
const inittialIsLogged = false;

// ----------------------------------------------------
const AuthProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(inittialIsLogged);
  const [user, setUser] = useState(initialUser);

  const setLogin = async ({ user }) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setIsLogged(true);
    } catch (error) {
      console.log("error al guardar en local storage");
    }
  };

  const setLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
      setIsLogged(false);
    } catch (error) {
      console.log("error al guardar en local storage");
    }
  };

  const value = {
    isLogged,
    user,
    setLogin,
    setLogout,
  };

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
};

export { authContext, AuthProvider };
