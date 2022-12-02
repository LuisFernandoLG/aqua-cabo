import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import {
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
  MEASUREMENT_ID
} from "@env";
// Import the functions you need from the SDKs you need

console.log({ API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID });

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
  measurementId: MEASUREMENT_ID,
};
// const firebaseConfig = {
//   apiKey: "AIzaSyAM-E0Hpbv4FKAGZ3gX8y2KMi2uuW8pXGs",
//   authDomain: "aquacabo-ce44a.firebaseapp.com",
//   projectId: "aquacabo-ce44a",
//   storageBucket: "aquacabo-ce44a.appspot.com",
//   messagingSenderId: "457505846196",
//   appId: "1:457505846196:web:08e7e260f831c1ddd638e1",
//   measurementId: "G-C559FCJDDC",
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app)