import { initializeApp } from "@firebase/app";
import { getAnalytics } from "@firebase/analytics";
import { getAuth } from "@firebase/auth";
import { getFirestore } from "@firebase/firestore/lite";
import { getStorage } from "@firebase/storage";

const config = {
  apiKey: "AIzaSyDRq0yGdgEV81Y2ZvKlpn50_qQuJls5vDA",
  authDomain: "web-gpu-playground.firebaseapp.com",
  projectId: "web-gpu-playground",
  storageBucket: "web-gpu-playground.appspot.com",
  messagingSenderId: "887973952377",
  appId: "1:887973952377:web:2f10a890649d36ddf68da8",
  measurementId: "G-81MQK3F4DH",
};

const fire = initializeApp(config);
const firestorage = getStorage();
const analytics = getAnalytics(fire);
const auth = getAuth(fire);
const firedb = getFirestore(fire);

export default fire;
export { auth, firedb, analytics, firestorage };
