import { useState } from "react";
import GoogleButton from "react-google-button";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { firedb } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import Avatar from "@mui/material/Avatar";

const SignInButton = () => {
  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(auth.currentUser != null);
  onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(user != null);
  });

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        const userUid = user.uid;

        if (user !== null) {
          setDoc(doc(firedb, "users", userUid), {
            uid: userUid,
            name: user.displayName,
            email: user.email,
            photoUrl: user.photoURL,
          });
        }
      })
      .catch((error) => {});
  };

  return (
    <>
      <Grid item>
        {!isLoggedIn ? (
          <GoogleButton
            onClick={() => {
              signInWithGoogle();
            }}
          />
        ) : (
          <Button
            variant="outlined"
            color="warning"
            disableElevation
            onClick={() => {
              signOut(auth)
                .then(() => {
                  // Sign-out successful.
                })
                .catch((error) => {
                  // An error happened.
                });
            }}
            startIcon={
              auth &&
              auth.currentUser && (
                <Avatar
                  alt="Profile Picture"
                  src={auth.currentUser.photoURL?.toString()}
                />
              )
            }
          >
            Sign Out
          </Button>
        )}
      </Grid>
    </>
  );
};

export default SignInButton;
