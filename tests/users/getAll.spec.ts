import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';
import { User } from '../../src/entity/User';
describe('GET /user', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;
    let customerToken: string;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        jwks = createJWKSMock('http://localhost:5501');
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
        jwks?.start();
        adminToken = jwks.token({ sub: '1', role: Roles.ADMIN });
        customerToken = jwks.token({ sub: '1', role: Roles.CUSTOMER });
    });

    afterAll(async () => {
        await connection.destroy();
    });

    afterEach(() => {
        jwks?.stop();
    });
    describe('Happy parts', () => {
        describe('Given all field', () => {
            it('Should return a 201 status code by admin', async () => {
                //Arrange
                const userData = {
                    firstName: 'Jitendra',
                    lastName: 'Sahoo',
                    email: 'sahooj168@gmail.com',
                    password: 'Jitu@135050',
                    role: 'customer',
                };
                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                await request(app)
                    .post('/api/v1/web/auth/user')
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send(userData);

                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const response = await request(app)
                    .get('/api/v1/web/auth/user')
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send();

                //Asserts
                expect(response.statusCode).toBe(201);
            });

            it('Should return a users list array', async () => {
                //Arrange
                const userData = {
                    firstName: 'Jitendra',
                    lastName: 'Sahoo',
                    email: 'sahooj168@gmail.com',
                    password: 'Jitu@135050',
                    role: 'customer',
                };

                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                await request(app)
                    .post('/api/v1/web/auth/user')
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send(userData);

                //Asserts
                const userRepository = connection.getRepository(User);
                const users = await userRepository.find();

                expect(Array.isArray(users)).toBe(true);
                expect(users.length).toBeGreaterThanOrEqual(1);
            });

            it('Should return 401 if user is not authenticated', async () => {
                //Arrange
                const userData = {
                    firstName: 'Jitendra',
                    lastName: 'Sahoo',
                    email: 'sahooj168@gmail.com',
                    password: 'Jitu@135050',
                    role: 'customer',
                };

                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                await request(app)
                    .post('/api/v1/web/auth/user')
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send(userData);

                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const response = await request(app)
                    .get('/api/v1/web/auth/user')
                    .send();

                //Asserts
                expect(response.statusCode).toBe(401);
            });

            it('Should return 403 if user is not not allowed to access this resource for customer.', async () => {
                //Arrange
                const userData = {
                    firstName: 'Jitendra',
                    lastName: 'Sahoo',
                    email: 'sahooj168@gmail.com',
                    password: 'Jitu@135050',
                    role: 'customer',
                };

                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                await request(app)
                    .post('/api/v1/web/auth/user')
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send(userData);

                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const response = await request(app)
                    .get('/api/v1/web/auth/user')
                    .set('Cookie', [`accessToken=${customerToken}`])
                    .send();

                //Asserts
                expect(response.statusCode).toBe(403);
            });
        });
    });
});
