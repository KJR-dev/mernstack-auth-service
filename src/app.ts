import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import 'reflect-metadata';
import { Config } from './config';
import { globalErrorHandler } from './middlewares/golbalErrorHandler';
import route from './routes';

const app = express();
const ALLOWED_DOMAINS = [
    Config.FRONTEND_ADMIN_UI_URL,
    Config.FRONTEND_CLIENT_UI_URL,
];
app.use(
    cors({
        origin: ALLOWED_DOMAINS as string[],
        credentials: true,
    }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));
app.use(helmet());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.get('/', (_req: Request, res: Response, next: NextFunction) => {
    res.send('welcome to auth service');
});

app.use('/api', route);
//Global error handler.
app.use(globalErrorHandler);
export default app;
