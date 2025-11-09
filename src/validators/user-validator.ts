import Joi from 'joi';
// import { sanitizeInput } from '../utils/sanitize';
import { Roles } from '../constants';

export const createUserSchema = Joi.object({
    firstName: Joi.string()
        .trim()
        .pattern(/^[A-Za-z]+$/)
        .required()
        .messages({
            'string.empty': 'First name is required and cannot be empty.',
            'string.pattern.base': 'First name must contain only letters.',
        }),

    lastName: Joi.string()
        .trim()
        .pattern(/^[A-Za-z]+$/)
        .required()
        .messages({
            'string.empty': 'Last name is required and cannot be empty.',
            'string.pattern.base': 'Last name must contain only letters.',
        }),

    email: Joi.string().trim().email().required().messages({
        'string.empty': 'Email is required and cannot be empty.',
        'string.email': 'Email must be a valid email address.',
    }),

    password: Joi.string()
        .trim()
        .required()
        .min(8)
        .pattern(/[A-Z]/, 'uppercase')
        .pattern(/[a-z]/, 'lowercase')
        .pattern(/[0-9]/, 'number')
        .pattern(/[^A-Za-z0-9]/, 'symbol')
        .messages({
            'string.empty': 'Password is required and cannot be empty.',
            'string.min': 'Password must be at least 8 characters.',
            'string.pattern.name':
                'Password must include at least one {#name} character.',
        }),
    role: Joi.string()
        .trim()
        .valid(Roles.ADMIN, Roles.CUSTOMER, Roles.MANAGER)
        .messages({
            'string.base': 'Role must be a string.',
            'any.only': 'Role must be: admin , manager and customer',
            'string.empty': 'Role is required and cannot be empty.',
        }),
    tenantId: Joi.number()
        .integer()
        .positive()
        .min(1)
        .when('role', {
            is: Roles.MANAGER,
            then: Joi.required().messages({
                'any.required': 'Tenant id is required for manager role.',
            }),
            otherwise: Joi.forbidden().messages({
                'any.unknown': 'Tenant id is only allowed for manager role.',
            }),
        })
        .messages({
            'number.base': 'Tenant id must be a number.',
            'number.integer': 'Tenant id must be an integer.',
            'number.positive': 'Tenant id must be a positive number.',
            'number.min': 'Tenant id must be at least 1.',
        }),
});

export const getByIdSchema = Joi.object({
    id: Joi.number().integer().positive().min(1).required().messages({
        'number.base': 'Id must be a number.',
        'number.integer': 'Id must be an integer.',
        'number.positive': 'Id must be a positive number.',
        'number.min': 'Id must be at least 1.',
        'any.required': 'Id is required.',
    }),
});

// export const createQueryUserSchema = Joi.object({
//     name2: Joi.string()
//         .trim()
//         .required()
//         .custom((value: string) => {
//             return sanitizeInput(value);
//         }, 'Sanitize XSS input')
//         .messages({
//             'string.empty': 'name2 is required and cannot be empty.',
//             'string.pattern.base': 'name2 must contain only letters.',
//         }),
// })
