import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

//routes import
import startupRouter from './routes/startup.route.js';
import userRouter from './routes/user.route.js';
import mediChatRouter from './routes/medicalChat.route.js';

//routes declaration
app.use('/api/v1/user', userRouter);
app.use('/api/v1/medi-chat', mediChatRouter);

// http://localhost:5000/api/v1
export { app };
