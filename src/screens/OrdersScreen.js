import { Text } from "@rneui/base";
import { Button, ListItem } from "@rneui/themed";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import firebase from "../../database/firebase.js";
import { FlexContainer } from "../components/FlexContainer.jsx";
import { api } from "../services/api.js";
import {useAuth} from "../hooks/useAuth"
import { formatTimestamp } from "../utils/formatTimestamp.js";

const initialOrders = [];

export const OrdersScreen = () => {
  const [orders, setOrders] = useState(initialOrders);

  const {user}= useAuth()

  useEffect(() => {
    api().getDoneRequestByUser({clientId:user.id}).then((data)=>{
      setOrders(data)
    })
  }, []);

  return (
    <FlexContainer>
      <FlatList
        data={orders}
        renderItem={({ item }) => (
          <ListItem.Content style={styles.itemContainer}>
            <Text style={{fontSize:18, fontWeight:"800"}}>Fecha: {item.date}</Text>
              <Text>Cantidad: {item.waterQuantity}</Text>
          </ListItem.Content>
        )}
      />
    </FlexContainer>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    padding: 15,
    borderBottomColor: "gray",
    borderBottomWidth: 2,
  },
  subtitleView: {
    flexDirection: "row",
    paddingLeft: 10,
    paddingTop: 5,
  },
  ratingText: {
    paddingLeft: 10,
    color: "grey",
  },
});
