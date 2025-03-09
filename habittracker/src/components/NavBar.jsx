import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import goldIcon from "../assets/gold.png"; // Correct relative path for import

const NavBar = () => {
  const [gold, setGold] = useState(0);

  useEffect(() => {
    const fetchGold = async () => {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        try {
          const response = await fetch(`http://localhost:3001/users/${parsedUser._id || parsedUser.id}`);
          if (!response.ok) throw new Error("Failed to fetch user data");
          const updatedUser = await response.json();

          setGold(updatedUser.gold || 0);
          localStorage.setItem("currentUser", JSON.stringify(updatedUser)); // Keep local storage updated
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchGold();
  }, []);

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
      <h2 className="text-2xl font-bold">Habit Tracker</h2>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-yellow-400 text-black py-1 px-3 rounded-lg">
          <img
            src={goldIcon}  // Replaced with imported local image
            alt="Gold Icon"
            className="w-6 h-6"
          />
          <span className="font-bold">{gold}</span>
        </div>
        <Link to="/habits" className="hover:text-yellow-300 transition">Home</Link>
        <Link to="/profile" className="hover:text-yellow-300 transition">Profile</Link>
      </div>
    </nav>
  );
};

export default NavBar;
