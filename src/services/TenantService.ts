import { Repository } from 'typeorm';
import { Tenant } from '../entity/Tenant';
import { ITenant, TenantQueryParams } from '../types/tenantType';

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}

    async create(tenantData: ITenant) {
        return await this.tenantRepository.save(tenantData);
    }

    async getAll(validateQuery: TenantQueryParams) {
        const queryBuilder = this.tenantRepository.createQueryBuilder();
        const result = await queryBuilder
            .skip((validateQuery.currentPage - 1) * validateQuery.perPage)
            .take(validateQuery.perPage)
            .getManyAndCount();

        return result;
    }

    async getById(id: number) {
        return await this.tenantRepository.findOneBy({ id });
    }

    async deleteById(id: number) {
        return await this.tenantRepository.softDelete({ id });
    }

    async updateById(id: number, name: string, address: string) {
        return await this.tenantRepository.update({ id }, { name, address });
    }
}
