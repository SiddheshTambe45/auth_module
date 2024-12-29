import express from "express";
import {
  login,
  callback,
  refreshToken,
  logout,
  signup,
  getTokens,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup); // Redirect to Microsoft OAuth
router.get("/login", login); // Redirect to Microsoft OAuth
router.get("/callback", callback); // Handle OAuth response
router.post("/refresh", refreshToken); // Refresh tokens
router.post("/logout", logout); // Logout
router.post("/get-tokens", getTokens); // Get tokens from Redis

export default router;
