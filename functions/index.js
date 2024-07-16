const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const cors = require("cors")({origin: true});

const tokenEndpoint = "https://accounts.spotify.com/api/token";

const generateRandomString = (length) => {
  let randomStr;
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

exports.oauthLogin = onRequest(
  (request, response) => {
    const origin = request.headers.origin;
    const redirectUri = `${origin}/callback`;
    const state = generateRandomString(16);
    const scope = "streaming user-read-email user-read-private";
    const allowedOrigins = [
      "http://localhost:5173",
      "spotify-audio-visualizer.web.app",
    ];
    if (!allowedOrigins.includes(origin)) {
      return response.status(403).json({error: "Forbidden origin"});
    }
    sessionStorage.setItem("state", state);
    const oauthParams = new URLSearchParams({
      response_type: "code",
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: redirectUri,
      state: state,
    });
    response.redirect("https://accounts.spotify.com/authorize/?" + oauthParams.toString());
  },
);
