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

// ✅ Fetch All Users
router.get('/', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

// ✅ Fetch User by ID & Auto-Move Expired Habits
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const today = new Date().toISOString().split("T")[0];

        user.habits = user.habits.filter(habit => {
            if (habit.endDate && new Date(habit.endDate).toISOString().split("T")[0] <= today) {
                user.history.push({ ...habit.toObject(), endDate: habit.endDate });
                return false; // ✅ Remove expired habit from active habits
            }
            return true;
        });

        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data', error });
    }
});

// ✅ Add Habit with Completion Dates
router.post('/:userId/habits', async (req, res) => {
    const { userId } = req.params;
    const { name, startDate, endDate } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newHabit = {
            id: Date.now().toString(),
            name,
            streak: 0,
            lastCompleted: null,
            startDate: startDate || new Date(),
            endDate: endDate || null,
            completionDates: []
        };

        user.habits.push(newHabit);
        await user.save();

        res.status(201).json({ message: 'Habit added successfully', habit: newHabit });
    } catch (error) {
        res.status(500).json({ message: 'Error adding habit', error });
    }
});

// ✅ Update Habit Streak (Auto-Move Expired Habits)
router.put('/:userId/habits/:habitId', async (req, res) => {
    const { userId, habitId } = req.params;
    const { forceIncrement } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const habit = user.habits.find(h => h.id === habitId);
        if (!habit) return res.status(404).json({ message: 'Habit not found' });

        const today = new Date().toISOString().split("T")[0];

        if (habit.endDate && new Date(habit.endDate) <= new Date()) {
            const expiredHabit = { ...habit.toObject(), endDate: new Date() };
            user.history.push(expiredHabit);
            user.habits = user.habits.filter(h => h.id !== habitId);
            await user.save();
            return res.status(200).json({ message: 'Habit expired and moved to history.', history: user.history });
        }

        if (habit.lastCompleted === today && !forceIncrement) {
            return res.status(400).json({ message: 'Streak already updated today' });
        }

        habit.streak += 1;
        habit.lastCompleted = today;
        habit.completionDates.push(new Date().toISOString());

        if (habit.streak % 7 === 0) user.gold += 10;

        await user.save();
        res.status(200).json({ message: 'Habit updated successfully', habit });
    } catch (error) {
        res.status(500).json({ message: 'Error updating habit', error });
    }
});

// ✅ Delete Habit & Move to History
router.delete('/:userId/habits/:habitId', async (req, res) => {
    const { userId, habitId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const habitToDelete = user.habits.find(h => h.id === habitId);
        if (!habitToDelete) return res.status(404).json({ message: 'Habit not found' });

        const habitCopy = { ...habitToDelete.toObject(), endDate: new Date() };
        user.history.push(habitCopy);
        user.habits = user.habits.filter(h => h.id !== habitId);

        await user.save();
        res.status(200).json({ message: 'Habit moved to history.', history: user.history });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting habit', error });
    }
});

// ✅ Delete History by ID
router.delete('/:userId/history/:historyId', async (req, res) => {
    const { userId, historyId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.history = user.history.filter(h => h.id !== historyId);
        await user.save();

        res.status(200).json({ message: 'History entry deleted successfully.', history: user.history });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting history entry', error });
    }
});

// ✅ Get Habit History with Date and Time
router.get('/:userId/history', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const enrichedHistory = user.history.map(habit => ({
            ...habit.toObject(),
            completionDates: habit.completionDates.map(date => new Date(date).toLocaleString())
        }));

        res.status(200).json({ history: enrichedHistory });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history', error });
    }
});
// ✅ Delete History by ID
router.delete('/:userId/history/:historyId', async (req, res) => {
    const { userId, historyId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const historyIndex = user.history.findIndex(h => h.id === historyId);
        if (historyIndex === -1) {
            return res.status(404).json({ message: 'History entry not found' });
        }

        user.history.splice(historyIndex, 1); // Remove the entry
        await user.save();

        res.status(200).json({ message: 'History entry deleted successfully.', history: user.history });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting history entry', error });
    }
});


export default router;