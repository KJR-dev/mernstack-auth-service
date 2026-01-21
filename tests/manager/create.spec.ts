import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';
import { User } from '../../src/entity/User';

describe('POST /manager', () => {
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
            const managerResponse = await request(app)
                .post('/api/v1/web/auth/manager')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            //Asserts
            expect(tenantResponse.statusCode).toBe(201);
            expect(managerResponse.statusCode).toBe(201);
        });

        it('Should create a Manager in the Database', async () => {
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
            await request(app)
                .post('/api/v1/web/auth/manager')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const user = await userRepository.find({
                relations: ['tenant'],
            });

            //Asserts
            expect(user).toHaveLength(1);
            expect(user[0].firstName).toBe(userData.firstName);
            expect(user[0].lastName).toBe(userData.lastName);
            expect(user[0].email).toBe(userData.email);
            expect(user[0].role).toBe(userData.role);
        });

        it('Should return 401 if user is not authenticated', async () => {
            //Arrenge
            const userData = {
                firstName: 'Jitendra',
                lastName: 'Sahoo',
                email: 'saho6oj168@gmail.com',
                password: 'Jitu@135050',
                role: 'manager',
                tentantId: 1,
            };

            //Action
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .post('/api/v1/web/auth/tenants')
                .send(userData);

            const userRepository = connection.getRepository(User);
            const user = await userRepository.find();

            //Asserts
            expect(response.statusCode).toBe(401);

            expect(user).toHaveLength(0);
        });

        it('Should return 403 if user is not an admin', async () => {
            //Arrenge
            const managerToken = jwks.token({
                sub: '1',
                role: Roles.MANAGER,
            });

            const userData = {
                firstName: 'Jitendra',
                lastName: 'Sahoo',
                email: 'saho6oj168@gmail.com',
                password: 'Jitu@135050',
                role: 'manager',
                tentantId: 1,
            };

            //Action
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .post('/api/v1/web/auth/tenants')
                .set('Cookie', [`accessToken=${managerToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const user = await userRepository.find();

            //Asserts
            expect(response.statusCode).toBe(403);
            expect(user).toHaveLength(0);
        });
    });
});
