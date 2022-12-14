import { onValue, ref } from "firebase/database";
import { useContext, useState } from "react";
import { firebaseContext } from "../contexts/FirebaseContex";


export const useDriver = ()=>{
  const [listeners, setListeners] = useState([])
  const { db } = useContext(firebaseContext)
  
  const suscribeToWatchClientRequests = async ({ driverId }, cb) => {

    const clientRequestsRef = ref(db, "clientRequests");
    const unsuscribe = onValue(clientRequestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const array = Object.values(data);
        const requests = array.filter((item) => item.driverId === driverId);
        cb(requests);
      } else {
        cb([]);
      }
    });

    setListeners([...listeners, unsuscribe])
  };

  const setOfflineOnDisconnect = async ({ driverId }, cb) => {
    const presenceRef = ref(db, "truckLocations/" + driverId + "/isOnline");
    const dis = onDisconnect(presenceRef);
    await dis.set(false);
    cb(dis);
  };

  const removeListeners = ()=>{
    listeners.forEach(listener => {
      listener()
    })
    setListeners([])
  }
  
  
  return {
    suscribeToWatchClientRequests, removeListeners
  }
}