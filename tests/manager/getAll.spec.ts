import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';
import { User } from '../../src/entity/User';

describe('GET /manager', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501');
        connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
        jwks?.start();
        await connection.dropDatabase();
        await connection.synchronize();
        adminToken = jwks.token({ sub: '1', role: Roles.ADMIN });
    });

    afterEach(() => {
        jwks?.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Happy Parts', () => {
        it('should return the 201 status code', async () => {
            //Arrenge
            const tenantData = {
                name: 'Puri Store',
                address: 'Puri, Odisha-752001',
            };

            //Action
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const tenantResponse = await request(app)
                .post('/api/v1/web/auth/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            const { id } = tenantResponse.body as { id: number };

            //Arrenge
            const userData = {
                firstName: 'Jitendra',
                lastName: 'Sahoo',
                email: 'saho6oj168@gmail.com',
                password: 'Jitu@135050',
                role: 'manager',
                tenantId: id,
            };

            //Action
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .post('/api/v1/web/auth/manager')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find({
                where: {
                    role: 'manager',
                },
            });

            //Asserts
            expect(response.statusCode).toBe(201);
            expect(users.length).toBeGreaterThanOrEqual(1);
        });

        // it('should return the 200 status code', async () => {
        //     //Arrenge
        //     const tenantData = {
        //         name: 'Puri Store',
        //         address: 'Puri, Odisha-752001',
        //     };

        //     //Action
        //     // eslint-disable-next-line @typescript-eslint/no-misused-promises
        //     const tenantResponse = await request(app)
        //         .post('/api/v1/web/auth/tenants')
        //         .set('Cookie', [`accessToken=${adminToken}`])
        //         .send(tenantData);

        //     const { id } = tenantResponse.body as { id: number };

        //     //Arrenge
        //     const managerData = {
        //         firstName: 'Jitendra',
        //         lastName: 'Sahoo',
        //         email: 'saho6oj168@gmail.com',
        //         password: 'Jitu@135050',
        //         role: 'manager',
        //         tenantId: id,
        //     };

        //     interface ManagerResponse {
        //         id: number;
        //         firstName: string;
        //         lastName: string;
        //         email: string;
        //         role: string;
        //         tenantId?: number;
        //         deletedAt?: string | null;
        //     }
        //     //Action
        //     // eslint-disable-next-line @typescript-eslint/no-misused-promises
        //     await request(app)
        //         .post('/api/v1/web/auth/manager')
        //         .set('Cookie', [`accessToken=${adminToken}`])
        //         .send(managerData);

        //     // eslint-disable-next-line @typescript-eslint/no-misused-promises
        //     const response = await request(app)
        //         .get('/api/v1/web/auth/manager')
        //         .set('Cookie', [`accessToken=${adminToken}`])
        //         .query({ role: 'manager' });

        //     // Type-safe assignment
        //     const managersArray = response.body as ManagerResponse[];
        //     const manager = managersArray[0];

        //     expect(manager.firstName).toBe(managerData.firstName);
        //     expect(manager.lastName).toBe(managerData.lastName);
        //     expect(manager.email).toBe(managerData.email);
        //     expect(manager.role).toBe(managerData.role);
        // });

        it('should return the 401 status code', async () => {
            //Arrenge
            const tenantData = {
                name: 'Puri Store',
                address: 'Puri, Odisha-752001',
            };

            //Action
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const tenantResponse = await request(app)
                .post('/api/v1/web/auth/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            const { id } = tenantResponse.body as { id: number };

            //Arrenge
            const managerData = {
                firstName: 'Jitendra',
                lastName: 'Sahoo',
                email: 'saho6oj168@gmail.com',
                password: 'Jitu@135050',
                role: 'manager',
                tenantId: id,
            };

            //Action
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .post('/api/v1/web/auth/manager')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(managerData);

            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const manager = await request(app)
                .get('/api/v1/web/auth/manager')
                // .set('Cookie', [`accessToken=${adminToken}`])
                .query({ role: 'manager' });

            //Asserts
            expect(response.statusCode).toBe(201);
            expect(manager.statusCode).toBe(401);
        });

        it('should return the 403 status code', async () => {
            //Arrenge
            const tenantData = {
                name: 'Puri Store',
                address: 'Puri, Odisha-752001',
            };

            //Action
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const tenantResponse = await request(app)
                .post('/api/v1/web/auth/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            const { id } = tenantResponse.body as { id: number };

            //Arrenge
            const managerData = {
                firstName: 'Jitendra',
                lastName: 'Sahoo',
                email: 'saho6oj168@gmail.com',
                password: 'Jitu@135050',
                role: 'manager',
                tenantId: id,
            };

            const managerToken = jwks.token({ sub: '1', role: Roles.MANAGER });
            //Action
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .post('/api/v1/web/auth/manager')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(managerData);

            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const manager = await request(app)
                .get('/api/v1/web/auth/manager')
                .set('Cookie', [`accessToken=${managerToken}`])
                .query({ role: 'manager' });

            //Asserts
            expect(response.statusCode).toBe(201);
            expect(manager.statusCode).toBe(403);
        });
    });
});
