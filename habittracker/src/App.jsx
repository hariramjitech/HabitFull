// App Component
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={
            authenticated ? <Navigate to="/habits" /> : <Login setAuthenticated={handleLogin} />
          }
        />
        <Route
          path="/signup"
          element={
            authenticated ? <Navigate to="/habits" /> : <Signup setAuthenticated={handleLogin} />
          }
        />
        <Route
          path="/habits"
          element={
            authenticated ? (
              <div className="app p-6 bg-gray-100 min-h-screen text-center">
                <h1 className="text-3xl font-bold text-blue-600 mb-4">Habit Tracker</h1>
                <AddHabit userId={userId} setHabits={setHabits} />
                <HabitList />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/profile"
          element={authenticated ? <Profile setAuthenticated={setAuthenticated} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
