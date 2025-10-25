import { Request } from 'express';

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    tenantId: number;
}

export interface UserId {
    id: number;
}

export interface CreateUserRequest extends Request {
    body: UserData;
}

export interface UserQueryParams {
    currentPage: number;
    perPage: number;
    q: string;
    role: string;
}

export interface getByIdUserRequest extends Request {
    body: UserId;
}

export interface UserUpadateData {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    tenantId: number;
}

export interface UpadateUserRequest extends Request {
    body: UserUpadateData;
}
