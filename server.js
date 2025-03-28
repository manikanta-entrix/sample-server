import express from 'express';
import cors  from 'cors';
import connectDb from './config.js';
import dotenv from 'dotenv';
import authRoutes from './auth/routes/auth_user_routes.js';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/entrix/auth', authRoutes);
connectDb(process.env.MONGO_URI);
app.listen(3000, () => {
    console.log('Server started on port 3000');
});