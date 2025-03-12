import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaTrash, FaCalendarAlt, FaFire, FaChevronDown, FaTimes } from "react-icons/fa";

const HabitList = () => {
    const [user, setUser] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [habitToConfirm, setHabitToConfirm] = useState(null);
    const [expandedHabits, setExpandedHabits] = useState({});

    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        if (!storedUser) {
            console.error("No user found in localStorage.");
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        const resolvedId = parsedUser._id || parsedUser.id;

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

    const toggleCompletionDates = (habitId) => {
        setExpandedHabits(prev => ({
            ...prev,
            [habitId]: !prev[habitId]
        }));
    };

    const handleIncrement = async (habitId) => {
        if (!user) return;

        const habit = user.habits.find((habit) => habit.id === habitId);
        const today = new Date().toISOString().split("T")[0];

        if (habit.lastCompleted === today) {
            setHabitToConfirm(habit);
            setShowModal(true);
            return;
        }

        await incrementHabit(habitId, habit);
    };

    const incrementHabit = async (habitId, habit) => {
        const today = new Date().toISOString().split("T")[0];
        const updatedHabit = {
            ...habit,
            streak: (habit.streak || 0) + 1,
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

            if ((result.habit?.streak || 0) % 7 === 0) {
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

        setShowModal(false);
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

        setShowDeleteModal(false);
    };

    const filterActiveHabits = (habits) => {
        const today = new Date().toISOString().split("T")[0];
        return habits.filter(habit => {
            const habitStart = new Date(habit.startDate).toISOString().split("T")[0];
            return habitStart <= today;
        });
    };

    return (
        <div className="habit-list p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
            {showConfetti && (
                <Confetti
                    numberOfPieces={500}
                    gravity={0.1}
                    wind={0.01}
                    initialVelocityX={3}
                    initialVelocityY={7}
                    recycle={false}
                />
            )}

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                    >
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            className="bg-white p-6 rounded-lg shadow-lg w-80"
                        >
                            <h3 className="text-lg font-bold mb-3">Confirm Action</h3>
                            <p className="text-gray-600">
                                You've already marked <strong>{habitToConfirm?.name}</strong> today.
                                Do you want to mark it again?
                            </p>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => incrementHabit(habitToConfirm.id, habitToConfirm)}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
                                >
                                    <FaCheck className="text-lg" /> Yes
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center gap-2"
                                >
                                    <FaTimes className="text-lg" /> No
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                    >
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            className="bg-white p-6 rounded-lg shadow-lg w-80"
                        >
                            <h3 className="text-lg font-bold mb-3">Confirm Deletion</h3>
                            <p className="text-gray-600">
                                Are you sure you want to delete the habit <strong>{habitToConfirm?.name}</strong>?
                            </p>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => handleDelete(habitToConfirm.id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center gap-2"
                                >
                                    <FaTrash className="text-lg" /> Yes
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
                                >
                                    <FaCheck className="text-lg" /> No
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">Active Habits</h2>

            {user && filterActiveHabits(user.habits).length === 0 && (
                <div className="text-center bg-white p-6 rounded-lg shadow-md">
                    <p className="text-gray-500 text-lg">No active habits found. Start by adding a new habit!</p>
                </div>
            )}

            {user && filterActiveHabits(user.habits).map((habit) => (
                <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="habit-card bg-white p-6 rounded-lg shadow-md my-6"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">{habit.name}</h3>
                            <p className="text-gray-600 mt-2 flex items-center gap-2">
                                <FaFire className="text-orange-500 text-lg" /> 
                                <span className="font-medium">Streak: {habit.streak} days</span>
                            </p>
                            <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                                <FaCalendarAlt className="text-blue-500 text-md" /> 
                                Started: {new Date(habit.startDate).toLocaleDateString()}
                            </p>
                            {habit.endDate && (
                                <p className="text-gray-500 text-sm flex items-center gap-2">
                                    <FaCalendarAlt className="text-purple-500 text-md" /> 
                                    Target End: {new Date(habit.endDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => handleIncrement(habit.id)}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                            >
                                <FaCheck className="text-lg" /> Mark Done
                            </button>
                            <button
                                onClick={() => {
                                    setHabitToConfirm(habit);
                                    setShowDeleteModal(true);
                                }}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                            >
                                <FaTrash className="text-lg" /> Delete
                            </button>
                        </div>
                    </div>

                    {habit.completionDates && habit.completionDates.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => toggleCompletionDates(habit.id)}
                                className="w-full text-left flex items-center justify-between"
                            >
                                <h4 className="text-md font-medium text-gray-700 flex items-center gap-2">
                                    <FaCalendarAlt className="text-blue-500 text-md" /> 
                                    Completion History ({habit.completionDates.length})
                                </h4>
                                <motion.div
                                    animate={{ rotate: expandedHabits[habit.id] ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <FaChevronDown className="text-gray-500 text-lg" />
                                </motion.div>
                            </button>
                            
                            {expandedHabits[habit.id] && (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {habit.completionDates.map((date, index) => (
                                        <div key={index} className="text-sm bg-gray-50 p-2 rounded flex items-center gap-2">
                                            <FaCalendarAlt className="text-gray-400 text-sm" /> 
                                            {new Date(date).toLocaleString()}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
};

export default HabitList;