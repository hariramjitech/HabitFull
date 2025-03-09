import express from 'express';
import { User } from '../models/models.js';

const router = express.Router();

// ✅ Create User
router.post('/', async (req, res) => {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password, gold: 0, habits: [] });

    try {
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
});

// ✅ Fetch All Users (For Login & Signup Validation)
router.get('/', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

// ✅ Fetch User by ID
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data', error });
    }
});

// ✅ Add Habit
router.post('/:userId/habits', async (req, res) => {
    const { userId } = req.params;
    const { name } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newHabit = { id: Date.now().toString(), name, streak: 0, lastCompleted: null };
        user.habits.push(newHabit);
        await user.save();

        res.status(201).json({ message: 'Habit added successfully', habit: newHabit });
    } catch (error) {
        res.status(500).json({ message: 'Error adding habit', error });
    }
});

// ✅ Update Habit Streak (With Confirmation Logic)
router.put('/:userId/habits/:habitId', async (req, res) => {
    const { userId, habitId } = req.params;
    const { lastCompleted, forceIncrement } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const habit = user.habits.find(h => h.id === habitId);
        if (!habit) return res.status(404).json({ message: 'Habit not found' });

        const today = new Date().toISOString().split("T")[0];

        // Prevent multiple streak updates unless forced
        if (habit.lastCompleted === today && !forceIncrement) {
            return res.status(400).json({ message: 'Streak already updated today' });
        }

        habit.streak += 1;
        habit.lastCompleted = today;

        // Add 10 gold for every 7-day streak
        if (habit.streak % 7 === 0) user.gold += 10;

        await user.save();
        res.status(200).json({ message: 'Habit updated successfully', habit });
    } catch (error) {
        res.status(500).json({ message: 'Error updating habit', error });
    }
});

// ✅ Delete Habit
router.delete('/:userId/habits/:habitId', async (req, res) => {
    const { userId, habitId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const updatedHabits = user.habits.filter(h => h.id !== habitId);

        if (user.habits.length === updatedHabits.length) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        user.habits = updatedHabits;
        await user.save();

        res.status(200).json({ message: 'Habit deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting habit', error });
    }
});

export default router;