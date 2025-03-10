import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
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
      <div className="min-h-screen bg-white p-8 text-black">
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
                <div className="app p-6 text-center">
                  <Link
                    to="/add-habit"
                    className="inline-block bg-green-500 text-white px-10 py-2 rounded-lg hover:bg-green-600 transition-all mb-4 shadow-lg"
                  >
                     ➕ Add Habit
                  </Link>
                  <HabitList />
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/add-habit"
            element={authenticated ? <AddHabit userId={userId} setHabits={setHabits} /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={authenticated ? <Profile setAuthenticated={setAuthenticated} /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
