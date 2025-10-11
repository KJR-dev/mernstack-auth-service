import Joi from 'joi';

export const createSchema = Joi.object({
    name: Joi.string()
        .trim()
        .pattern(/^[A-Za-z0-9 ]*[A-Za-z][A-Za-z0-9 ]*$/)
        .required()
        .messages({
            'string.empty': 'Name cannot be empty!',
            'any.required': 'Name is required!',
            'string.pattern.base':
                'Name must contain at least one letter, can include digits and spaces, and cannot start with a space.',
        }),

    address: Joi.string()
        .trim()
        .pattern(/^(?!\d+$)[A-Za-z0-9,\-\s]+$/)
        .required()
        .messages({
            'string.empty': 'Address cannot be empty!',
            'any.required': 'Address name is required!',
            'string.pattern.base':
                'Address must contain letters and can include digits, commas, hyphens, and spaces. It cannot be only digits.',
        }),
});

export const getAndDeleteByIdSchema = Joi.object({
    id: Joi.number().integer().required().messages({
        'number.base': 'Id must be a valid number',
        'any.required': 'Id is required and must be a valid number',
    }),
});

export const updateByIdSchema = Joi.object({
    name: Joi.string()
        .trim()
        .pattern(/^[A-Za-z0-9 ]*[A-Za-z][A-Za-z0-9 ]*$/)
        .required()
        .messages({
            'string.empty': 'Name cannot be empty!',
            'any.required': 'Name is required!',
            'string.pattern.base':
                'Name must contain at least one letter, can include digits and spaces, and cannot start with a space.',
        }),

    address: Joi.string()
        .trim()
        .pattern(/^(?!\d+$)[A-Za-z0-9,\-\s]+$/)
        .required()
        .messages({
            'string.empty': 'Address cannot be empty!',
            'any.required': 'Address name is required!',
            'string.pattern.base':
                'Address must contain letters and can include digits, commas, hyphens, and spaces. It cannot be only digits.',
        }),
});
