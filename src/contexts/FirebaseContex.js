import {db, auth} from "../../database/firebase2"
import { createContext } from "react";


const firebaseContext = createContext();

const FirebaseProvider = ({ children }) => {

  const value = {
    db, auth,
  }

  return <firebaseContext.Provider value={value}>{children}</firebaseContext.Provider>;
};

export { firebaseContext, FirebaseProvider };
