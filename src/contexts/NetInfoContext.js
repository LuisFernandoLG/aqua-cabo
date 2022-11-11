import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState, createContext } from "react";

const netInfoContext = createContext();

const NetInfoProvider = ({children}) => {
  // useState hook for setting netInfo
  const [netInfo, setNetInfo] = useState(false);

  // useEffect hook calls only once like componentDidMount()
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      if (
        state.type === "cellular" ||
        (state.type === "wifi" && state.isConnected)
      ) {
        setNetInfo(true);
      } else {
        setNetInfo(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const value = {
    isConnected: netInfo,
  }
  
  return <netInfoContext.Provider value={value}>{children}</netInfoContext.Provider>;
};


export {netInfoContext, NetInfoProvider}