import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

const Profile = ({ setAuthenticated }) => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchHistory(parsedUser._id || parsedUser.id);
    }
  }, []);

  const fetchHistory = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3001/users/${userId}/history`);
      const data = await response.json();
      setHistory(data.history);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteHistory = async (historyId) => {
    try {
      await fetch(`http://localhost:3001/users/${user._id}/history/${historyId}`, {
        method: "DELETE",
      });
      setHistory(history.filter((entry) => entry.id !== historyId));
    } catch (error) {
      console.error("Error deleting history entry:", error);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem("authenticated");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  if (!user) {
    return <p className="text-center text-xl text-gray-500">Loading...</p>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="w-full max-w-7xl">
        {/* Profile Card */}
    {/* Profile Card */}
<div className="bg-white rounded-3xl shadow-2xl p-10 text-center border-t-4 border-blue-500 transform hover:scale-[1.03] transition duration-300">
  <div className="flex items-center gap-6">
    <img
      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
      alt="Profile Avatar"
      className="w-28 h-29 rounded-full border-4 mx-2 my-2 border-blue-500 shadow-md"
    />
    <div className="text-left">
      <h2 className="text-4xl font-bold text-gray-800">{user.name}</h2>
      <p className="text-gray-500 text-2xl">{user.email}</p>
      <div className="bg-yellow-400 text-black text-xl py-2 px-5 rounded-lg inline-block mt-3 shadow-md">
        <span className="font-medium">Gold:</span> {user.gold} 🏅
      </div>
    </div>
  </div>

  {/* Motivational Quote */}
  <p className="mt-4 text-sm italic text-gray-500">
    "Stay consistent, and success will follow."
  </p>

  <button
    className="w-full py-3 mt-6 bg-red-500 text-white rounded-lg hover:bg-red-600 text-lg font-bold transition"
    onClick={handleLogout}
  >
    Logout
  </button>
</div>


        {/* Filter Option Placeholder */}
        {/* <div className="mt-4 bg-white shadow-md rounded-xl p-4">
          <h3 className="text-lg font-bold mb-2">Filter Options (Coming Soon)</h3>
          <p className="text-sm text-gray-500">You'll be able to filter by streaks, dates, and more.</p>
        </div> */}
      </div>

      {/* Expanded History Section */}
      <div className="bg-white rounded-3xl shadow-2xl p-6 mt-6 w-full max-w-7xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Habit Completion History</h2>

        {loadingHistory ? (
          <p className="text-gray-500">Loading history...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {history.length > 0 ? (
              history.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white border border-green-500 rounded-xl p-4 shadow-md hover:scale-105 transform transition duration-300"
                >
                  <div className="font-bold text-lg text-green-600">{entry.name}</div>
                  <div>
                    <span className="font-medium">Streak:</span> {entry.streak} days
                  </div>
                  <div>
                    <span className="font-medium">Start Date:</span> {new Date(entry.startDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">End Date:</span> {new Date(entry.endDate).toLocaleDateString()}
                  </div>
                  <div className="overflow-y-auto max-h-32 border-t border-gray-200 pt-2">
                    <span className="font-medium">Completion Dates:</span>
                    <ul className="list-disc pl-5">
                      {entry.completionDates.map((date, idx) => (
                        <li key={idx}>{new Date(date).toLocaleString()}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => handleDeleteHistory(entry.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 flex items-center gap-1"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No history available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
