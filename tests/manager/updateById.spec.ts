import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';
import { User } from '../../src/entity/User';

describe('PUT /manager/:id', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501');
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
        adminToken = jwks.token({ sub: '1', role: Roles.ADMIN });
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Happy Parts', () => {
        it('should return the 201 status code', async () => {
            // Arrenge
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

            //Asserts
            expect(tenantResponse.statusCode).toBe(201);

            //Arrenge
            const { id: tenantId } = tenantResponse.body as { id: number };

            const userData = {
                firstName: 'Jitendra',
                lastName: 'Sahoo',
                email: 'saho6oj168@gmail.com',
                password: 'Jitu@135050',
                role: 'manager',
                tenantId: tenantId,
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
                relations: ['tenant'],
            });

            //Asserts
            expect(response.statusCode).toBe(201);
            expect(users.length).toBeGreaterThanOrEqual(1);
        });

        it('should return the 200 status code', async () => {
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

            //Asserts
            expect(tenantResponse.statusCode).toBe(201);

            //Arrenge
            const { id: tenantId } = tenantResponse.body as { id: number };

            const managerData = {
                firstName: 'Jitendra',
                lastName: 'Sahoo',
                email: 'saho6oj168@gmail.com',
                password: 'Jitu@135050',
                role: 'manager',
                tenantId: tenantId,
            };
            const managerData2 = {
                firstName: 'Jitcccccccendra',
                lastName: 'Sahcccccccoo',
                email: 'sahocccccc6oj168@gmail.com',
                password: 'Jitu@135050',
                role: 'manager',
                tenantId: tenantId,
            };

            //Action
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const newData = await request(app)
                .post('/api/v1/web/auth/manager')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(managerData);

            const { id } = newData.body as { id: number };

            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .put(`/api/v1/web/auth/manager/${id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(managerData2);

            expect(response.statusCode).toBe(204);
        });

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

            //Asserts
            expect(tenantResponse.statusCode).toBe(201);

            //Arrenge
            const { id: tenantId } = tenantResponse.body as { id: number };

            const managerData = {
                firstName: 'Jitendra',
                lastName: 'Sahoo',
                email: 'saho6oj168@gmail.com',
                password: 'Jitu@135050',
                role: 'manager',
                tenantId: tenantId,
            };

            //Action
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const newData = await request(app)
                .post('/api/v1/web/auth/manager')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(managerData);

            const { id } = newData.body as { id: number };

            const managerData2 = {
                firstName: 'Jitcccccccendra',
                lastName: 'Sahcccccccoo',
                email: 'sahocccccc6oj168@gmail.com',
                password: 'Jitu@135050',
                role: 'manager',
                tenantId: tenantId,
            };

            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .put(`/api/v1/web/auth/manager/${id}`)
                .send(managerData2);

            expect(response.statusCode).toBe(401);
        });

        it('should return the 403 status code', async () => {
            //Arrenge
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

            //Asserts
            expect(tenantResponse.statusCode).toBe(201);

            //Arrenge
            const { id: tenantId } = tenantResponse.body as { id: number };

            const managerData = {
                firstName: 'Jitendra',
                lastName: 'Sahoo',
                email: 'saho6oj168@gmail.com',
                password: 'Jitu@135050',
                role: 'manager',
                tenantId: tenantId,
            };

            const customerToken = jwks.token({
                sub: '1',
                role: Roles.CUSTOMER,
            });

            //Action
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const newData = await request(app)
                .post('/api/v1/web/auth/manager')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(managerData);

            const { id } = newData.body as { id: number };

            const managerData2 = {
                firstName: 'Jitcccccccendra',
                lastName: 'Sahcccccccoo',
                email: 'sahocccccc6oj168@gmail.com',
                password: 'Jitu@135050',
                role: 'manager',
                tenantId: tenantId,
            };

            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .put(`/api/v1/web/auth/manager/${id}`)
                .set('Cookie', [`accessToken=${customerToken}`])
                .send(managerData2);

            expect(response.statusCode).toBe(403);
        });
    });
});
