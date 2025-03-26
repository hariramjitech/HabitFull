import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaCheck,
    FaTrash,
    FaCalendarAlt,
    FaFire,
    FaChevronDown,
    FaTimes,
    FaInfoCircle,
    FaTrophy,
} from "react-icons/fa";

// Helper function to get local date string in YYYY-MM-DD format
const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const HabitList = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCelebrationModal, setShowCelebrationModal] = useState(false);
    const [celebratedHabit, setCelebratedHabit] = useState(null);
    const [habitToConfirm, setHabitToConfirm] = useState(null);
    const [expandedHabits, setExpandedHabits] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [sortBy, setSortBy] = useState("streak");
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch user data on component mount
    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        if (!storedUser) {
            console.error("No user found in localStorage.");
            navigate("/login");
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        const resolvedId = parsedUser._id || parsedUser.id;

        if (!resolvedId) {
            console.error("User ID missing in stored user data.");
            return;
        }

        fetchUserData(resolvedId);
    }, [navigate]);

    // Fetch user data from the server
    const fetchUserData = async (userId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/users/${userId}`);
            if (!response.ok) throw new Error("Failed to fetch user");

            const userData = await response.json();
            setUser(userData);
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle completion dates visibility
    const toggleCompletionDates = (habitId) => {
        setExpandedHabits((prev) => ({
            ...prev,
            [habitId]: !prev[habitId],
        }));
    };

    // Handle marking a habit as completed
    const handleIncrement = async (habitId) => {
        if (!user) return;

        const habit = user.habits.find((habit) => habit.id === habitId);
        const today = getLocalDateString(new Date());

        if (habit.lastCompleted === today) {
            setHabitToConfirm(habit);
            setShowModal(true);
            return;
        }

        await incrementHabit(habitId, habit);
    };

    // Increment habit streak
    const incrementHabit = async (habitId, habit) => {
        const today = getLocalDateString(new Date());
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
                setCelebratedHabit(result.habit);
                setShowConfetti(true);
                setShowCelebrationModal(true);
            }

            const updatedUser = {
                ...user,
                habits: user.habits.map((h) => (h.id === habitId ? updatedHabit : h)),
            };

            setUser(updatedUser);
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        } catch (error) {
            console.error("Error updating habit:", error);
        }

        setShowModal(false);
    };

    // Delete a habit
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

    // Filter active habits
    const filterActiveHabits = useMemo(() => {
        if (!user) return [];
        const today = getLocalDateString(new Date());
        return user.habits.filter((habit) => {
            const habitStart = getLocalDateString(new Date(habit.startDate));
            return habitStart <= today;
        });
    }, [user]);

    // Sort habits
    const sortedHabits = useMemo(() => {
        return [...filterActiveHabits].sort((a, b) => {
            if (sortBy === "streak") return b.streak - a.streak;
            if (sortBy === "startDate") return new Date(a.startDate) - new Date(b.startDate);
            if (sortBy === "name") return a.name.localeCompare(b.name);
            return 0;
        });
    }, [filterActiveHabits, sortBy]);

    // Search habits
    const filteredHabits = useMemo(() => {
        return sortedHabits.filter((habit) =>
            habit.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [sortedHabits, searchQuery]);

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

            {/* Celebration Modal */}
            <AnimatePresence>
                {showCelebrationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ 
                                scale: 1,
                                opacity: 1,
                                transition: {
                                    type: "spring",
                                    damping: 10,
                                    stiffness: 100
                                }
                            }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-8 rounded-xl shadow-2xl max-w-md w-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
                            <div className="flex flex-col items-center text-center">
                                <motion.div
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 10, -10, 0],
                                        transition: { 
                                            repeat: Infinity, 
                                            repeatType: "reverse",
                                            duration: 2
                                        }
                                    }}
                                    className="mb-6 text-yellow-500"
                                >
                                    <FaTrophy className="text-6xl" />
                                </motion.div>
                                <h3 className="text-3xl font-bold text-yellow-700 mb-2">Congratulations!</h3>
                                <p className="text-lg text-yellow-800 mb-4">
                                    You've reached a <span className="font-bold">{celebratedHabit?.streak}-day streak</span> for
                                </p>
                                <p className="text-2xl font-bold text-yellow-900 mb-6">{celebratedHabit?.name}!</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setShowCelebrationModal(false);
                                        setShowConfetti(false);
                                    }}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all"
                                >
                                    Keep Going!
                                </motion.button>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full flex justify-center">
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            y: [0, -15, 0],
                                            opacity: [0.7, 1, 0.7],
                                            transition: {
                                                duration: 2,
                                                repeat: Infinity,
                                                delay: i * 0.2
                                            }
                                        }}
                                        className="w-2 h-2 bg-yellow-400 rounded-full mx-1"
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
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
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
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

            {/* Search and Sort Controls */}
            <div className="flex justify-between mb-6">
                <input
                    type="text"
                    placeholder="Search habits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 w-64"
                />
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2"
                >
                    <option value="streak">Sort by Streak</option>
                    <option value="startDate">Sort by Start Date</option>
                    <option value="name">Sort by Name</option>
                </select>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="text-center">
                    <p className="text-gray-500 text-lg">Loading habits...</p>
                </div>
            ) : (
                <>
                    {/* No Habits State */}
                    {user && filteredHabits.length === 0 && (
                        <div className="text-center bg-white p-6 rounded-lg shadow-md">
                            <p className="text-gray-500 text-lg mb-4">No active habits found. Start by adding a new habit!</p>
                            <button
                                onClick={() => navigate("/add-habit")}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Add New Habit
                            </button>
                        </div>
                    )}

                    {/* Habit List */}
                    {user &&
                        filteredHabits.map((habit) => (
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
                                        <button
                                            onClick={() => console.log(`Navigate to habit details for habit ID: ${habit.id}`)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                                        >
                                            <FaInfoCircle className="text-lg" /> View Details
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
                </>
            )}
        </div>
    );
};

export default HabitList;