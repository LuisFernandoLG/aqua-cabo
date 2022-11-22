import React, { useState } from "react";
import { Alert, Modal, StyleSheet, Pressable, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { FlexContainer } from "./FlexContainer";
import { GOOGLE_MAPS_APIKEY } from "@env";
import MapViewDirections from "react-native-maps-directions";
import { getRegionForCoordinates } from "../helpers/getRegionForCoordinates";
import { locationConstants } from "../constants/locationConstants";
import { Button } from "@rneui/base";
import { Text } from "@rneui/themed";

const answers = {
  YES: "YES",
  NO: "NO",
};

export const ModalX = ({
  setAnswer,
  isOpen,
  cancellRequest,
  closeModal,
  clientCoords,
  driverCoords,
  setRequesToTaken,
  request,
}) => {
  const handleAnswer = (answer) => {
    setAnswer(answer);
    // closeModal()
  };

  const getRegion = () => {
    const points = [
      {
        longitude: clientCoords.longitude,
        latitude: clientCoords.latitude,
      },

      {
        longitude: driverCoords.longitude,
        latitude: driverCoords.latitude,
      },
    ];

    return getRegionForCoordinates(points);
  };

  const handleNotTaken = () => {};

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isOpen}
        onRequestClose={() => {
          handleAnswer();
        }}
      >
        <View style={styles.centeredView}>
          <View
            style={{
              ...styles.modalView,
              backgroundColor: request?.color || "#000000",
            }}
          >
            {/*  ------------- */}
            <MapView
              style={styles.miniMap}
              showsUserLocation
              provider={PROVIDER_GOOGLE}
              userLocationUpdateInterval={
                locationConstants.driverLocationUpdateSpeed
              }
              userLocationFastestInterval={
                locationConstants.driverLocationUpdateSpeed
              }
              region={{
                longitude: getRegion().longitude,
                latitude: getRegion().latitude,
                latitudeDelta: getRegion().latitudeDelta,
                longitudeDelta: getRegion().longitudeDelta,
              }}
            >
              <Marker
                coordinate={{
                  latitude: clientCoords.latitude,
                  longitude: clientCoords.longitude,
                }}
              />

              <MapViewDirections
                strokeWidth={3}
                origin={{
                  latitude: driverCoords.latitude,
                  longitude: driverCoords.longitude,
                }}
                destination={{
                  latitude: clientCoords.latitude,
                  longitude: clientCoords.longitude,
                }}
                apikey={GOOGLE_MAPS_APIKEY}
              />
            </MapView>

            {/* --------------------- */}
            <FlexContainer flex_direction_r>
              <Button
                onPress={() => setRequesToTaken(request.id)}
                title={"Aceptar"}
              ></Button>

              <Button
                color={"error"}
                onPress={cancellRequest}
                title="Rechazar"
              ></Button>
            </FlexContainer>
            <Text style={styles.waterCount}>{request.user.name}</Text>
            <Text style={styles.waterCount}>
              Cantidad: {request.waterQuantity}L
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    position: "absolute",
    height: "70%",
    width: "100%",
  },
  modalView: {
    margin: 20,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    // borderRadius: 12,
    marginRight: 10,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#F194FF",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  waterCount: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 5,
    fontWeight: "bold",
  },
  miniMap: {
    width: "100%",
    height: "95%",
  },
});
