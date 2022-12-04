import { Icon, Text } from "@rneui/base";
import { Button, ListItem } from "@rneui/themed";
import { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { FlexContainer } from "../components/FlexContainer.jsx";
import { api } from "../services/api.js";
import { useAuth } from "../hooks/useAuth";
import { useIsFocused } from "@react-navigation/native";
import { netInfoContext } from "../contexts/NetInfoContext.js";

const initialOrders = [];

export const OrdersScreen = () => {
  const [orders, setOrders] = useState(initialOrders);

  const { user } = useAuth();
  const isFocused = useIsFocused();
  const { isConnected } = useContext(netInfoContext);

  useEffect(() => {
    api()
      .getDoneRequestByUser({ clientId: user.id })
      .then((data) => {
        setOrders(data);
      });
  }, [isFocused]);

  return (
    <FlexContainer>
      {!isConnected && (
        <>
          <Icon name="wifi-off" />
          <Text style={styles.noInternet}>No hay conexión a internet</Text>
        </>
      )}
      <FlatList
        data={orders}
        renderItem={({ item }) => (
          <ListItem.Content style={styles.itemContainer}>
            <Text style={{ fontSize: 18, fontWeight: "800" }}>
              Fecha: {item.date}
            </Text>
            <Text>Cantidad: {item.waterQuantity}</Text>
            <Text>Total: {item.total}</Text>
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
  noInternet: {
    fontSize: 20,
    textAlign: "center",
  },
});
