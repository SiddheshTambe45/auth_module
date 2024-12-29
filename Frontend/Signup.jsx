// src/Signup.js

import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if the URL has a tokenKey parameter after redirect
    const urlParams = new URLSearchParams(window.location.search);
    const tokenKey = urlParams.get("tokenKey");

    if (tokenKey) {
      // Retrieve the tokens using the tokenKey
      fetchTokens(tokenKey);
    }
  }, []);

  const fetchTokens = async (tokenKey) => {
    console.log(tokenKey);

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/auth/get-tokens",
        {
          tokenKey,
        }
      );

      const { access_token, refresh_token, id_token } = response.data;

      // Store the tokens securely (using localStorage here, but you can adjust for security)
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("id_token", id_token);

      // Redirect to a secured area or dashboard after storing tokens
      window.location.href = "/"; // Or wherever you want to redirect
    } catch (error) {
      console.error("Error fetching tokens:", error);
      setError("Failed to retrieve tokens.");
    } finally {
      setLoading(false);
    }
  };
  const handleSignup = async () => {
    try {
      // Send the current page or module context
      const redirectFrom = window.location.href;

      const response = await axios.post("http://localhost:5000/auth/signup", {
        redirectFrom,
      });

      // Get the redirect URL from the response
      const redirectUrl = response.data.redirectUrl;

      if (redirectUrl) {
        // Redirect the user to the Microsoft login page
        window.location.href = redirectUrl;
      } else {
        console.error("Signup failed: No redirect URL provided.");
      }
    } catch (error) {
      console.error("Error initiating signup:", error);
    }
  };

  return (
    <div>
      <h2>Signup with Microsoft</h2>
      <button onClick={handleSignup}>Signup</button>
    </div>
  );
};

export default Signup;
