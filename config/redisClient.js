// In your backend code (e.g., `redisClient.js` or wherever you manage Redis)

import { createClient } from "redis";

// Connect to local Redis instance
const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.connect();

// Handle connection errors
redisClient.on("error", (err) => {
  console.log("Redis Client Error", err);
});

export default redisClient;
