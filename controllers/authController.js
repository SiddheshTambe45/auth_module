// import supabase from "../config/supabase.js";
import redisClient from "../config/redisClient.js"; // Import your Redis client
import { generateTokenId } from "../utils/tokenUtils.js"; // Adjust the path as needed

import axios from "axios";

export const signup = async (req, res) => {
  const { redirectFrom } = req.body; // Frontend sends the current module's URL

  if (!redirectFrom) {
    return res.status(400).json({ error: "Module information missing" });
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const redirectUri = process.env.MICROSOFT_CALLBACK_URL;
  const responseType = "code"; // Authorization code flow
  const scope = "openid profile email";

  // Create a unique state object to store the module's context
  const state = JSON.stringify({ redirectFrom });

  // Microsoft OAuth endpoint URL
  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}`;

  // Redirect the user to the Microsoft login page
  res.json({ redirectUrl: authUrl });
};

export const callback = async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res
      .status(400)
      .json({ error: "Missing authorization code or state" });
  }

  // Parse the state to extract redirectFrom
  let redirectFrom;
  try {
    const parsedState = JSON.parse(state);
    redirectFrom = parsedState.redirectFrom;
  } catch (error) {
    console.error("Invalid state format:", error.message);
    return res.status(400).json({ error: "Invalid state format" });
  }

  const authorizationCode = code;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_VALUE;
  const redirectUri = process.env.MICROSOFT_CALLBACK_URL;

  try {
    // Exchange the authorization code for an access token
    const tokenUrl =
      "https://login.microsoftonline.com/common/oauth2/v2.0/token";

    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: authorizationCode,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      })
    );

    // const { access_token } = response.data;

    // // Optional: Set session or cookie
    // res.cookie("access_token", access_token, { httpOnly: true, secure: true });

    const { access_token, refresh_token, id_token } = response.data;

    // Generate a unique tokenId for this session or request
    const tokenId = generateTokenId(); // Generate a unique ID (e.g., using a UUID or custom logic)

    // Store the tokens in Redis with the tokenId as the key, and a 5-minute expiry time
    const tokenData = {
      access_token,
      refresh_token,
      id_token,
      expiresAt: Date.now() + 300000, // Token expiration time (5 minutes)
    };

    await redisClient.setEx(tokenId, 300, JSON.stringify(tokenData));

    // Redirect to the originating module or success page
    const redirectTo = redirectFrom || "/dashboard";
    const redirectUrl = `${redirectTo}?tokenKey=${tokenId}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error(
      "Error during token exchange:",
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .json({ error: "Internal server error during token exchange" });
  }
};

export const login = async (req, res) => {
  // Redirect user to Microsoft's OAuth page
};

export const refreshToken = async (req, res) => {
  // Refresh the user's access token
};

export const logout = (req, res) => {
  // Handle logout and clear cookies/tokens
};

export const getTokens = async (req, res) => {
  const { tokenKey } = req.body;

  console.log(tokenKey);

  if (!tokenKey) {
    return res.status(400).json({ error: "Token key is required" });
  }

  try {
    // Get token data from Redis using the tokenKey
    const tokenData = await redisClient.get(tokenKey);

    if (!tokenData) {
      return res.status(404).json({ error: "Token not found" });
    }

    const { access_token, refresh_token, id_token } = JSON.parse(tokenData);

    // Send the tokens back to the frontend
    res.json({
      access_token,
      refresh_token,
      id_token,
    });
  } catch (error) {
    console.error("Error retrieving tokens:", error);
    res
      .status(500)
      .json({ error: "Internal server error while retrieving tokens" });
  }
};
