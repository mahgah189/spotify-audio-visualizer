import React from "react";
import "./WebPlayback.css";
import { callRefreshToken } from "/src/functions/oauth.js";

function WebPlayback({ isLoggedIn }) {
  const [player, setPlayer] = React.useState(undefined);

  const userRef = {
    uid: undefined,
    token: undefined,
    expirationTime: undefined,
    loggedIn: undefined
  };

  if (sessionStorage.getItem("userRef")) {
    const sessionUser = JSON.parse(sessionStorage.getItem("userRef"));
    userRef.uid = sessionUser.uid;
    userRef.token = sessionUser.token;
    userRef.expirationTime = sessionUser.expirationTime;
    userRef.loggedIn = sessionUser.loggedIn;
  };

  React.useEffect(() => {
    if (userRef.loggedIn) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
  
      document.body.appendChild(script);
  
      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: "Web Playback SDK",
          getOauthToken: async (cb) => {
              if (Date.now() > userRef.expirationTime) {
                const refreshedToken = await callRefreshToken(userRef.uid);
                console.log("token refreshed");
                cb(refreshedToken);
              } else if (Date.now() < userRef.expirationTime) {
                console.log("token retrieved")
                cb(userRef.token);
              }
            },
          volume: 0.5
        });
  
        setPlayer(player);
  
        player.addListener("ready", ({ device_id }) => {
          console.log("Ready with device:", device_id);
        });
        player.addListener("not_ready", ({ device_id }) => {
          console.log("Device has gone offline:", device_id);
        });
        player.addListener('player_state_changed', ( state => {
          if (!state) {
              return;
          }
  
          setTrack(state.track_window.current_track);
          setPaused(state.paused);
  
          player.getCurrentState().then( state => { 
              (!state)? setActive(false) : setActive(true) 
          });
      }));
  
        player.connect();
      };
    }
  }, [isLoggedIn]);

  return (
    <>
    </>
  )
};

export default WebPlayback;