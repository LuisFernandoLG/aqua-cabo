// import firebase from "../../database/firebase";
import { manhattanDistance } from "../helpers/manhattanDistance";
import { db, auth } from "../../database/firebase2";
import { set, ref, push, get, onValue, remove } from "firebase/database";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

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

  const saveClientRequest = async ({ clientId, request }) => {
    try {
      const savedItem = await push(
        ref(db, "doneRequests/" + clientId),
        request
      );
      return savedItem;
    } catch (error) {
      console.log({ error });
    }
  };

  const removeClientRequest = async ({ requestId }) => {
    try {
      const savedItem = await remove(ref(db, "clientRequests/" + requestId));
      return savedItem;
    } catch (error) {
      console.log({ error });
    }
  };

  const changeRequestStatus = async ({ newStatus, requestId }, cb) => {
    try {
      await set(ref(db, "clientRequests/" + requestId + "/status"), newStatus);
      cb(newStatus);
    } catch (error) {
      console.log({ errorRR: error });
    }
  };

  const suscribeToWatchClientRequests = async ({ driverId }, cb) => {
    const clientRequestsRef = ref(db, "clientRequests");
    onValue(clientRequestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const array = Object.values(data);
        const requests = array.filter((item) => item.driverId === driverId);
        cb(requests);
      } else {
        cb([]);
      }
    });
  };

  const suscribeToWatchTruckLocations = async (cb) => {
    const truckLocationsRef = ref(db, "truckLocations");
    onValue(truckLocationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const array = Object.values(data);
        cb(array);
      } else {
        cb([]);
      }
    });
  };

  const sendRequestToCloserDriver = async (
    { clientId, waterQuantity, clientCoords, trucks },
    cb
  ) => {
    const truck = getCloserTruck({ trucks, clientCoords });
    const request = {
      clientCoords: clientCoords,
      clientId: clientId,
      waterQuantity: waterQuantity,
      status: "PENDING",
      driverId: truck.driverId,
    };

    try {
      await set(ref(db, "clientRequests/" + clientId), request);
      cb();
    } catch (error) {
      console.log({ errorRR: error });
    }
  };

  const suscibeToRequestChanges = ({ clientId }, cb) => {
    console.log({ clientId });
    const clientRequestsRef = ref(db, "clientRequests");
    onValue(clientRequestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const array = Object.values(data);
        const requestFound = array.find((item) => item.clientId === clientId);
        cb(requestFound);
      } else {
        cb([]);
      }
    });
  };

  const login = async ({ email, password }) =>
    new Promise((resolve, reject) => {
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

  const registerClient = ({ email, password, userForm }) =>
    new Promise((resolve, reject) => {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;

          userForm = { ...userForm, id: user.uid, type: "CLIENT" };

          set(ref(db, "users/" + user.uid), userForm)
            .then((_) => {
              resolve(userForm);
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          reject({errorCode, errorMessage});
        });
    });

    const registerDriver = ({ email, password, userForm }) =>
    new Promise((resolve, reject) => {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;

          userForm = { ...userForm, id: user.uid, type: "DRIVER" };

          set(ref(db, "users/" + user.uid), userForm)
            .then((_) => {
              resolve(userForm);
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          reject({errorCode, errorMessage});
        });
    });

  return {
    sendDriverCoordsToDb,
    registerClient,registerDriver,
    sendClientCoordsToDb,
    suscribeToWatchTruckLocations,
    sendRequestToCloserDriver,
    suscibeToRequestChanges,
    suscribeToWatchClientRequests,
    login,
    changeRequestStatus,
    removeClientRequest,
    saveClientRequest,
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
