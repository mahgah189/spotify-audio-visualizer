const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

const tokenEndpoint = "https://accounts.spotify.com/api/token";

admin.initializeApp();
const db = admin.firestore();
const users = db.collection("users");

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
      const {state, code, error} = request.query;
      const redirectURL = "http://localhost:5173/";
      if (error === "access_denied") {
        logger.warn("Access denied by user");
        response.redirect(redirectURL);
      }
      if (!state) {
        logger.warn("State parameter is missing");
        response.redirect(redirectURL);
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
        const tokenData = await tokenResponse.json();
        const {access_token, refresh_token} = tokenData;
        const spotifyResponse = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
        const spotifyUser = await spotifyResponse.json();
        const uid = spotifyUser.id;
        const name = spotifyUser.display_name;
        console.log("Spotify user data:", spotifyUser);
        const userRef = users.doc(uid);
        userRef.set({
          token: refresh_token,
          name: name,
        });
        response.redirect(`${redirectURL}?access_token=${access_token}&uid=${uid}`);
      } catch (error) {
        response.status(500).send("Error getting Spotify access token");
      }
    });
  },
);

exports.refreshToken = onRequest(
  {secrets: ["SPOTIFY_CLIENT_SECRET"]},
  (request, response) => {
    cors(request, response, async () => {
      const uid = request.body.uid;
      const userRef = users.doc(uid);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        response.redirect("https://login-hgv7fgobsq-uc.a.run.app");
      }
      const token = userDoc.data().token;
      try {
        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Authorization": "Basic " + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64")),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            refresh_token: token,
            grant_type: "refresh_token",
          }).toString(),
        });
        const data = await tokenResponse.json();
        return response.json(data.access_token);
      } catch (error) {
        console.error("Error refreshing access token:", error);
        return response.status(500).send("Error refreshing Spotify access token");
      }
    });
  },
);
