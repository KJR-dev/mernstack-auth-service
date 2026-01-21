import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';
import { User } from '../../src/entity/User';

describe('POST /auth/self', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501');
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks?.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks?.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Happy Parts', () => {
        it('should return the 200 status code', async () => {
            //Arrenge
            const accessToken = jwks.token({
                sub: '1',
                role: Roles.CUSTOMER,
            });
            //Action
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .get('/api/v1/web/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();

            //Asserts
            expect(response.statusCode).toBe(200);
        });

        it('Should return user data', async () => {
            const userData = {
                firstName: 'Jitendra',
                lastName: 'sahoo',
                email: 'sahooj168@gmail.com',
                password: '1234',
            };

            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .get('/api/v1/web/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();

            expect((response.body as Record<string, string>).id).toBe(data.id);
        });

        it('Should not return password field', async () => {
            const userData = {
                firstName: 'Jitendra',
                lastName: 'sahoo',
                email: 'sahooj168@gmail.com',
                password: '1234',
            };

            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .get('/api/v1/web/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();

            expect(response.body as Record<string, string>).not.toHaveProperty(
                'password',
            );
        });

        it('Should return 401 status code if token does not exists', async () => {
            const userData = {
                firstName: 'Jitendra',
                lastName: 'sahoo',
                email: 'sahooj168@gmail.com',
                password: '1234',
            };

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .get('/api/v1/web/auth/self')
                .send();

            expect(response.statusCode).toBe(401);
        });

        it('Should return 200 status code if token is available', async () => {
            const userData = {
                firstName: 'Jitendra',
                lastName: 'sahoo',
                email: 'sahooj168@gmail.com',
                password: '1234',
            };

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: '2',
                role: Roles.CUSTOMER,
            });
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .get('/api/v1/web/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();

            expect(response.statusCode).toBe(200);
        });
    });
});
