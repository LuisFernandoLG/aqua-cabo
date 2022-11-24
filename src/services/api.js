import { manhattanDistance } from "../helpers/manhattanDistance";
import {
  set,
  ref,
  push,
  get,
  onValue,
  remove,
  onDisconnect,
  off,
  serverTimestamp,
  update,
} from "firebase/database";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getRandomColor } from "../helpers/getRandomColor";

export const api = () => {
  let listeners = [];
  const sendDriverCoordsToDb = async ({ driverId, newCoords }) => {
    const truck = {
      driverId: driverId,
      longitude: newCoords.longitude,
      latitude: newCoords.latitude,
      isOnline: true,
      lastStatus: serverTimestamp(),
    };
    try {
      update(ref(db, "truckLocations/" + driverId), truck);
    } catch (error) {
      console.log({ errorRR: error });
    }
  };

  const sendLastTimestamp = async ({ driverId }) => {
    
  };

  const sendClientCoordsToDb = async ({ cliendId, newCoords }) => {
    if (!cliendId && !newCoords) return false;
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

  const getDoneRequestByUser = ({ clientId }) =>
    new Promise((resolve, reject) => {
      const path = `/doneRequests/${clientId}`;
      get(ref(db, path))
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = Object.values(snapshot.val());
            resolve(data);
          } else {
            reject("No data available");
          }
        })
        .catch((error) => {
          reject(error);
        });
    });

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
    const listenerReference = onValue(clientRequestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const array = Object.values(data);
        const requests = array.filter((item) => item.driverId === driverId);
        cb(requests);
      } else {
        cb([]);
      }
    });

    listeners.push(listenerReference);
  };

  const suscribeToWatchTruckLocations = async (cb) => {
    const truckLocationsRef = ref(db, "truckLocations");
    const listenerRefernce = onValue(truckLocationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const array = Object.values(data);
        cb(array);
      } else {
        cb([]);
      }
    });

    listeners.push(listenerRefernce);
  };

  const getTrucksWithEnoughWater = async ({ waterQuantity, trucks }) => {
    return new Promise((resolve, reject) => {
      const reff = ref(db, "clientRequests/");
      onValue(reff, (snapshot) => {
        const data = snapshot.val() ? snapshot.val() : [];

        const array = Object.values(data);
        let waterRequestedByTrucks = {};

        array.forEach((item) => {
          if (item.status === "DONE") return false;
          let key = item.driverId;
          let prevValue = waterRequestedByTrucks[item.driverId]
            ? waterRequestedByTrucks[item.driverId]
            : 0;
          waterRequestedByTrucks = {
            [key]: prevValue + item.waterQuantity,
          };
        });

        const trucksWithEnoughWater = trucks.filter((item) => {
          let truckTotalWaterRequested = waterRequestedByTrucks[item.driverId]
            ? waterRequestedByTrucks[item.driverId]
            : 0;
          let truckTotalWater = item.esp32.litros;
          let hypoteticalWater = truckTotalWater - truckTotalWaterRequested;
          return hypoteticalWater >= waterQuantity;
        });

        if (trucksWithEnoughWater.length === 0) {
          reject("No hay camiones con suficiente agua");
        }

        resolve(trucksWithEnoughWater);
      });
    });
  };

  const sendRequestToCloserDriver = async (
    { clientId, waterQuantity, clientCoords, trucks, user, total },
    cb
  ) => {
    return new Promise(async (resolve, reject) => {
      getTrucksWithEnoughWater({ trucks, waterQuantity })
        .then((newTrucks) => {
          var today = new Date();
          // obtener la fecha y la hora
          var now = today.toLocaleString();

          const truck = getCloserTruck({ trucks: newTrucks, clientCoords });
          const request = {
            clientCoords: clientCoords,
            clientId: clientId,
            waterQuantity: waterQuantity,
            status: "PENDING",
            driverId: truck.driverId,
            date: now,
            user,
            total,
            color: getRandomColor()
          };

          try {
            set(ref(db, "clientRequests/" + clientId), request).then(() => {
              resolve(true);
            });
          } catch (error) {
            console.log({ errorRR: error });
            reject("Algo salió mal al enviar la solicitud");
          }
        })
        .catch((error) => {
          console.log("error", error);
          reject(error);
        });
    });
    // console.log({trucks})
    // obtener sumatoria del agua de los pedidos

    // obtener el agua total del camion

    // verificar si el camion tiene agua suficiente

    // si tiene agua suficiente, enviar el pedido
  };

  const suscibeToRequestChanges = ({ clientId }, cb) => {
    const clientRequestsRef = ref(db, "clientRequests");
    const listener = onValue(clientRequestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const array = Object.values(data);
        const requestFound = array.find((item) => item.clientId === clientId);
        if (requestFound) {
          cb(requestFound);
        } else {
          cb([]);
        }
      } else {
        cb([]);
      }
    });

    listeners.push(listener);
  };

  const unsuscribeOfAllListener = () => {
    listeners.forEach((listener) => {
      off(listener);
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
          reject({ errorCode, errorMessage });
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
          reject({ errorCode, errorMessage });
        });
    });

  const setOfflineOnDisconnect = async ({ driverId }, cb) => {
    const presenceRef = ref(db, "truckLocations/" + driverId + "/isOnline");
    const dis = onDisconnect(presenceRef);
    await dis.set(false);
    cb(dis);
  };

  const setOffline = async ({ driverId }) => {
    const reff = ref(db, "truckLocations/" + driverId + "/isOnline");
    set(reff, false);
  };

  const changeStateOfWater = ({ userId, value }) => {
    const reff = ref(db, "truckLocations/" + userId + "/esp32/isOpen");
    set(reff, value);
  };

  const suscribeToAmIConnected = (cb) => {
    const connectedRef = ref(db, ".info/connected");
    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        cb(true);
      } else {
        cb(false);
      }
    });
  };

  const suscribeToWaterLevel = (id, cb) => {
    const url = `truckLocations/${id}/esp32/litros`
    const connectedRef = ref(db, url);
    onValue(connectedRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        cb(data);
      } else {
        cb("???");
      }
    });
  };

  const getPriceLt = (cb)=> {
    const connectedRef = ref(db, "waterCostByLt");
    onValue(connectedRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        cb(data);
      } else {
        reject(false);
      }
    });}

  return {
    sendDriverCoordsToDb,
    registerClient,
    registerDriver,
    sendClientCoordsToDb,
    suscribeToWatchTruckLocations,
    sendRequestToCloserDriver,
    suscibeToRequestChanges,
    suscribeToWatchClientRequests,
    login,
    changeRequestStatus,
    removeClientRequest,
    saveClientRequest,
    getDoneRequestByUser,
    setOfflineOnDisconnect,
    suscribeToAmIConnected,
    unsuscribeOfAllListener,
    sendLastTimestamp,
    setOffline,
    suscribeToWaterLevel,
    changeStateOfWater,
    getPriceLt
  };
};

// Functions part of api
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

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
