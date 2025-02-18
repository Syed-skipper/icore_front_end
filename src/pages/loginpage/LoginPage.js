import React, { useState } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://icore-back-end.onrender.com/api/auth/login",
        {
          email,
          password,
        }
      );
      localStorage.setItem("token", response.data.token);
      navigate("/users");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  const handlePageChange = async () => {
    setEmail("");
    setPassword("");
    setError("");
    setIsLogin(!isLogin);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      await axios.post("https://icore-back-end.onrender.com/api/auth/register", {
        email,
        password,
      });
      setIsLogin(true);
      setError("");
      alert("Registration successful, you can now log in.");
    } catch (err) {
      console.log("errrr", err);
      setError("Failed to register");
    }
  };

  return (
    <>
      <h1>User Management</h1>
      <div className="login-container">
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        <form onSubmit={isLogin ? handleLogin : handleSignUp}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}
          <Button type="submit" variant="contained">
            {isLogin ? "Login" : "Sign Up"}
          </Button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <p onClick={() => handlePageChange()} className="toggle-link">
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Login"}
        </p>
      </div>
    </>
  );
};

export default LoginPage;
