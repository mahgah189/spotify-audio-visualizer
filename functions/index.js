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

const createFirebaseUserAccount = async (spotifyId, displayName, email, profilePic) => {
  const uid = `spotify:${spotifyId}`;
  try {
    await admin.auth().getUser(uid);
    await admin.auth().updateUser(uid, {
      displayName: displayName,
      email: email,
      photoURL: profilePic,
    });
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return admin.auth().createUser({
        uid: uid,
        displayName: displayName,
        email: email,
        profilePic: profilePic,
      });
    } else {
      throw error;
    }
  }
  const firebaseToken = await admin.auth().createCustomToken(uid);
  logger.log(
    `Created custom token for ${uid}: ${firebaseToken}`,
  );
  return firebaseToken;
};

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
      response.cookie("spotify_auth_state", state, {
        secure: true,
        httpOnly: true,
        sameSite: "Strict",
      });
      const oauthParams = new URLSearchParams({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: "http://localhost:5173/callback",
        state: state,
      });
      response.redirect("https://accounts.spotify.com/authorize/?" + oauthParams.toString());
    });
  },
);

exports.callback = onRequest(
  {secrets: ["SPOTIFY_CLIENT_SECRET"]},
  async (request, response) => {
    const {state, code} = request.query;
    const storedState = request.cookies.spotify_auth_state;
    if (!storedState) {
      return response.status(403).json({error: "No stored state found"});
    } else if (state !== storedState) {
      return response.status(403).json*({error: "State parameter doesn't match"});
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
          redirect_uri: "http://localhost:5173/callback",
          grant_type: "authorization_code:",
        }).toString(),
      });
      const tokenData = await tokenResponse.json();
      const {access_token, refresh_token} = tokenData;
      const spotifyResponse = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      const spotifyUser = await spotifyResponse.json();
      const firebaseToken = await createFirebaseUserAccount(spotifyUser.id, spotifyUser.display_name, spotifyUser.email, spotifyUser.images[0].url);
      response.redirect(`http://localhost:5173/access_token=${access_token}&refresh_token=${refresh_token}&firebase_token=${firebaseToken}`);
    } catch (error) {
      response.status(500).send("Error getting Spotify access token");
    }
  },
);
