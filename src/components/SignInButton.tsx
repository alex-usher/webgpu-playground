import { useState } from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "@firebase/auth";
import { firedb } from "../firebase";
import { doc, setDoc } from "@firebase/firestore/lite";
import Avatar from "@mui/material/Avatar";
import GoogleIcon from "@mui/icons-material/Google";
import "../assets/shaderGallery.css";

const SignInButton = () => {
  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(auth.currentUser != null);
  onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(user != null);
  });

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
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
