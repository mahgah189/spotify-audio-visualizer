const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

const tokenEndpoint = "https://accounts.spotify.com/api/token";

admin.initializeApp();

const generateRandomString = (length) => {
  let randomStr = "";
  const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabsdefghijklmnopqrstuvwxyz1234567890";
  for (let i = 0; i < length; i++) {
    randomStr += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return randomStr;
};

const getSpotifyAccessToken = async (clientId, clientSecret) => {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  // eslint-disable max-len
  const body = `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`;
  // eslint-disable max-len
  try {
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: headers,
      body: body,
      redirect: "follow",
    });
    return await response.json();
  } catch (error) {
    logger.error("Error fetching Spotify access token:", error);
    throw new Error("Unable to fetch Spotify access token");
  }
};

// const createFirebaseUserAccount = async (spotifyId, displayName, email, profilePic) => {
//   const uid = `spotify:${spotifyId}`;
//   try {
//     await admin.auth().getUser(uid);
//     await admin.auth().updateUser(uid, {
//       displayName: displayName,
//       email: email,
//       photoURL: profilePic,
//     });
//   } catch (error) {
//     if (error.code === "auth/user-not-found") {
//       return admin.auth().createUser({
//         uid: uid,
//         displayName: displayName,
//         email: email,
//         photoURL: profilePic,
//       });
//     } else {
//       throw error;
//     }
//   }
//   const firebaseToken = await admin.auth().createCustomToken(uid);
//   logger.log(
//     `Created custom token for ${uid}: ${firebaseToken}`,
//   );
//   return firebaseToken;
// };

exports.getSpotifyToken = onRequest(
  {secrets: ["SPOTIFY_CLIENT_SECRET"]},
  (request, response) => {
    cors(request, response, async () => {
      try {
        const token = await getSpotifyAccessToken(
          process.env.SPOTIFY_CLIENT_ID,
          process.env.SPOTIFY_CLIENT_SECRET,
        );
        response.send({
          "status": "success",
          "data": token,
        });
      } catch (error) {
        response.status(500).send("Error getting Spotify access token");
      }
    });
  },
);

exports.login = onRequest(
  (request, response) => {
    cors(request, response, () => {
      // const origin = request.headers.origin;
      const state = generateRandomString(16);
      const scope = "streaming user-read-email user-read-private";
      // const allowedOrigins = [
      //   "http://localhost:5173",
      //   "spotify-audio-visualizer.web.app",
      // ];
      // if (!allowedOrigins.includes(origin)) {
      //   return response.status(403).json({error: "Forbidden origin"});
      // }
      const oauthParams = new URLSearchParams({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: "https://callback-hgv7fgobsq-uc.a.run.app",
        state: state,
      });
      response.redirect("https://accounts.spotify.com/authorize/?" + oauthParams.toString());
    });
  },
);

exports.callback = onRequest(
  {secrets: ["SPOTIFY_CLIENT_SECRET"]},
  (request, response) => {
    cors(request, response, async () => {
      const {state, code} = request.query;

      console.log("Received state:", state);
      console.log("Authorization code:", code);

      if (!state) {
        return response.status(403).json({error: "State parameter missing"});
      }
      try {
        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Authorization": "Basic " + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64")),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            code: code,
            redirect_uri: "https://callback-hgv7fgobsq-uc.a.run.app",
            grant_type: "authorization_code",
          }).toString(),
        });

        console.log("Token response status:", tokenResponse.status);
        if (!tokenResponse.ok) {
          console.log("Token response error:", await tokenResponse.text());
          throw new Error("Failed to fetch token");
        }

        const tokenData = await tokenResponse.json();

        console.log("Token data:", tokenData);

        const {access_token, refresh_token} = tokenData;
        const spotifyResponse = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        console.log("Spotify response status:", spotifyResponse.status);
        if (!spotifyResponse.ok) {
          console.log("Spotify response error:", await spotifyResponse.text());
          throw new Error("Failed to fetch Spotify user data");
        }

        const spotifyUser = await spotifyResponse.json();

        console.log("Spotify user data:", spotifyUser);

        response.cookie("spotify_refresh_token", refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
        });

        response.redirect(`http://localhost:5173/?access_token=${access_token}`);
      } catch (error) {
        response.status(500).send("Error getting Spotify access token");
      }
    });
  },
);
