import { useContext, useEffect, useState } from "react";
import { netInfoContext } from "../contexts/NetInfoContext";
import { api } from "../services/api";
import { useAuth } from "./useAuth";

// i made an error here, boolean are inverted, but it works
const waterValveStates = {
  OPEN: !true,
  CLOSED: !false,
}

let initialTotalWater = 0;
export const useAutomaticWater = () => {
  const [water, setWater] = useState(0);
  const [isAutomaticWaterOn, setIsAutomaticWaterOn] = useState(false);
  const [waterToFill, setWaterToFill] = useState(0);
  const [waterConsuption, setWaterConsuption] = useState(0);
  const { user } = useAuth();
  const {isConnected} = useContext(netInfoContext);
  const {wasButtonPressed, setWasButtonPressed} = useState(false);

  const turnOnWater = () => {
    api().changeStateOfWater({ userId: user.id, value: waterValveStates.OPEN });
    setWasButtonPressed(true);
  };

  const turnOffWater = () => {
    api().changeStateOfWater({ userId: user.id, value: waterValveStates.CLOSED });
  };


  

  useEffect(() => {
    if(isConnected && user?.id){
      api().suscribeToWaterLevel(user.id, (data) => {
        if (data) {
          const str = data.toString();
          const rounded = str.substring(0, 6);
          setWater(rounded);
        }
      });
    }
  }, [])


  const openAutomaticWater = (liters) => {
    initialTotalWater = JSON.stringify(JSON.parse(water));
    setIsAutomaticWaterOn(true);
    setWaterToFill(liters)
    turnOnWater()
  };
  
  useEffect(() => {
    if(isAutomaticWaterOn) {
      const leftWater = initialTotalWater - waterToFill;
      console.log({leftWater, waterToFill, initialTotalWater})
      if(leftWater >= water){
        setWaterConsuption(initialTotalWater - leftWater);
        setIsAutomaticWaterOn(false);
        turnOffWater();
      }
    }
  },[water]);

  return {
    water,
    openAutomaticWater,
    waterConsuption,
    turnOnWater,
    turnOffWater,
    wasButtonPressed
  }
}