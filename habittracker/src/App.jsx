import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPlus, FiLogIn, FiUserPlus, FiUser, FiList } from "react-icons/fi"; // React Icons
import HabitList from "./components/HabitList";
import AddHabit from "./components/AddHabit";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Profile from "./components/Profile";
import NavBar from "./components/NavBar";

function App() {
  const [authenticated, setAuthenticated] = useState(localStorage.getItem("authenticated") === "true");
  const [habits, setHabits] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && (currentUser._id || currentUser.id)) {
      const resolvedId = currentUser._id || currentUser.id;
      setUserId(resolvedId);
    }
  }, []);

  useEffect(() => {
    if (authenticated && userId) fetchHabits();
  }, [authenticated, userId]);

  const fetchHabits = async () => {
    try {
      const response = await fetch(`http://localhost:3001/users/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user data");
      const user = await response.json();
      setHabits(user.habits || []);
    } catch (error) {
      console.error("Error fetching habits:", error);
    }
  };

  const handleLogin = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && (currentUser._id || currentUser.id)) {
      const resolvedId = currentUser._id || currentUser.id;
      setUserId(resolvedId);
      setAuthenticated(true);
      localStorage.setItem("authenticated", "true");
    } else {
      console.error("User data or ID missing in localStorage.");
    }
  };

  return (
    <Router>
      {authenticated && <NavBar />}
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 p-8 text-gray-800">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route
            path="/login"
            element={
              authenticated ? (
                <Navigate to="/habits" />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Login setAuthenticated={handleLogin} />
                </motion.div>
              )
            }
          />
          <Route
            path="/signup"
            element={
              authenticated ? (
                <Navigate to="/habits" />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Signup setAuthenticated={handleLogin} />
                </motion.div>
              )
            }
          />
          <Route
            path="/habits"
            element={
              authenticated ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="app p-6 text-center"
                >
                  <Link
                    to="/add-habit"
                    className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all mb-8 shadow-lg transform hover:scale-105"
                  >
                    <FiPlus className="mr-2" /> Add Habit
                  </Link>
                  <HabitList habits={habits} setHabits={setHabits} />
                </motion.div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/add-habit"
            element={
              authenticated ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <AddHabit userId={userId} setHabits={setHabits} />
                </motion.div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/profile"
            element={
              authenticated ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Profile setAuthenticated={setAuthenticated} />
                </motion.div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;