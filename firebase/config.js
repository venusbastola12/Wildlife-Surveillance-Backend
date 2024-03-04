// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, getDocs } from "firebase/firestore/lite";
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
} = require("firebase/firestore/lite");

const firebaseConfig = {
  apiKey: "AIzaSyA1s4OA6s7xSqy50dq7HcmB0n1E4-lFoJI",
  authDomain: "wildlife-survillience.firebaseapp.com",
  projectId: "wildlife-survillience",
  storageBucket: "wildlife-survillience.appspot.com",
  messagingSenderId: "586064442808",
  appId: "1:586064442808:web:56563d14e2dfed01b48b4d",
  measurementId: "G-TSYELLZRRT",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const Image = collection(db, "images");

module.exports = Image;
