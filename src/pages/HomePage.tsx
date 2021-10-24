import React from "react";
import { useState } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import GoogleButton from "react-google-button";
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

import "../assets/homePage.css";

class HomePage extends React.Component {
  // constructor(props) {
  //     super(props)
  //     this.state = {
  //         shaders: []
  //     }
  // }

  // componentDidMount() {
  //     // TODO replace with api call to get shaders
  // }

  render() {
    return (
      <Container>
        <Grid
          container
          spacing={2}
          style={{ paddingTop: "100px" }}
          alignItems="center"
          justifyContent="flex-end"
        >
          <Grid
            item
            container
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            className="title-header"
          >
            <Grid item>
              <Typography variant="h3">WebGPU Playground</Typography>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                disableElevation
                component={Link}
                to="/editor"
              >
                New Shader Sandbox
              </Button>
            </Grid>
            <SignInButton />
          </Grid>
          {/* this.state.shaders.map() */}
          <ShaderCard />
          <ShaderCard />
          <ShaderCard />
        </Grid>
      </Container>
    );
  }
}

const SignInButton = () => {
  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(auth.currentUser!=null);
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
            startIcon={auth && auth.currentUser && (
                <Avatar
                  alt="Profile Picture"
                  src={auth.currentUser.photoURL?.toString()}
                />
              )}
          >
            Sign Out
          </Button>
        )}
      </Grid>
    </>
  );
};

const ShaderCard = () => {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card variant="outlined">
        <CardActionArea
          component={Link}
          to="/editor"
          className="shader-card"
          style={{ height: "20%", background: "#4F5358", color: "white" }}
        >
          <CardMedia
            className="shader-card-image"
            component="img"
            src="https://i.ibb.co/M5Z06wy/triangle.png"
          />
          <CardContent>
            <Typography variant="h4" align="left">
              Triangle
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
};

export default HomePage;
