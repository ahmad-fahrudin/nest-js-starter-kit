import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    examples: {
      basic: { value: 'John Doe', description: 'Basic user name' },
      admin: { value: 'Admin User', description: 'Admin user name' },
    },
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    examples: {
      basic: { value: 'john.doe@example.com', description: 'Basic user email' },
      admin: { value: 'admin@example.com', description: 'Admin user email' },
    },
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password123',
    examples: {
      basic: { value: 'password123', description: 'Basic password' },
      secure: { value: 'SecurePassword123!', description: 'Secure password with special characters' },
    },
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'User full name (optional)',
    example: 'John Updated',
    required: false,
    examples: {
      simple: { value: 'John Updated', description: 'Simple name update' },
      formal: { value: 'Dr. John Smith', description: 'Formal name with title' },
    },
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'User email address (optional)',
    example: 'john.updated@example.com',
    required: false,
    examples: {
      personal: { value: 'john.personal@gmail.com', description: 'Personal email update' },
      work: { value: 'john.smith@company.com', description: 'Work email update' },
    },
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'User password (optional, minimum 6 characters)',
    example: 'newPassword123',
    required: false,
    examples: {
      simple: { value: 'newPassword123', description: 'Simple password update' },
      secure: { value: 'NewSecurePass123!', description: 'Secure password with special characters' },
    },
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: 1,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2025-01-15T10:30:00.000Z',
  })
  @IsString()
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2025-01-15T10:30:00.000Z',
  })
  @IsString()
  updatedAt: Date;
}

export class UserListResponseDto {
  users: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({
    description: 'Array of users',
    type: [UserResponseDto],
  })
  rows: UserResponseDto[];

  @ApiProperty({
    description: 'Total number of users',
    example: 100,
  })
  count: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  currentPage: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  perPage: number;

  @ApiProperty({
    description: 'Starting item number for current page',
    example: 1,
  })
  from: number;

  @ApiProperty({
    description: 'Ending item number for current page',
    example: 10,
  })
  to: number;
}
