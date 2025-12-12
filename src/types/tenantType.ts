import { Request } from 'express';

export interface ITenant {
    name: string;
    address: string;
}

export interface ITenantId {
    id: string; // use string if reading directly from req.params
}

// export interface ITenantAddress {
//     address: string;
// }

export interface CreateTenantRequest extends Request {
    body: ITenant;
}

export type IdTenantRequest = Request<ITenantId>;

export type UpdateTenantRequest = Request<ITenantId, object, ITenant>;

export interface TenantQueryParams {
    currentPage: number;
    perPage: number;
}
