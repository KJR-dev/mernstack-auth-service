import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';
import { Tenant } from '../../src/entity/Tenant';

describe('PATCH /tenants', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        jwks = createJWKSMock('http://localhost:5501');
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
        jwks.start();
        adminToken = jwks.token({ sub: '1', role: Roles.ADMIN });
    });

    afterAll(async () => {
        await connection.destroy();
    });

    afterEach(() => {
        jwks.stop();
    });
    describe('Happy parts', () => {
        describe('Given all field', () => {
            it('Should return a 201 status code of address update', async () => {
                //Arrenge
                const tenantData = {
                    name: 'Puri Store',
                    address: 'Puri, Odisha-752001',
                };

                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                await request(app)
                    .post('/api/v1/web/auth/tenants')
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send(tenantData);

                //Arrenge
                const tenantsRepository = connection.getRepository(Tenant);
                const tenant = await tenantsRepository.find();
                const updateTenantData = {
                    name: 'Puri Store',
                    address: 'Puri, Odisha-752001',
                };

                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const responseUpdateData = await request(app)
                    .put(`/api/v1/web/auth/tenants/${tenant[0].id}`)
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send(updateTenantData);

                //Asserts
                expect(responseUpdateData.statusCode).toBe(204);
            });

            it('Should return 401 if user is not authenticated', async () => {
                //Arrenge
                const tenantData = {
                    name: 'Puri Store',
                    address: 'Puri, Odisha-752001',
                };

                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const response = await request(app)
                    .post('/api/v1/web/auth/tenants')
                    .send(tenantData);

                const tenantsRepository = connection.getRepository(Tenant);
                const tenants = await tenantsRepository.find();

                //Asserts
                expect(response.statusCode).toBe(401);

                expect(tenants).toHaveLength(0);
            });

            it('Should return 403 if user is not an admin', async () => {
                //Arrenge
                const managerToken = jwks.token({
                    sub: '1',
                    role: Roles.MANAGER,
                });

                const tenantData = {
                    name: 'Puri Store',
                    address: 'Puri, Odisha-752001',
                };

                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const response = await request(app)
                    .post('/api/v1/web/auth/tenants')
                    .set('Cookie', [`accessToken=${managerToken}`])
                    .send(tenantData);

                const tenantsRepository = connection.getRepository(Tenant);
                const tenants = await tenantsRepository.find();

                //Asserts
                expect(response.statusCode).toBe(403);
                expect(tenants).toHaveLength(0);
            });
        });
    });

    describe('Sad parts', () => {
        describe('Missing Fields', () => {
            it('Should return 400 if tenant name starting with digit', async () => {
                //Arrenge
                const adminToken = jwks.token({
                    sub: '1',
                    role: Roles.ADMIN,
                });

                const tenantData = {
                    name: '1',
                    address: 'Puri, Odisha-752001',
                };

                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const response = await request(app)
                    .post('/api/v1/web/auth/tenants')
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send(tenantData);

                //Asserts
                expect(response.statusCode).toBe(400);
            });

            it('Should return 400 if tenant name starting with space', async () => {
                //Arrenge
                const adminToken = jwks.token({
                    sub: '1',
                    role: Roles.ADMIN,
                });

                const tenantData = {
                    name: ' ',
                    address: 'Puri, Odisha-752001',
                };

                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const response = await request(app)
                    .post('/api/v1/web/auth/tenants')
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send(tenantData);

                //Asserts
                expect(response.statusCode).toBe(400);
            });

            it('Should return 400 if tenant name is digits', async () => {
                //Arrenge
                const adminToken = jwks.token({
                    sub: '1',
                    role: Roles.ADMIN,
                });

                const tenantData = {
                    name: 122,
                    address: 'Puri, Odisha-752001',
                };

                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const response = await request(app)
                    .post('/api/v1/web/auth/tenants')
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send(tenantData);

                //Asserts
                expect(response.statusCode).toBe(400);
            });

            it('Should return 400 if tenant address is digits', async () => {
                //Arrenge
                const adminToken = jwks.token({
                    sub: '1',
                    role: Roles.ADMIN,
                });

                const tenantData = {
                    name: 'jit 123',
                    address: '752001',
                };

                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const response = await request(app)
                    .post('/api/v1/web/auth/tenants')
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send(tenantData);

                //Asserts
                expect(response.statusCode).toBe(400);
            });

            it('Should return 400 if tenant address starting with space', async () => {
                //Arrenge
                const adminToken = jwks.token({
                    sub: '1',
                    role: Roles.ADMIN,
                });

                const tenantData = {
                    name: 'jit',
                    address: ' ',
                };

                //Action
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const response = await request(app)
                    .post('/api/v1/web/auth/tenants')
                    .set('Cookie', [`accessToken=${adminToken}`])
                    .send(tenantData);

                //Asserts
                expect(response.statusCode).toBe(400);
            });
        });
    });

    describe('Sanitizing Fields', () => {
        it('Should return 201 if tenant name starting with space', async () => {
            //Arrenge
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            const tenantData = {
                name: ' jit',
                address: 'puri',
            };

            //Action
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .post('/api/v1/web/auth/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            //Asserts
            expect(response.statusCode).toBe(201);
        });

        it('Should return 201 if tenant name ending with space', async () => {
            //Arrenge
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            const tenantData = {
                name: 'jit ',
                address: 'puri',
            };

            //Action
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .post('/api/v1/web/auth/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            //Asserts
            expect(response.statusCode).toBe(201);
        });

        it('Should return 201 if tenant address contain space both side', async () => {
            //Arrenge
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            const tenantData = {
                name: ' jit ',
                address: 'puri',
            };

            //Action
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .post('/api/v1/web/auth/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            //Asserts
            expect(response.statusCode).toBe(201);
        });

        it('Should return 201 if tenant address starting with space', async () => {
            //Arrenge
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            const tenantData = {
                name: 'jit',
                address: ' puri',
            };

            //Action
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .post('/api/v1/web/auth/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            //Asserts
            expect(response.statusCode).toBe(201);
        });

        it('Should return 201 if tenant address ending with space', async () => {
            //Arrenge
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            const tenantData = {
                name: 'jit',
                address: 'puri ',
            };

            //Action
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .post('/api/v1/web/auth/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            //Asserts
            expect(response.statusCode).toBe(201);
        });

        it('Should return 201 if tenant address contain space both side', async () => {
            //Arrenge
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            const tenantData = {
                name: 'jit',
                address: ' puri ',
            };

            //Action
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app)
                .post('/api/v1/web/auth/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            //Asserts
            expect(response.statusCode).toBe(201);
        });
    });
});
