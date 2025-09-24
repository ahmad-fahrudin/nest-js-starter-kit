import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/Module/users/entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UserListResponseDto } from '../dto/users.dto';
import { UsersDao } from '../dao/users.dao';
import { PaginationRequestDto } from 'src/components/swagger/dto/pagination.dto';
import { PaginationHelper } from 'src/components/swagger/pagination/pagination.helper';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly allowedSearchFields = ['id', 'name', 'email', 'createdAt', 'updatedAt'];
  private readonly allowedSortFields = ['id', 'name', 'email', 'createdAt', 'updatedAt'];

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private usersDao: UsersDao,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersDao.findAll();
    return users.map(user => this.mapToResponseDto(user));
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.usersDao.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.mapToResponseDto(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersDao.findByEmail(email);
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if email already exists
    const existingUser = await this.usersDao.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = await this.usersDao.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.mapToResponseDto(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // Check if user exists
    const existingUser = await this.usersDao.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being updated and if it already exists
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.usersDao.existsByEmail(updateUserDto.email, id);
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password if it's being updated
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.usersDao.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapToResponseDto(updatedUser);
  }

  async delete(id: number): Promise<{ message: string }> {
    // Check if user exists
    const existingUser = await this.usersDao.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const deleted = await this.usersDao.delete(id);
    if (!deleted) {
      throw new BadRequestException('Failed to delete user');
    }

    return { message: 'User deleted successfully' };
  }

  async findAllWithPagination(paginationDto: PaginationRequestDto) {
    try {
      // Validate filters
      if (paginationDto.filters) {
        const errors = PaginationHelper.validateFilters(
          paginationDto.filters,
          this.allowedSearchFields,
        );
        if (errors.length > 0) {
          throw new BadRequestException(`Invalid filters: ${errors.join(', ')}`);
        }
      }

      // Get pagination limits
      const { limit, offset, page } = PaginationHelper.getPaginationLimits(paginationDto);

      // Build search query
      const searchQuery = paginationDto.filters || [];

      // Build order clause
      const sortField = paginationDto.sort_by || 'createdAt';
      const sortOrder = (paginationDto.sort_order || 'desc').toLowerCase();

      // Query with DAO
      const data = await this.usersDao.getUsersWithPagination(
        limit,
        offset,
        searchQuery,
        sortField,
        sortOrder,
      );

      // Map results to response DTO
      const rows = data.rows.map(user => this.mapToResponseDto(user));

      // Calculate metadata
      const meta = PaginationHelper.calculateMeta(data.count, page, limit);

      return {
        rows,
        count: data.count,
        ...meta,
        from: (meta.currentPage - 1) * meta.perPage + 1,
        to: Math.min(meta.currentPage * meta.perPage, data.count),
      };
    } catch (error) {
      console.error('Error in findAllWithPagination:', error);
      throw error;
    }
  }

  private mapToResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
} 