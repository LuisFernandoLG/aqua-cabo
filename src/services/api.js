import firebase from "../../database/firebase";
import { manhattanDistance } from "../helpers/manhattanDistance";

export const api = () => {
  // It has a clean up

  const sendDriverCoordsToDb = async ({ driverId, newCoords }) => {
    const truck = {
      driverId: driverId,
      longitude: newCoords.longitude,
      latitude: newCoords.latitude,
    };
    try {
      const truckRef = await firebase.db
        .collection("truckLocations")
        .doc(truck.driverId)
        .set(truck, { merge: true });
    } catch (error) {
      console.log({ errorRR: error });
    }
  };

  const sendClientCoordsToDb = async ({ cliendId, newCoords }) => {
    const clientCoords = {
      cliendId: cliendId,
      longitude: newCoords.longitude,
      latitude: newCoords.latitude,
    };
    try {
      const clientRef = await firebase.db
        .collection("clientLocations")
        .doc(clientCoords.cliendId)
        .set(clientCoords, { merge: true });
    } catch (error) {
      console.log("");
      console.log({ errorRR: error });
    }
  };

  const suscribeToClienRequests = ({ driverId }, cb) => {
    const suscriber = firebase.db
      .collection("requests")
      .where("driverId", "==", "YKHOJksCsY0TJzWyH0r6")
      .onSnapshot((querySnapshot) => {
        // Snapshot
        let requests = [];
        querySnapshot.docs.forEach(async (doc) => {
          // I need to know if it desapears when another screen is opened PENDING
          const { driverId, clientId, distance, quantity, status } = doc.data();

          const clientRef = firebase.db
            .collection("clientLocations")
            .doc(clientId);
          const { longitude, latitude } = await clientRef.get();

          requests.push({
            driverId,
            client: {
              clientId,
              longitude,
              latitude,
            },
            distance,
            quantity,
            status,
            id: doc.id,
          });
        });

        cb({ requests });
      });

    return () => suscriber();
  };

  const suscribeToWatchClientRequests = async ({ driverId }, cb) => {
    console.log("YOU WERE SUSCRIBED TO suscribeToWatchClientRequests");
    console.log({ driverId });
    const suscriber = firebase.db
      .collection("clientRequests")
      .where("driverId", "==", driverId)
      .where("status", "==", "PENDING")
      .onSnapshot((querySnapshot) => {
        let requests = [];
        querySnapshot.docs.forEach((doc) => {
          // I need to know if it desapears when another screen is opened PENDING
          requests.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        cb({ requests });
      });

    return () => suscriber();
  };

  const setRequestToaken = async ({ requestId }) => {
    const request = {
      status: "TAKEN",
    };
    try {
      const requestRef = await firebase.db
        .collection("clientRequests")
        .doc(requestId)
        .set(request, { merge: true });
    } catch (error) {
      console.log({ errorRR: error });
    }
  };

  const suscribeToWatchTruckLocations = async (cb) => {
    const suscriber = firebase.db
      .collection("truckLocations")
      .onSnapshot((querySnapshot) => {
        let trucksArray = [];
        querySnapshot.docs.forEach((doc) => {
          // I need to know if it desapears when another screen is opened PENDING
          const { driverId, longitude, latitude } = doc.data();
          trucksArray.push({
            driverId,
            coordinate: { longitude, latitude },
            id: doc.id,
          });
        });

        cb({ trucksArray });
      });

    return () => suscriber();
  };

  const sendRequestToCloserDriver = async ({
    clientId,
    waterQuantity,
    clientCoords,
    trucks,
  }) => {
    const truck = getCloserTruck({ trucks, clientCoords });
    console.log({ truck });
    console.log({ clientId });

    const request = {
      clientCoords: clientCoords,
      clientId: clientId,
      waterQuantity: waterQuantity,
      status: "PENDING",
      driverId: truck.driverId,
    };

    console.log({ requestToBeSent: request });

    console.log({ request });

    try {
      const requestRef = firebase.db.collection("clientRequests").doc();
      await requestRef.set(request);
      return requestRef;
    } catch (error) {
      console.log({ errorRR: error });
    }
  };

  const setRequestToTaken = async ({ requestId }) => {
    const request = {
      status: "TAKEN",
    };

    try {
      const requestRef = firebase.db
        .collection("clientRequests")
        .doc(requestId);
      await requestRef.set(request, { merge: true });
      return requestRef;
    } catch (error) {
      console.log({ errorRR: error });
    }
  };

  const suscribeToWatchRequestsTakenDriverVersion = async (
    { driverId },
    cb
  ) => {
    const suscriber = firebase.db
      .collection("clientRequests")
      .where("driverId", "==", driverId)
      .where("status", "==", "TAKEN")
      .onSnapshot((querySnapshot) => {
        let takenRequests = [];
        querySnapshot.docs.forEach((doc) => {
          takenRequests.push({
            ...doc.data(),
            id: doc.id,
          });
        });

        cb({ takenRequests });
      });

    return () => suscriber();
  };

  const suscribeToWatchRequestsTakenClientVersion = ({ clientId }, cb) => {
    const suscriber = firebase.db
      .collection("clientRequests")
      .where("clientId", "==", clientId)
      .where("status", "==", "TAKEN")
      .onSnapshot((querySnapshot) => {
        let takenRequests = [];
        querySnapshot.docs.forEach((doc) => {
          takenRequests.push({
            ...doc.data(),
            id: doc.id,
          });
        });

        cb({ takenRequests });
      });

    return () => suscriber();
  };

  const suscribeToPendingRequestsClientVersion = ({ clientId }, cb) => {
    const suscriber = firebase.db
      .collection("clientRequests")
      .where("clientId", "==", clientId)
      .where("status", "==", "PENDING")
      .onSnapshot((querySnapshot) => {
        let pendingRequests = [];
        querySnapshot.docs.forEach((doc) => {
          pendingRequests.push({
            ...doc.data(),
            id: doc.id,
          });
        });

        cb({ pendingRequests });
      });

    return () => suscriber();
  };

  return {
    sendDriverCoordsToDb,
    suscribeToClienRequests,
    sendClientCoordsToDb,
    suscribeToWatchTruckLocations,
    sendRequestToCloserDriver,
    suscribeToWatchClientRequests,
    setRequestToaken,
    setRequestToTaken,
    suscribeToWatchRequestsTakenDriverVersion,
    suscribeToWatchRequestsTakenClientVersion,
    suscribeToPendingRequestsClientVersion
  };
};

// Functions part of api

const orderByDistances = (array) => {
  return array.sort((a, b) => a.distance - b.distance);
};

const getCloserTruck = ({ trucks, clientCoords }) => {
  try {
    const distances = trucks.map((truck) => {
      return {
        ...truck,
        distance: manhattanDistance(
          truck.coordinate.longitude,
          truck.coordinate.latitude,
          clientCoords.longitude,
          clientCoords.longitude
        ),
      };
    });

    if (distances.length === 0) throw new Error("No hay camiones disponibles");
    const nearestTruck = orderByDistances(distances)[0];
    return nearestTruck;
  } catch (error) {
    console.log(error.message);
  }
};

function login(){
  // consulta a firebase
  // toma 5s

  return true
}



