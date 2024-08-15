// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";

export default function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <>
      <Header />
      <nav>
        <ul>
          {currentUser ? (
            <>
              <li>
                <Link to="/home">Home</Link>
              </li>
              <li>
                <Link to="/details">Details</Link>
              </li>
              <li>
                <Link to="/records">Records</Link>
              </li>
              <li>
                <Link to="/student">Students</Link>
              </li>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li style={{ float: "right" }}>
                <button onClick={logout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/home">Home</Link>
              </li>
              <li>
                <Link to="/details">Details</Link>
              </li>
              <li>
                <Link to="/records">Records</Link>
              </li>
              <li>
                <Link to="/signin">Sign In</Link>
              </li>
              <li>
                <Link to="/signup">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </>
  );
}
