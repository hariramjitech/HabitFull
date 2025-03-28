import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPlus, FiCalendar, FiAward, FiCheckCircle } from "react-icons/fi"; // React Icons

const AddHabit = ({ userId, setHabits }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [goldReward, setGoldReward] = useState(0);
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const [storedUserId, setStoredUserId] = useState(userId);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!storedUserId) {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser && currentUser.id) setStoredUserId(currentUser.id);
    }
  }, []);

  const calculateGoldReward = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (diffDays >= 7) setGoldReward(Math.floor(diffDays / 7) * 10);
    else setGoldReward(0);

    if (diffDays % 7 === 6) {
      setMotivationalMessage("You're close to finishing a week! Stay focused!");
    } else {
      setMotivationalMessage("");
    }
  };

  useEffect(() => calculateGoldReward(), [startDate, endDate]);

  const addHabit = async (habit) => {
    if (!storedUserId) {
      console.error("User ID is undefined.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/users/${storedUserId}/habits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(habit),
      });

      if (!response.ok) throw new Error("Failed to add habit");

      const data = await response.json();
      setHabits((prev) => [...prev, data.habit]);
      setSuccessMessage(`Habit added successfully! Earn ${goldReward} gold if completed.`);

      setTimeout(() => navigate("/habits"), 3500); // Extended alert timing
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (endDate && new Date(endDate) < new Date(startDate)) {
      alert("End date cannot be before the start date.");
      return;
    }

    const newHabit = { name, streak: 0, lastCompleted: null, startDate, endDate, goldReward };
    await addHabit(newHabit);
    setName("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 p-6"
    >
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border-t-4 border-blue-500">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-bold text-blue-600 mb-4 flex items-center justify-center gap-2"
        >
          <FiPlus className="text-blue-600" /> Create a New Habit
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-sm text-gray-500 mb-6"
        >
          Build consistency and earn rewards for maintaining streaks!
        </motion.p>

        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="w-full"
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter habit name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="w-full flex flex-col gap-2"
          >
            <label className="text-blue-600 text-left flex items-center gap-2">
              <FiCalendar /> Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <label className="text-blue-600 text-left flex items-center gap-2">
              <FiCalendar /> End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </motion.div>

          {goldReward > 0 && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="text-blue-600 text-lg flex items-center gap-2"
            >
              <FiAward /> Earn {goldReward} gold for completing this streak!
            </motion.p>
          )}

          {motivationalMessage && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="text-green-500 text-lg animate-bounce flex items-center gap-2"
            >
              <FiCheckCircle /> {motivationalMessage}
            </motion.p>
          )}

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            type="submit"
            className="bg-blue-600 text-white font-bold w-full py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <FiPlus /> Add Habit
          </motion.button>
        </form>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-4 right-4 bg-green-500 text-white py-2 px-4 rounded-lg shadow-md flex items-center gap-2"
          >
            <FiCheckCircle /> {successMessage}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AddHabit;