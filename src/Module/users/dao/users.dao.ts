import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from 'src/Module/users/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from 'src/Module/users/dto/users.dto';
import { PaginationHelper } from 'src/components/swagger/pagination/pagination.helper';

@Injectable()
export class UsersDao {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        deletedAt: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { 
        id,
        deletedAt: IsNull()
      } 
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { 
        email,
        deletedAt: IsNull()
      } 
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.usersRepository.update(id, {
      deletedAt: new Date()
    });
    return (result.affected ?? 0) > 0;
  }

  async existsByEmail(email: string, excludeId?: number): Promise<boolean> {
    const query = this.usersRepository.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .andWhere('user.deletedAt IS NULL');
    
    if (excludeId) {
      query.andWhere('user.id != :excludeId', { excludeId });
    }
    
    const count = await query.getCount();
    return count > 0;
  }

  async getUsersWithPagination(
    limit: number,
    offset: number,
    searchQuery: any,
    sortField: string,
    sortOrder: string,
  ): Promise<{ rows: User[]; count: number }> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Only include non-deleted users
    queryBuilder.where('user.deletedAt IS NULL');

    // Apply search filters
    if (searchQuery && searchQuery.length > 0) {
      PaginationHelper.buildWhereClause(
        queryBuilder,
        { filters: searchQuery },
        ['id', 'name', 'email', 'createdAt', 'updatedAt'],
        'user'
      );
    }

    // Apply sorting
    if (sortField && sortOrder) {
      const normalizedSortOrder = sortOrder.toUpperCase() as 'ASC' | 'DESC';
      queryBuilder.orderBy(`user.${sortField}`, normalizedSortOrder);
    } else {
      queryBuilder.orderBy('user.createdAt', 'DESC');
    }

    // Apply pagination
    queryBuilder.skip(offset).take(limit);

    const [rows, count] = await queryBuilder.getManyAndCount();

    return { rows, count };
  }
}
