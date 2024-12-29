// import passport from "passport";
// import { Strategy as MicrosoftStrategy } from "passport-microsoft";
// import dotenv from "dotenv";

// dotenv.config();

// passport.use(
//   new MicrosoftStrategy(
//     {
//       clientID: process.env.MICROSOFT_CLIENT_ID,
//       clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
//       callbackURL: process.env.MICROSOFT_CALLBACK_URL,
//       scope: ["user.read", "email", "openid"], // Added email and openid for broader info
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // You can store the profile in your DB here if needed or just use it
//       const user = {
//         id: profile.id,
//         email: profile.emails ? profile.emails[0].value : null, // Optional email, if available
//         displayName: profile.displayName,
//         provider: "microsoft",
//       };
//       // For example, store the user in your database and associate them
//       return done(null, user); // Pass the user object to session or handle accordingly
//     }
//   )
// );

// // Serialize the user info to store in the session (e.g., user id)
// passport.serializeUser((user, done) => {
//   done(null, user.id); // Save only user id in session
// });

// // Deserialize the user info when needed (for fetching user details from DB or cache)
// passport.deserializeUser((id, done) => {
//   // Retrieve user info from DB or cache using the ID
//   // Example: You would query your DB to find the user by their ID
//   // User.findById(id, (err, user) => done(err, user));
//   done(null, { id }); // Example; replace with actual logic to fetch user data
// });

// export default passport;

import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import supabase from "./supabase.js";

passport.use(
  new OAuth2Strategy(
    {
      authorizationURL:
        "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
      tokenURL: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: process.env.MICROSOFT_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user exists in Supabase, or create a new user
        const { data, error } = await supabase
          .from("users")
          .upsert(
            [{ email: profile.emails[0].value, access_token: accessToken }],
            {
              onConflict: ["email"],
            }
          );

        if (error) return done(error);

        return done(null, profile);
      } catch (error) {
        return done(error);
      }
    }
  )
);
