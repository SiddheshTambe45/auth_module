import express from "express";
// import passport from "./config/passport.js";
// import bodyParser from "body-parser";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser());
// app.use(passport.initialize());

// Enable CORS for specific origin (your frontend's address)
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests only from your frontend
  })
);

app.use("/auth", authRoutes);

app.use("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
