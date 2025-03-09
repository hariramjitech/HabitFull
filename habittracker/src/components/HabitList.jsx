import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";

const HabitList = () => {
    const [user, setUser] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        if (!storedUser) {
            console.error("No user found in localStorage.");
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        const resolvedId = parsedUser._id || parsedUser.id;  // ✅ Fallback Logic for both `_id` and `id`

        if (!resolvedId) {
            console.error("User ID missing in stored user data.");
            return;
        }

        fetchUserData(resolvedId);
    }, []);

    const fetchUserData = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3001/users/${userId}`);
            if (!response.ok) throw new Error("Failed to fetch user");

            const userData = await response.json();
            setUser(userData);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const handleIncrement = async (habitId) => {
        if (!user) return;

        const habit = user.habits.find((habit) => habit.id === habitId);
        const today = new Date().toISOString().split("T")[0];

        if (habit.lastCompleted === today) {
            const confirmIncrement = window.confirm(
                "You've already marked this habit today. Do you want to mark it again?"
            );
            if (!confirmIncrement) return;
        }

        const updatedHabit = {
            ...habit,
            streak: (habit.streak || 0) + 1,  // ✅ Ensure streak is never undefined
            lastCompleted: today,
        };

        try {
            const response = await fetch(`http://localhost:3001/users/${user._id}/habits/${habitId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lastCompleted: updatedHabit.lastCompleted,
                    forceIncrement: habit.lastCompleted === today,
                }),
            });

            const result = await response.json();

            if ((result.habit?.streak || 0) % 7 === 0) {  // ✅ Fixed confetti trigger logic
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
            }

            const updatedUser = {
                ...user,
                habits: user.habits.map((h) =>
                    h.id === habitId ? updatedHabit : h
                ),
            };

            setUser(updatedUser);
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        } catch (error) {
            console.error("Error updating habit:", error);
        }
    };

    const handleDelete = async (habitId) => {
        try {
            await fetch(`http://localhost:3001/users/${user._id}/habits/${habitId}`, {
                method: "DELETE",
            });

            const updatedUser = {
                ...user,
                habits: user.habits.filter((habit) => habit.id !== habitId),
            };

            setUser(updatedUser);
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        } catch (error) {
            console.error("Error deleting habit:", error);
        }
    };

    return (
        <div className="habit-list p-6 bg-gray-100 min-h-screen">
            {showConfetti && <Confetti numberOfPieces={300} />} {/* Confetti Animation */}
            <h2 className="text-3xl font-bold text-center text-blue-600">Habit Tracker</h2>
            {user && user.habits.length === 0 && <p className="text-center text-gray-500">No habits found.</p>}
            {user &&
                user.habits.map((habit) => (
                    <div key={habit.id} className="habit-card bg-white p-4 rounded-lg shadow-md my-4">
                        <h3 className="text-xl font-semibold">{habit.name}</h3>
                        <p className="text-gray-600">Streak: {habit.streak} days</p>
                        <p className="text-gray-400">Last completed: {habit.lastCompleted || "Never"}</p>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => handleIncrement(habit.id)}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Mark Done
                            </button>
                            <button
                                onClick={() => handleDelete(habit.id)}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
        </div>
    );
};

export default HabitList;
