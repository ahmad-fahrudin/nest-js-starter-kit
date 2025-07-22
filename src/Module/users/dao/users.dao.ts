import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, SelectQueryBuilder } from 'typeorm';
import { User } from 'src/database/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/users.dto';
import { PaginationRequestDto } from 'src/components/dto/pagination.dto';
import { PaginationHelper } from 'src/components/pagination/pagination.helper';

@Injectable()
export class UsersDao {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
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
    const result = await this.usersRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async existsByEmail(email: string, excludeId?: number): Promise<boolean> {
    const query = this.usersRepository.createQueryBuilder('user')
      .where('user.email = :email', { email });
    
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
