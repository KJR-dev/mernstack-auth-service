import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';

describe('DELETE /user/:id', () => {
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
            it('Should return a 204 status code', async () => {
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

                //Arrange
                const { id } = createData.body as { id: number };
                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const response = await request(app)
                    .delete(`/api/v1/web/auth/user/${id}`)
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send();

                //Asserts
                expect(response.statusCode).toBe(204);
            });

            it('Should return a 400 status code due to incorrect id', async () => {
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
                await request(app)
                    .post('/api/v1/web/auth/user')
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send(userData);

                //Arrange
                const idStr = 'xyz';

                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const response = await request(app)
                    .delete(`/api/v1/web/auth/user/${idStr}`)
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send();

                //Asserts
                expect(response.statusCode).toBe(400);
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
                const createData = await request(app)
                    .post('/api/v1/web/auth/user')
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send(userData);

                const { id } = createData.body as { id: number };
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const response = await request(app)
                    .delete(`/api/v1/web/auth/user/${id}`)
                    .send();

                //Asserts
                expect(response.statusCode).toBe(401);
            });

            it('Should return 403 if user is not an admin', async () => {
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
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const response = await request(app)
                    .delete(`/api/v1/web/auth/user/${id}`)
                    .set('Cookie', [`accessToken=${managerToken}`])
                    .send();

                //Asserts
                expect(response.statusCode).toBe(403);
            });
        });
    });
});
