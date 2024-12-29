// utils/tokenUtils.js
import { v4 as uuidv4 } from "uuid";

export const generateTokenId = () => {
  return uuidv4(); // Generates a unique UUID for the token session
};
