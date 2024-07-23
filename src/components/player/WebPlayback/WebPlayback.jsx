import React from "react";
import "./WebPlayback.css";
import { callRefreshToken } from "/src/functions/oauth.js";

function WebPlayback({ accessToken, tokenExpired, updateTokenState, updateTokenExpiredStateToFalse, isLoggedIn }) {
  const { token, uid } = accessToken;

  const [player, setPlayer] = React.useState(undefined);

  React.useEffect(() => {
    if (isLoggedIn) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
  
      document.body.appendChild(script);
  
      console.log(accessToken);
  
      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: "Web Playback SDK",
          getOauthToken: async (cb) => {
              if (tokenExpired === true || tokenExpired === undefined && uid) {
                const refreshedToken = await callRefreshToken(uid);
                console.log(refreshedToken);
                updateTokenExpiredStateToFalse;
                updateTokenState(refreshedToken, uid);
                cb(refreshedToken);
              } else if (tokenExpired === false) {
                cb(token);
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