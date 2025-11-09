import { Request, Response, NextFunction, RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { ObjectSchema } from 'joi';
import { ParsedQs } from 'qs';

type RequestPart = 'body' | 'query' | 'params';

export const validateRequest = <T extends object>(
    schema: ObjectSchema<T>,
    key: RequestPart = 'body',
): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.validate(req[key], {
            abortEarly: false,
            convert: true,
            stripUnknown: true,
        });

        if (result.error) {
            // const messages = result.error.details.map(
            //     (detail) => detail.message,
            // );
            return next(createHttpError(400, result.error));
            // res.status(400).json({ errors: messages });
            // return;
        }

        if (key === 'body') {
            req.body = result.value;
        } else if (key === 'params') {
            req.params = result.value as unknown as Record<string, string>;
        } else if (key === 'query') {
            req.query = result.value as unknown as ParsedQs;
        }

        next();
    };
};
