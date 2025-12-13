import { Router } from 'express';
import authRouter from './AuthRouter';
import tenantRouter from './TenantRouter';
import userRouter from './UserRouter';
import managerRouter from './ManagerRouter';

const router = Router();

router.use('/v1/web/auth', authRouter);
router.use('/v1/web/auth/tenants', tenantRouter);
router.use('/v1/web/auth/user', userRouter);
router.use('/v1/web/auth/manager', managerRouter);

export default router;
