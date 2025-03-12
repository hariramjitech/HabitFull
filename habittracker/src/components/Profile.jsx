import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaFilter, FaSortAlphaDown, FaSortAlphaUpAlt, FaSignOutAlt, FaFire, FaCoins } from "react-icons/fa";
import { FiUser, FiKey, FiMail, FiStar, FiClock, FiCalendar } from "react-icons/fi";

// Animation variants for the list
const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger the animation of children
    },
  },
};

// Animation variants for each item in the list
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const Profile = ({ setAuthenticated }) => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [filterOption, setFilterOption] = useState("none");
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

  const filteredHistory = [...history].sort((a, b) => {
    switch (filterOption) {
      case "startDate":
        return new Date(a.startDate) - new Date(b.startDate);
      case "endDate":
        return new Date(a.endDate) - new Date(b.endDate);
      case "highestCompletion":
        return b.completionDates.length - a.completionDates.length;
      case "lowestCompletion":
        return a.completionDates.length - b.completionDates.length;
      case "alphabetical":
        return a.name.localeCompare(b.name);
      case "reverse-alphabetical":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  if (!user) {
    return <p className="text-center text-xl text-gray-500">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-noise opacity-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <motion.div whileHover={{ scale: 1.05 }} className="relative group">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                alt="Profile Avatar"
                className="w-32 h-32 rounded-full border-4 border-white/80 shadow-xl transform transition-transform duration-300 group-hover:rotate-3"
              />
            </motion.div>
            <div className="flex-1 ml-6">
              <h1 className="text-4xl font-bold text-white mb-1">{user.name}</h1>
              <p className="text-purple-100 text-lg">{user.email}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <FaSignOutAlt className="text-lg" />
              <span className="font-semibold">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Profile Details Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiUser className="text-blue-600" />
            Profile Details
          </h2>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ID */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <FiKey className="text-lg" />
              </div>
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-medium text-gray-800">{user._id || user.id}</p>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                <FiMail className="text-lg" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{user.email}</p>
              </div>
            </motion.div>

            {/* Gold */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                <FaCoins className="text-lg" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Gold</p>
                <p className="font-medium text-gray-800">{user.gold}</p>
              </div>
            </motion.div>

            {/* Joined On */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <FiStar className="text-lg" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Joined On</p>
                <p className="font-medium text-gray-800">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* History Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="max-w-7xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Header with Filter */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaFire className="text-orange-500" />
              Habit History
            </h2>
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <select
                  value={filterOption}
                  onChange={(e) => setFilterOption(e.target.value)}
                  className="pl-4 pr-8 py-2.5 bg-white border-2 border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-blue-500 shadow-sm"
                >
                  <option value="none">No Filter</option>
                  <option value="startDate">Start Date</option>
                  <option value="endDate">End Date</option>
                  <option value="highestCompletion">Most Completed</option>
                  <option value="lowestCompletion">Least Completed</option>
                  <option value="alphabetical">A-Z</option>
                  <option value="reverse-alphabetical">Z-A</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaFilter />
                </div>
              </motion.div>
            </div>
          </div>

          {/* History Cards */}
          {loadingHistory ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredHistory.map((entry) => (
                  <motion.div
                    key={entry.id}
                    variants={itemVariants}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow relative group"
                  >
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteHistory(entry.id)}
                        className="p-2 bg-red-100/80 hover:bg-red-200/90 rounded-full backdrop-blur-sm text-red-500"
                      >
                        <FaTrash className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span>{entry.name}</span>
                      <FaFire className="text-orange-500" />
                    </h3>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          <FiClock className="text-lg" />
                        </div>
                        <div>
                          <span className="text-sm font-medium">Streak:</span>
                          <span className="ml-2 font-bold">{entry.streak} days</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                          <FiCalendar className="text-lg" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {new Date(entry.startDate).toLocaleDateString()}
                            <span className="mx-2">–</span>
                            {new Date(entry.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                        Completion Dates
                      </div>
                      <ul className="space-y-1 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                        {entry.completionDates.map((date, idx) => (
                          <li key={idx} className="text-xs text-gray-500">
                            {new Date(date).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;