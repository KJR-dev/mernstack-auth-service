import express, { NextFunction, Request, Response } from 'express';
import { TenantController } from '../controllers/TenantController';
import { TenantService } from '../services/TenantService';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import logger from '../config/logger';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { Roles } from '../constants';
import {
    createSchema,
    getAndDeleteByIdSchema,
    updateByIdSchema,
} from '../validators/tenant-validator';
import {
    CreateTenantRequest,
    IdTenantRequest,
    UpdateTenantRequest,
} from '../types/tenantType';
import { validateRequest } from '../middlewares/validateRequest';
import { sanitizeXSSMiddleware } from '../middlewares/sanitizeXSS';
import listTenantsValidator from '../validators/list-tenants-validator';

const tenantRouter = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

tenantRouter
    .route('/')
    .post(
        authenticate,
        canAccess([Roles.ADMIN]),
        sanitizeXSSMiddleware,
        validateRequest(createSchema, 'body'),
        async (req: CreateTenantRequest, res: Response, next: NextFunction) => {
            await tenantController.create(req, res, next);
        },
    )
    .get(
        listTenantsValidator,
        async (req: Request, res: Response, next: NextFunction) => {
            await tenantController.getAll(req, res, next);
        },
    );
tenantRouter
    .route('/:id')
    .get(
        authenticate,
        canAccess([Roles.ADMIN]),
        sanitizeXSSMiddleware,
        validateRequest(getAndDeleteByIdSchema, 'params'),
        async (req: IdTenantRequest, res: Response, next: NextFunction) => {
            await tenantController.getById(req, res, next);
        },
    )
    .delete(
        authenticate,
        canAccess([Roles.ADMIN]),
        sanitizeXSSMiddleware,
        validateRequest(getAndDeleteByIdSchema, 'params'),
        async (req: IdTenantRequest, res: Response, next: NextFunction) => {
            await tenantController.deleteById(req, res, next);
        },
    )
    .put(
        authenticate,
        canAccess([Roles.ADMIN]),
        sanitizeXSSMiddleware,
        validateRequest(getAndDeleteByIdSchema, 'params'),
        validateRequest(updateByIdSchema, 'body'),
        async (req: UpdateTenantRequest, res: Response, next: NextFunction) => {
            await tenantController.updateById(req, res, next);
        },
    );

export default tenantRouter;
