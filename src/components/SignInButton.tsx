import "../assets/shaderGallery.css";

import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "@firebase/auth";
import { doc, setDoc } from "@firebase/firestore/lite";
import GoogleIcon from "@mui/icons-material/Google";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { useState } from "react";

import { firedb } from "../firebase";

const SignInButton = () => {
  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(auth.currentUser != null);
  onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(user != null);
  });

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });
    signInWithPopup(auth, provider).then((result) => {
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
    });
  };

  return (
    <>
      <Grid item>
        {!isLoggedIn ? (
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<GoogleIcon sx={{ width: "1.2em", height: "1.2em" }} />}
            onClick={() => {
              signInWithGoogle();
            }}
            className="header-button"
          >
            Sign in with google
          </Button>
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
                .catch((_error) => {
                  // An error happened.
                });
            }}
            className="header-button"
            startIcon={
              auth &&
              auth.currentUser && (
                <Avatar
                  alt="Profile Picture"
                  src={auth.currentUser.photoURL?.toString()}
                  sx={{ width: "1.3em", height: "1.3em" }}
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
