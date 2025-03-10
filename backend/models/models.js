import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    streak: { type: Number, default: 0 },
    lastCompleted: { type: String, default: null },
    completionDates: [{ type: Date }], // Tracks individual completion dates with time
    startDate: { type: Date, default: Date.now }, // Habit creation date
    endDate: { type: Date } // Marks the date when the habit was deleted
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gold: { type: Number, default: 0 },
    habits: [habitSchema], 
    history: [habitSchema] // Deleted habits stored here
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
