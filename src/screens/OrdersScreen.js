import { Text } from "@rneui/base";
import { Button, ListItem } from "@rneui/themed";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import firebase from "../../database/firebase.js";
import { FlexContainer } from "../components/FlexContainer.jsx";

const initialOrders = [];

export const OrdersScreen = () => {
  const [orders, setOrders] = useState(initialOrders);

  const keyExtractor = (item, index) => item.id;

  const addOrderToDB = () => {
    firebase.db.collection("orders").add({
      date: "25/07/2022",
      quantity: 203,
    });
  };

  useEffect(() => {
    firebase.db.collection("orders").onSnapshot((querySnapshot) => {
      let orders = [];
      querySnapshot.docs.forEach((doc) => {
        const { date, quantity } = doc.data();
        orders.push({ date, quantity, id: doc.id });
      });

      console.log({ orders });
      setOrders(orders);
    });

    console.log("holis");
  }, []);

  return (
    <FlexContainer>
      <Button title="Agregar" onPress={addOrderToDB} />
      <FlatList
        keyExtractor={keyExtractor}
        data={orders}
        renderItem={({ item }) => (
          <ListItem.Content style={styles.itemContainer}>
            <ListItem.Title>{item.date}</ListItem.Title>
            <View style={styles.subtitleView}>
              <Text style={styles.ratingText}>{item.quantity}</Text>
            </View>
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
