import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// DATABASE CONNECTION POOL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise();

export default pool;