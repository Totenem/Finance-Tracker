import express from 'express';
import bcrypt from 'bcrypt';
import cors from 'cors';
import pool from './database.js'; 

const app = express();
const port = 3000;

// Middleware
app.use(cors({
    origin: 'http://127.0.0.1:5500' // Allow your frontend URL
}));
app.use(express.json()); // To parse JSON bodies

// Login Endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const query = 'SELECT * FROM users WHERE username = ?';
        const [rows] = await pool.execute(query, [username]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password.' });
        }

        res.status(200).json({ 
            message: 'Login successful!', 
            user: { userId: user.user_id, username: user.username } 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Sign-Up Endpoint
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO users (username, email, password_hash, created_at) 
            VALUES (?, ?, ?, NOW())
        `;
        const [results] = await pool.execute(query, [username, email, hashedPassword]);

        res.status(201).json({ 
            message: 'User registered successfully!', 
            userId: results.insertId 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Transactions Endpoint
app.post('/transactions', async (req, res) => {
    const { user_id, amount, category, type, date } = req.body;

    if (!user_id || !amount || !category || !type || !date) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const query = `
            INSERT INTO transactions (user_id, amount, category, type, date) 
            VALUES (?, ?, ?, ?, ?)
        `;
        await pool.execute(query, [user_id, amount, category, type, date]);
        res.status(201).json({ message: 'Transaction added successfully!' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Endpoint to get transactions for a specific user
app.get('/transactions/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const query = 'SELECT * FROM transactions WHERE user_id = ?';
        const [rows] = await pool.execute(query, [userId]);

        res.status(200).json(rows); // Send the transactions as a response
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Endpoint to delete a transaction
app.delete('/transactions/:id', async (req, res) => {
    const transactionId = req.params.id;

    try {
        const query = 'DELETE FROM transactions WHERE transaction_id = ?';
        await pool.execute(query, [transactionId]);
        res.status(204).send(); // No content to send back
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});