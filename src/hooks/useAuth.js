import { useContext } from "react";
import { authContext } from "../contexts/AuthContext";

export const useAuth = () => {
  const { isLogged, user, setLogout, setLogin, updateUserData } = useContext(authContext);

  const login = async ({ user }) => {
    await setLogin({ user });
    return true;
  };

  const logout = () => {
    setLogout();
  };

  return { isLogged, user, login, logout, updateUserData };
};
