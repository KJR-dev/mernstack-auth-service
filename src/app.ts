import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import route from './routes';
import helmet from 'helmet';
import { Config } from './config';
import { globalErrorHandler } from './middlewares/golbalErrorHandler';

const app = express();
app.use(
    cors({
        origin: Config.FRONTEND_URL,
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
