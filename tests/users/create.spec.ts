import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';
import { User } from '../../src/entity/User';

describe('POST /user', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;
    let customerToken: string;
    let managerToken: string;

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501');
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks?.start();
        await connection.dropDatabase();
        await connection.synchronize();
        jwks?.start();
        adminToken = jwks.token({ sub: '1', role: Roles.ADMIN });
        customerToken = jwks.token({ sub: '1', role: Roles.CUSTOMER });
        managerToken = jwks.token({ sub: '1', role: Roles.MANAGER });
    });

    afterEach(() => {
        jwks?.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Happy Parts', () => {
        it('should return the 201 status code by admin', async () => {
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
                .post('/api/v1/web/auth/user')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            //Asserts
            expect(response.statusCode).toBe(201);
        });

        it('should return the 201 status code by user', async () => {
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
                .post('/api/v1/web/auth/user')
                .set('Cookie', [`accessToken=${customerToken}`])
                .send(userData);

            //Asserts
            expect(response.statusCode).toBe(201);
        });

        it('should return the 201 status code by Manager', async () => {
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
                .post('/api/v1/web/auth/user')
                .set('Cookie', [`accessToken=${managerToken}`])
                .send(userData);

            //Asserts
            expect(response.statusCode).toBe(201);
        });

        it('Should return user data', async () => {
            const userData = {
                firstName: 'Jitendra',
                lastName: 'sahoo',
                email: 'sahooj168@gmail.com',
                password: '1234',
                role: 'customer',
            };

            const userRepository = connection.getRepository(User);
            const data = await userRepository.save(userData);

            const customerToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .get('/api/v1/web/auth/self')
                .set('Cookie', [`accessToken=${customerToken}`])
                .send();

            expect((response.body as Record<string, string>).id).toBe(data.id);

            const tempUserData = await userRepository.find();

            expect(tempUserData[0].firstName).toBe(userData.firstName);
            expect(tempUserData[0].lastName).toBe(userData.lastName);
            expect(tempUserData[0].email).toBe(userData.email);
            expect(tempUserData[0].role).toBe(userData.role);
            // expect(tempUserData[0]).not.toHaveProperty('password');
            // expect(tempUserData[0].password).not.toBe(userData.password);
        });

        it('Should not return password field', async () => {
            const userData = {
                firstName: 'Jitendra',
                lastName: 'sahoo',
                email: 'sahooj168@gmail.com',
                password: '1234',
                role: 'customer',
            };

            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
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
                role: 'customer',
            };

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
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
                role: 'customer',
            };

            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
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

            expect(response.statusCode).toBe(200);
        });
    });
});
