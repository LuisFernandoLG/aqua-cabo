// import firebase from "../../database/firebase";
import { manhattanDistance } from "../helpers/manhattanDistance";
import { db } from "../../database/firebase2";
import { set, ref, update, get, onValue } from "firebase/database";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export const api = () => {
  // It has a clean up

  const sendDriverCoordsToDb = async ({ driverId, newCoords }) => {
    const truck = {
      driverId: driverId,
      longitude: newCoords.longitude,
      latitude: newCoords.latitude,
    };
    try {
      set(ref(db, "truckLocations/" + driverId), truck);
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
      set(ref(db, "clientLocations/" + cliendId), clientCoords);
    } catch (error) {
      console.log({ errorRR: error });
    }
  };

  const suscribeToClienRequests = ({ driverId }, cb) => {
    // const suscriber = firebase.db
    //   .collection("requests")
    //   .where("driverId", "==", "YKHOJksCsY0TJzWyH0r6")
    //   .onSnapshot((querySnapshot) => {
    //     // Snapshot
    //     let requests = [];
    //     querySnapshot.docs.forEach(async (doc) => {
    //       // I need to know if it desapears when another screen is opened PENDING
    //       const { driverId, clientId, distance, quantity, status } = doc.data();
    //       const clientRef = firebase.db
    //         .collection("clientLocations")
    //         .doc(clientId);
    //       const { longitude, latitude } = await clientRef.get();
    //       requests.push({
    //         driverId,
    //         client: {
    //           clientId,
    //           longitude,
    //           latitude,
    //         },
    //         distance,
    //         quantity,
    //         status,
    //         id: doc.id,
    //       });
    //     });
    //     cb({ requests });
    //   });
    // return () => suscriber();
  };

  const changeRequestStatus = ({ newStatus, requestId }) => {
    try {
      set(ref(db, "clientRequests/" + requestId + "/status"), newStatus);
    } catch (error) {
      console.log({ errorRR: error });
    }
  };


  const suscribeToWatchClientRequests = async ({ driverId }, cb) => {
    // console.log("YOU WERE SUSCRIBED TO suscribeToWatchClientRequests");

    const clientRequestsRef = ref(db, "clientRequests");
    onValue(clientRequestsRef, (snapshot) => {
      const data = snapshot.val();
      const array = Object.values(data);
      // console.log({ driverId, array });
      const requests = array.filter((item) => item.driverId === driverId);
      cb(requests);
    });
    // const suscriber = firebase.db
    //   .collection("clientRequests")
    //   .where("driverId", "==", driverId)
    //   .where("status", "==", "PENDING")
    //   .onSnapshot((querySnapshot) => {
    //     let requests = [];
    //     querySnapshot.docs.forEach((doc) => {
    //       // I need to know if it desapears when another screen is opened PENDING
    //       requests.push({
    //         id: doc.id,
    //         ...doc.data(),
    //       });
    //     });

    //     cb({ requests });
    //   });

    // return () => suscriber();
  };

  const suscribeToWatchTruckLocations = async (cb) => {
    const truckLocationsRef = ref(db, "truckLocations");
    onValue(truckLocationsRef, (snapshot) => {
      const data = snapshot.val();
      const array = Object.values(data);
      cb(array);
    });
    // const suscriber = firebase.db
    //   .collection("truckLocations")
    //   .onSnapshot((querySnapshot) => {
    //     let trucksArray = [];
    //     querySnapshot.docs.forEach((doc) => {
    //       // I need to know if it desapears when another screen is opened PENDING
    //       const { driverId, longitude, latitude } = doc.data();
    //       trucksArray.push({
    //         driverId,
    //         coordinate: { longitude, latitude },
    //         id: doc.id,
    //       });
    //     });
    //     cb({ trucksArray });
    //   });
    // return () => suscriber();
  };

  const sendRequestToCloserDriver = async ({
    clientId,
    waterQuantity,
    clientCoords,
    trucks,
  }) => {
    const truck = getCloserTruck({ trucks, clientCoords });
    const request = {
      clientCoords: clientCoords,
      clientId: clientId,
      waterQuantity: waterQuantity,
      status: "PENDING",
      driverId: truck.driverId,
    };

    try {
      set(ref(db, "clientRequests/" + clientId), request);
    } catch (error) {
      console.log({ errorRR: error });
    }
  };

  const setRequestToTaken = async ({ requestId }) => {
    // try {
    //   update(ref(db, "clientRequests/" + requestId + "/status"), "TAKEN");
    // } catch (error) {
    //   console.log({ errorRR: error });
    // }
  };

  const suscribeToWatchRequestsTakenDriverVersion = async (
    { driverId },
    cb
  ) => {
    // const suscriber = firebase.db
    //   .collection("clientRequests")
    //   .where("driverId", "==", driverId)
    //   .where("status", "==", "TAKEN")
    //   .onSnapshot((querySnapshot) => {
    //     let takenRequests = [];
    //     querySnapshot.docs.forEach((doc) => {
    //       takenRequests.push({
    //         ...doc.data(),
    //         id: doc.id,
    //       });
    //     });
    //     cb({ takenRequests });
    //   });
    // return () => suscriber();
  };

  const suscibeToRequestChanges = ({ clientId }, cb) => {
    console.log({ clientId });
    const clientRequestsRef = ref(db, "clientRequests");
    onValue(clientRequestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const array = Object.values(data);
        // console.log({ array });
        const requestFound = array.find((item) => item.clientId === clientId);
        cb(requestFound);
      }
    });
  };

  const suscribeToWatchRequestsTakenClientVersion = ({ clientId }, cb) => {
    // const suscriber = firebase.db
    //   .collection("clientRequests")
    //   .where("clientId", "==", clientId)
    //   .where("status", "==", "TAKEN")
    //   .onSnapshot((querySnapshot) => {
    //     let takenRequests = [];
    //     querySnapshot.docs.forEach((doc) => {
    //       takenRequests.push({
    //         ...doc.data(),
    //         id: doc.id,
    //       });
    //     });
    //     cb({ takenRequests });
    //   });
    // return () => suscriber();
  };

  const suscribeToPendingRequestsClientVersion = ({ clientId }, cb) => {
    // const suscriber = firebase.db
    //   .collection("clientRequests")
    //   .where("clientId", "==", clientId)
    //   .where("status", "==", "PENDING")
    //   .onSnapshot((querySnapshot) => {
    //     let pendingRequests = [];
    //     querySnapshot.docs.forEach((doc) => {
    //       pendingRequests.push({
    //         ...doc.data(),
    //         id: doc.id,
    //       });
    //     });
    //     cb({ pendingRequests });
    //   });
    // return () => suscriber();
  };

  const login = async ({ email, password }) =>
    new Promise((resolve, reject) => {
      const auth = getAuth();

      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          const path = `/users/${user.uid}`;
          get(ref(db, path))
            .then((snapshot) => {
              if (snapshot.exists()) {
                const authUser = snapshot.val();
                resolve(authUser);
              } else {
                reject("No data available");
              }
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          // const errorCode = error.code;
          // const errorMessage = error.message;
          reject(error.message);
        });
    });

  return {
    sendDriverCoordsToDb,
    suscribeToClienRequests,
    sendClientCoordsToDb,
    suscribeToWatchTruckLocations,
    sendRequestToCloserDriver,
    suscibeToRequestChanges,
    suscribeToWatchClientRequests,
    setRequestToTaken,
    suscribeToWatchRequestsTakenDriverVersion,
    suscribeToWatchRequestsTakenClientVersion,
    suscribeToPendingRequestsClientVersion,
    login,
    changeRequestStatus,
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
          truck.longitude,
          truck.latitude,
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

function login() {
  // consulta a firebase
  // toma 5s

  return true;
}
