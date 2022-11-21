import { off, onValue, ref } from "firebase/database"
import { useState } from "react"
import { db } from "../../database/firebase2"

export const useFirebase = () => {
  const [listeners, setListeners] = useState([])
  const [allTrucks, setAllTrucks] = useState([])

  const listenToTrucks = (callback) => {
    const truckLocationsRef = ref(db, "truckLocations");
    const listenerRefernce = onValue(truckLocationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const array = Object.values(data);
        console.log("-----------------------")
        console.log(array)
        setAllTrucks(array);
      } else {
        setAllTrucks([]);
      }
    });
    
    setListeners([...listeners, listenerRefernce])
  }

  const removeListeners = ()=>{
    console.log("LIMPIANDO LISTENERS")
    listeners.forEach(listener => off(listener))
    setListeners([])
  }

  return {
    removeListeners,
    allTrucks,
    listenToTrucks
  }
}