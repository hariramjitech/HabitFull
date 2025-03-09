import React, { useState, useEffect } from "react";

const AddHabit = ({ userId, setHabits }) => {
  const [name, setName] = useState("");
  const [storedUserId, setStoredUserId] = useState(userId);  // ✅ Fallback Logic for User ID

  useEffect(() => {
    if (!storedUserId) {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser && currentUser.id) setStoredUserId(currentUser.id);
    }
  }, []);

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
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newHabit = { name, streak: 0, lastCompleted: null };
    await addHabit(newHabit);
    setName("");
  };

  return (
    <div className="add-habit-container flex items-center justify-center my-6">
      <form
        onSubmit={handleSubmit}
        className="add-habit bg-white p-4 rounded-lg shadow-md flex items-center space-x-4"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter new habit"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Add Habit
        </button>
      </form>
    </div>
  );
};

export default AddHabit;
