import {
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
  MEASUREMENT_ID,
} from "@env";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { createContext, useState } from "react";


firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
  measurementId: MEASUREMENT_ID,
};



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

  const value = {
    isLogged,
    user,
    setLogin,
    setLogout,
  };

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
};

export { authContext, AuthProvider };
