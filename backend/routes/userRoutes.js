import express from 'express';
import { User } from '../models/models.js';

const router = express.Router();

// Create User
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

// Add Habit
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

// Update Streak
router.put('/:userId/habits/:habitId', async (req, res) => {
    const { userId, habitId } = req.params;
    const { lastCompleted } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const habit = user.habits.find(h => h.id === habitId);
        if (!habit) return res.status(404).json({ message: 'Habit not found' });

        if (habit.lastCompleted !== lastCompleted) {
            habit.streak += 1;
            habit.lastCompleted = lastCompleted;

            if (habit.streak % 7 === 0) user.gold += 10; // Gold reward for weekly completion
        }
        
        await user.save();
        res.status(200).json({ message: 'Habit updated successfully', habit });
    } catch (error) {
        res.status(500).json({ message: 'Error updating habit', error });
    }
});

export default router;
