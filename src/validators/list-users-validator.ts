import { checkSchema } from 'express-validator';
import { Roles } from '../../dist/src/constants';

export default checkSchema(
    {
        q: {
            trim: true,
            customSanitizer: {
                options: (value: unknown) => {
                    return value ? value : '';
                },
            },
        },
        role: {
            trim: true,
            customSanitizer: {
                options: (value: string) => {
                    return [
                        Roles.ADMIN,
                        Roles.MANAGER,
                        Roles.CUSTOMER,
                    ].includes(value)
                        ? value
                        : '';
                },
            },
        },
        currentPage: {
            customSanitizer: {
                options: (value) => {
                    const parsedValue = Number(value);
                    return Number.isNaN(parsedValue) ? 1 : parsedValue;
                },
            },
        },
        perPage: {
            customSanitizer: {
                options: (value) => {
                    const parsedValue = Number(value);
                    return Number.isNaN(parsedValue) ? 6 : parsedValue;
                },
            },
        },
    },
    ['query'],
);
