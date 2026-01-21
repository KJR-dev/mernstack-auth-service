import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';
import { RefreshToken } from '../../src/entity/RefreshToken';
import { User } from '../../src/entity/User';

let connection: DataSource; // Declare it globally

describe('POST /auth/register', () => {
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Happy Parts', () => {
        it('Should return the 201 status code', async () => {
            // Arrange
            const userData = {
                firstName: 'Jitendra',
                lastName: 'Sahoo',
                email: 'sahooj168@gmail.com',
                password: 'Jitu@135050',
                role: 'admin',
            };

            // Act
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            await request(app).post('/api/v1/web/auth/register').send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository
                .createQueryBuilder('user')
                .addSelect('user.password')
                .getMany();

            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
            expect(users[0].role).toBe(Roles.ADMIN);
        });

        it('Should return a 400 status code if the email already exists', async () => {
            // Arrange
            const userData = {
                firstName: 'Jitendra',
                lastName: 'Sahoo',
                email: 'sahooj168@gmail.com',
                password: '1234',
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });

            // Act
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .post('/api/v1/web/auth/register')
                .send(userData);

            const users = await userRepository.find();

            // Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });

        it('Should return access and refresh tokens inside a cookie part - 1', async () => {
            // Arrange
            const userData = {
                firstName: 'Jitendra',
                lastName: 'Sahoo',
                email: 'sahooj168@gmail.com',
                password: 'Jitu@1234',
                role: 'admin',
            };

            // Act
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .post('/api/v1/web/auth/register')
                .send(userData);
            let accessToken: string | null = null;
            let refreshToken: string | null = null;

            interface Headers {
                ['set-cookie']: string[];
            }
            //Asser]
            const cookies =
                (response.headers as unknown as Headers)['set-cookie'] || [];
            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                }
                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });

            // Assert
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
        });

        it('Should return access and refresh tokens inside a cookie part - 2', async () => {
            // Arrange
            const userData = {
                firstName: 'Jitendra',
                lastName: 'Sahoo',
                email: 'sahooj168@gmail.com',
                password: 'Jitu@1234',
                role: 'admin',
            };

            // Act
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .post('/api/v1/web/auth/register')
                .send(userData);

            //Asser]
            const refreshTokenRepository =
                connection.getRepository(RefreshToken);
            const token = await refreshTokenRepository
                .createQueryBuilder('refreshToken')
                .where('refreshToken.userId=:userId', {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();

            expect(token).toHaveLength(1);
        });
    });

    describe('Sad Parts', () => {
        describe('Missing Fields', () => {
            it('Should return a 400 status code if the email field is missing', async () => {
                // Arrange
                const userData = {
                    firstName: 'Jitendra',
                    lastName: 'Sahoo',
                    email: '',
                    password: '1234',
                };

                // Act
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const response = await request(app)
                    .post('/api/v1/web/auth/register')
                    .send(userData);

                // Assert
                expect(response.statusCode).toBe(400);
            });
        });
    });

    describe('Sanitizing Fields', () => {
        it('Should trim the email field', async () => {
            // Arrange
            const userData = {
                firstName: 'Jitendra',
                lastName: 'Sahoo',
                email: ' sahooj168@gmail.com ',
                password: 'Jitu@1234',
                role: 'admin',
            };

            // Act
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            await request(app).post('/api/v1/web/auth/register').send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];
            expect(user.email).toBe('sahooj168@gmail.com');
        });
    });
});
