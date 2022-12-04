import { createContext, useState } from "react";
const authContext = createContext();


const initialUser = {
  id: "1234567890",
  name:"Usuario",
  phone:"1234567890",
  email:"example@gmail.com",
  password:"1234567890"
};
const inittialIsLogged = false;


// ----------------------------------------------------
const AuthProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(inittialIsLogged);
  const [user, setUser] = useState(initialUser);

  const setLogin = async ({ user }) => {
    try {
      setUser(user);
      setIsLogged(true);
    } catch (error) {
      console.log("error al guardar en local storage");
    }
  };

  const setLogout = async () => {
    try {
      setUser(initialUser);
      setIsLogged(false);
    } catch (error) {
      console.log("error al guardar en local storage");
    }
  };

  const updateUserData = async (data) => {
    try {
      setUser({...user,  ...data});
    } catch (error) {
      console.log("error al guardar en local storage");
    }
  };

  const value = {
    isLogged,
    user,
    setLogin,
    setLogout,
    updateUserData
  };

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
};

export { authContext, AuthProvider };
