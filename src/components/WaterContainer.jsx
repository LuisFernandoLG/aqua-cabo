import { Icon, Text } from "@rneui/themed";
import { useContext, useState } from "react";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { netInfoContext } from "../contexts/NetInfoContext";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { FlexContainer } from "./FlexContainer";

export const WaterContainer = ({ style }) => {
  const [waterLevel, setWaterLevel] = useState(0);
  const { isConnected } = useContext(netInfoContext);
  const {user} = useAuth()

  useEffect(() => {
    if(isConnected && user?.id){
      api().suscribeToWaterLevel(user.id, (data) => {
        if (data) {
          const str = data.toString();
          const rounded = str.substring(0, 6);
          setWaterLevel(rounded);
        }
      });
    }
  }, []);

  return (
    <FlexContainer flex_ai_c>
      <Icon name="battery-full" color={"blue"} raised={true} />
      {isConnected ? <Text>{waterLevel}L</Text> : <Text>???</Text>}
    </FlexContainer>
  );
};

const styles = StyleSheet.create({
  label: {
    fontWeight: 700,
  },
});
