import { Brackets, Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData } from '../types/auth';
import createHttpError from 'http-errors';
import { Roles } from '../constants';
import bcrypt from 'bcrypt';
import { UserQueryParams, UserUpdateData } from '../types/user';
import { Tenant } from '../entity/Tenant';

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
    }: UserData) {
        const existUser = await this.userRepository.findOne({
            where: { email: email },
        });

        if (existUser) {
            const err = createHttpError(400, 'Email is already exist');
            throw err;
        }
        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(password, saltRound);
        const user = await this.userRepository.save({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role ?? Roles.CUSTOMER,
            tenant: tenantId ? { id: tenantId } : undefined,
        });
        return user;
    }

    async findByEmail(email: string) {
        return await this.userRepository.findOne({
            where: { email: email },
            select: [
                'id',
                'firstName',
                'lastName',
                'email',
                'password',
                'role',
            ],
        });
    }

    async getAll(validatedQuery: UserQueryParams): Promise<[User[], number]> {
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        if (validatedQuery.q) {
            const searchTerm = `%${validatedQuery.q}%`;
            queryBuilder.where(
                new Brackets((qb) => {
                    qb.where(
                        "CONCAT(user.firstName, ' ', user.lastName) ILike :q",
                        { q: searchTerm },
                    ).orWhere('user.email ILike :q', { q: searchTerm });
                }),
            );
        }
        if (validatedQuery.role) {
            queryBuilder.andWhere('user.role = :role', {
                role: validatedQuery.role,
            });
        }
        const result = await queryBuilder
            .leftJoinAndSelect('user.tenant', 'tenant')
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .orderBy('user.id', 'DESC')
            .getManyAndCount();

        return result;
    }

    async findById(id: number) {
        return await this.userRepository.findOne({
            where: { id },
            relations: ['tenant'],
        });
    }

    async deleteById(id: number) {
        return await this.userRepository.softDelete({ id });
    }

    async updateById(id: number, data: UserUpdateData) {
        const userUpdate = await this.userRepository.findOne({
            where: { id },
            relations: ['tenant'],
        });

        if (!userUpdate) {
            throw new Error(`User with ID ${id} not found`);
        }

        userUpdate.firstName = data.firstName;
        userUpdate.lastName = data.lastName;
        userUpdate.email = data.email;
        userUpdate.role = data.role;
        userUpdate.tenant = { id: data.tenantId } as Tenant;

        await this.userRepository.save(userUpdate);
        return userUpdate;
    }
}
