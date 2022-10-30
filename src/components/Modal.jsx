import React, { useState } from "react";
import { Alert, Modal, StyleSheet, Text, Pressable, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { FlexContainer } from "./FlexContainer";
import { GOOGLE_MAPS_APIKEY } from "@env";
import MapViewDirections from "react-native-maps-directions";
import { getRegionForCoordinates } from "../helpers/getRegionForCoordinates";

const answers = {
  YES: "YES",
  NO: "NO",
};

export const ModalX = ({
  setAnswer,
  isOpen,
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
          <View style={styles.modalView}>
            {/*  ------------- */}
            <MapView
              style={styles.miniMap}
              showsUserLocation
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
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setRequesToTaken(request.id)}
              >
                <Text style={styles.textStyle}>Aceptar</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => handleAnswer(answers.NO)}
              >
                <Text style={styles.textStyle}>Rechazar</Text>
              </Pressable>
            </FlexContainer>
          </View>
        </View>
      </Modal>
      <Pressable
        style={[styles.button, styles.buttonOpen]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.textStyle}>Show Modal</Text>
      </Pressable>
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

    backgroundColor: "#2196F3",
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
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
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

  miniMap: {
    width: "100%",
    height: "100%",
  },
});
