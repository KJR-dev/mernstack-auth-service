import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from './config/logger';
import { HttpError } from 'http-errors';
import route from './routes';
import helmet from 'helmet';
import { Config } from './config';

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: '',
                location: '',
            },
        ],
    });
});
export default app;
