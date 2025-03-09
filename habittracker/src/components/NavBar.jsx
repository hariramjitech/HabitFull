import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import goldIcon from "../assets/gold.png"; 

const NavBar = () => {
  const [gold, setGold] = useState(0);

  useEffect(() => {
    const fetchUpdatedGold = async () => {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        try {
          const response = await fetch(`http://localhost:3001/users/${parsedUser._id}`);
          if (!response.ok) throw new Error("Failed to fetch updated gold");

          const updatedUser = await response.json();
          setGold(updatedUser.gold); // ✅ Real-time gold sync
          localStorage.setItem("currentUser", JSON.stringify(updatedUser)); // ✅ Update localStorage
        } catch (error) {
          console.error("Error fetching updated gold:", error);
        }
      }
    };

    fetchUpdatedGold();

    const interval = setInterval(fetchUpdatedGold, 10000); // ✅ Auto-refresh gold every 10 seconds
    return () => clearInterval(interval); // ✅ Clean up interval on component unmount
  }, []);

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
      <h2 className="text-2xl font-bold">Habit Tracker</h2>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-yellow-400 text-black py-1 px-3 rounded-lg">
          <img src={goldIcon} alt="Gold Icon" className="w-6 h-6" />
          <span className="font-bold">{gold}</span>
        </div>
        <Link to="/habits" className="hover:text-yellow-300 transition">Home</Link>
        <Link to="/profile" className="hover:text-yellow-300 transition">Profile</Link>
      </div>
    </nav>
  );
};

export default NavBar;
