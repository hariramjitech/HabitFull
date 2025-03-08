import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import { PORT, mongoDBURL } from './config.js';

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get('/', (req, res) => {
    res.status(200).send('Welcome to the Habit Tracker API! 🚀');
});

app.use('/users', userRoutes);
app.use('/habits', userRoutes); // If this points to different logic, consider separating the route file

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Database Connection & Server Start
mongoose
    .connect(mongoDBURL)
    .then(() => {
        console.log('✅ Successfully connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Database connection failed:', error.message);
    });