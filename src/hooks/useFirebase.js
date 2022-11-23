import { db } from "../../database/firebase2"
import { off, onValue, ref } from "firebase/database"
import { useState } from "react"

export const useFirebase = () => {
  const [listeners, setListeners] = useState([])
  const [allTrucks, setAllTrucks] = useState([])
  const [loading, setLoading] = useState(false)

  const listenToTrucks = (callback) => {
    const truckLocationsRef = ref(db, "truckLocations");
    const unsuscribe = onValue(truckLocationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const array = Object.values(data);
        setAllTrucks(array);
      } else {
        setAllTrucks([]);
      }
    });
    
    setListeners([...listeners, unsuscribe])
  }

  const listenToRequestChanges = ({ clientId }, cb) => {

    const clientRequestsRef = ref(db, "clientRequests");
    const unsuscribe = onValue(clientRequestsRef, (snapshot) => {
        if (snapshot.exists()) {
        const data = snapshot.val();
        const array = Object.values(data);
        const requestFound = array.find((item) => item.clientId === clientId);
        if (requestFound) {
          cb(requestFound);
        } else {
          cb([]);
        }
      } else {
        cb([]);
      }
    });

    setListeners([...listeners, unsuscribe])
  };

  const removeListeners = ()=>{
    console.log("LIMPIANDO LISTENERS")
    listeners.forEach(listener => {
      console.log("LISTENER REMOVED")
      listener()
    })
    setListeners([])
  }

  return {
    removeListeners,
    allTrucks,
    listenToTrucks,
    listenToRequestChanges,
    loading
  }
}