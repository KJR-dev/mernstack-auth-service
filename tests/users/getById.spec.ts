import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';

describe('GET /user/:id', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;
    let managerToken: string;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        jwks = createJWKSMock('http://localhost:5501');
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
        jwks.start();
        adminToken = jwks.token({ sub: '1', role: Roles.ADMIN });
        managerToken = jwks.token({ sub: '1', role: Roles.MANAGER });
    });

    afterAll(async () => {
        await connection.destroy();
    });

    afterEach(() => {
        jwks.stop();
    });
    describe('Happy parts', () => {
        describe('Given all field', () => {
            it('Should return a 201 status code', async () => {
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
                const response = await request(app)
                    .post(`/api/v1/web/auth/user`)
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send(userData);

                //Asserts
                expect(response.statusCode).toBe(201);
            });

            it('Should return 200 status code with perticular user data', async () => {
                //Arrange
                const userData = {
                    firstName: 'Jitendra',
                    lastName: 'Sahoo',
                    email: 'saho6oj168@gmail.com',
                    password: 'Jitu@135050',
                    role: 'customer',
                };
                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const response = await request(app)
                    .post('/api/v1/web/auth/user')
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send(userData);

                const { id } = response.body as { id: number };

                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const user = await request(app)
                    .get(`/api/v1/web/auth/user/${id}`)
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send();

                //Asserts
                expect(user.statusCode).toBe(200);
                expect((user.body as Record<string, string>).firstName).toBe(
                    userData.firstName,
                );
                expect((user.body as Record<string, string>).lastName).toBe(
                    userData.lastName,
                );
                expect((user.body as Record<string, string>).email).toBe(
                    userData.email,
                );
                expect((user.body as Record<string, string>).role).toBe(
                    userData.role,
                );
            });

            it('Should return 401 if user is not authenticated', async () => {
                //Arrange
                const userData = {
                    firstName: 'Jitendra',
                    lastName: 'Sahoo',
                    email: 'saho6oj168@gmail.com',
                    password: 'Jitu@135050',
                    role: 'customer',
                };
                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const createData = await request(app)
                    .post('/api/v1/web/auth/user')
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send(userData);

                const { id } = createData.body as { id: number };

                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const response = await request(app)
                    .get(`/api/v1/web/auth/user/${id}`)
                    .send();

                //Asserts
                expect(response.statusCode).toBe(401);
            });

            it('Should return 403 if user is not access resource', async () => {
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
                const createData = await request(app)
                    .post('/api/v1/web/auth/user')
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send(userData);

                const { id } = createData.body as { id: number };

                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const response = await request(app)
                    .get(`/api/v1/web/auth/user/${id}`)
                    .set('Cookie', [`accessToken=${managerToken}`])
                    .send();

                //Asserts
                expect(response.statusCode).toBe(403);
            });
        });
    });
});
