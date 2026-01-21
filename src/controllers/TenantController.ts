import { NextFunction, Request, Response } from 'express';
import { TenantService } from '../services/TenantService';
import { Logger } from 'winston';
import {
    CreateTenantRequest,
    IdTenantRequest,
    TenantQueryParams,
    UpdateTenantRequest,
} from '../types/tenantType';
import { matchedData, validationResult } from 'express-validator';

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}

    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const { name, address } = req.body;
        this.logger.debug('Request for creating a tenant', req.body);

        try {
            const result = validationResult(req);
            if (!result.isEmpty()) {
                this.logger.error('Tenant not created', {
                    errors: result.array(),
                });
                res.status(400).json({ errors: result.array() });
                return;
            }
            const tenant = await this.tenantService.create({ name, address });
            this.logger.info('Tenant has been created', { id: tenant.id });
            res.status(201).json({ id: tenant.id });
        } catch (error) {
            next(error);
            return;
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        const validateQuery = matchedData(req, { onlyValidData: true });
        try {
            const [tenants, count] = await this.tenantService.getAll(
                validateQuery as TenantQueryParams,
            );
            this.logger.info('Tenant has been created', tenants);

            res.status(201).json({
                currentPage: validateQuery.currentPage as number,
                perPage: validateQuery.perPage as number,
                total: count,
                data: tenants,
            });
        } catch (error) {
            next(error);
            return;
        }
    }

    async getById(req: IdTenantRequest, res: Response, next: NextFunction) {
        const { id } = req.params;
        this.logger.debug('Request for fetch a tenant', req.params);
        try {
            const tenantData = await this.tenantService.getById(Number(id));
            this.logger.info(
                'Tenant Data has been fetch successfully',
                tenantData,
            );
            res.status(201).json(tenantData);
        } catch (error) {
            next(error);
            return;
        }
    }

    async deleteById(req: IdTenantRequest, res: Response, next: NextFunction) {
        const { id } = req.params;
        this.logger.debug('Request for delete a tenant', req.params);
        try {
            const tenantData = await this.tenantService.deleteById(Number(id));
            this.logger.info(
                'Tenant Data has been fetch successfully',
                tenantData,
            );
            res.status(201).json({ affected: tenantData.affected });
        } catch (error) {
            next(error);
            return;
        }
    }

    async updateById(
        req: UpdateTenantRequest,
        res: Response,
        next: NextFunction,
    ) {
        const id = Number(req.params.id);
        const { name, address } = req.body;
        this.logger.debug('Request to update a tenant', { id, name, address });
        try {
            const updateResult = await this.tenantService.updateById(
                id,
                name,
                address,
            );

            if (updateResult.affected === 0) {
                this.logger.warn('No tenant was updated, possibly not found', {
                    id,
                });
                return res
                    .status(404)
                    .json({ message: 'Tenant not found or no changes made' });
            }

            this.logger.info('Tenant updated successfully', { id });
            return res.status(204).json();
        } catch (error) {
            next(error);
            return;
        }
    }
}
