import winston from 'winston';
import 'winston-daily-rotate-file';
import 'winston-mongodb';
import { Config } from '..';
import fs from 'fs';
import path from 'path';

const days = 15;

// ✅ STEP 1: Pehle base directory banao
const logBaseDir: string = path.join(`logs/${Config.NODE_ENV}`);
if (!fs.existsSync(logBaseDir)) {
    fs.mkdirSync(logBaseDir, { recursive: true });
    console.log(`Created log base directory: ${logBaseDir}`);
}

// ✅ STEP 2: Today ka folder banao
const currentDate: Date = new Date();
const folderName: string = `${String(currentDate.getDate()).padStart(2, '0')}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${currentDate.getFullYear()}`;
const logDirectory: string = path.join(logBaseDir, folderName);

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
    console.log(`Created today's log directory: ${logDirectory}`);
}

// ✅ STEP 3: Ab safe hai - old folders delete karo
const deleteOldLogFolders = (daysToKeep: number): void => {
    // Ab directory zaroor exist karegi
    fs.readdir(
        logBaseDir,
        (err: NodeJS.ErrnoException | null, folders: string[]) => {
            if (err) {
                console.error('Error reading log directory:', err);
                return;
            }

            const now: Date = new Date();

            folders.forEach((folder: string) => {
                const match = folder.match(/^(\d{2}-\d{2}-\d{4})$/);
                if (match) {
                    const folderDateStr: string = match[1];
                    const folderDate: Date = new Date(
                        folderDateStr.split('-').reverse().join('-'),
                    );
                    const diffDays: number =
                        (now.getTime() - folderDate.getTime()) /
                        (1000 * 60 * 60 * 24);

                    if (diffDays > daysToKeep) {
                        const folderPath: string = path.join(
                            logBaseDir,
                            folder,
                        );
                        try {
                            fs.rmSync(folderPath, {
                                recursive: true,
                                force: true,
                            });
                            console.log(`Deleted old log folder: ${folder}`);
                        } catch (error) {
                            console.error(
                                `Failed to delete folder ${folder}:`,
                                error,
                            );
                        }
                    }
                }
            });
        },
    );
};

// Ab call karo
deleteOldLogFolders(days);

// Define Log Colors
const colors: Record<string, string> = {
    error: '\x1b[31m',
    warn: '\x1b[33m',
    info: '\x1b[32m',
    debug: '\x1b[35m',
    reset: '\x1b[0m',
};

const colorizeText = (level: string, text: string): string => {
    return `${colors[level] || colors.reset}${text}${colors.reset}`;
};

interface LogInfo {
    timestamp: string;
    level: string;
    message: string;
    serviceName?: string;
    [key: string]: unknown;
}

const consoleLogFormat = winston.format.printf((info: unknown) => {
    const { timestamp, level, message, serviceName, ...meta } = info as LogInfo;

    const formattedLog = `timestamp: [${String(timestamp)}], level: [${String(level).toUpperCase()}], serviceName: [${
        typeof serviceName === 'string' ? serviceName : 'unknown-service'
    }], message: [${String(message)}], data: [${JSON.stringify(meta)}]`;

    return colorizeText(level, formattedLog);
});

const fileLogFormat = winston.format.combine(
    winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    winston.format.printf((info: unknown) => {
        const { timestamp, level, message, serviceName, ...meta } =
            info as LogInfo;

        if (`${level.toUpperCase()}` === 'ERROR') {
            return `timestamp: [${timestamp}], level: [${level.toUpperCase()}], serviceName: [${
                typeof serviceName === 'string'
                    ? serviceName
                    : 'unknown-service'
            }], message: [${message}], meta: ${JSON.stringify(meta, null, 2)}\n\n🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥      END\n`;
        }

        return `timestamp: [${timestamp}], level: [${level.toUpperCase()}], serviceName: [${
            typeof serviceName === 'string' ? serviceName : 'unknown-service'
        }], message: [${message}], meta: ${JSON.stringify(meta, null, 2)}`;
    }),
);

const dailyRotateTransport = new winston.transports.DailyRotateFile({
    dirname: logDirectory,
    filename: 'combined-%DATE%.log',
    datePattern: 'DD-MM-YYYY',
    maxFiles: `${days}d`,
    level: 'debug',
    format: fileLogFormat,
});

const errorRotateTransport = new winston.transports.DailyRotateFile({
    dirname: logDirectory,
    filename: 'error-%DATE%.log',
    datePattern: 'DD-MM-YYYY',
    level: 'error',
    format: fileLogFormat,
});

const mongoDBTransport = new winston.transports.MongoDB({
    level: 'info',
    db: Config.MONGO_URI || 'mongodb://localhost:27017/logs_db',
    collection: 'log_entries',
    tryReconnect: true,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(),
    ),
    storeHost: true,
    metaKey: 'meta',
    expireAfterSeconds: 3600 * 24 * 30,
});

const logger = winston.createLogger({
    level: 'debug',
    defaultMeta: { serviceName: 'Auth-Service' },
    transports: [
        dailyRotateTransport,
        errorRotateTransport,
        mongoDBTransport,
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
                consoleLogFormat,
            ),
            silent: Config.NODE_ENV === 'test',
        }),
    ],
});

export default logger;
