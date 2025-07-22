import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from '../service/users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UserListResponseDto, PaginatedUsersResponseDto } from '../dto/users.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PaginationRequestDto } from 'src/components/dto/pagination.dto';
import { SwaggerExampleHelper } from 'src/components/swagger/example.helper';
import { ResponseHelper } from 'src/components/http/response-helper';
import { ResponseCode } from 'src/components/enums/response-code.enum';
import { ErrorHandlerHelper } from 'src/components/helpers/error-handler.helper';

@ApiTags('Users')
@Controller('users')
// @UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('paginated')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get paginated users with search functionality using request body',
    description: 'Get users with advanced filtering and pagination. Supports all PostgreSQL operators: equality, text search, comparisons, range operations, list operations, null checks, and pattern matching. Allowed search fields: id, name, email, createdAt, updatedAt.',
  })
  @ApiBody({
    type: PaginationRequestDto,
    description: 'Pagination request with dynamic filters for users. Supports all PostgreSQL operators.',
    ...SwaggerExampleHelper.getSwaggerExamples(
      'users',
      {
        id: {
          value: 1,
          description: 'User ID',
          fieldType: 'number',
        },
        name: {
          value: 'John Doe',
          description: 'User name',
          fieldType: 'string',
        },
        email: {
          value: 'john.doe@example.com',
          description: 'User email',
          fieldType: 'string',
        },
        createdAt: {
          value: '2025-01-01',
          description: 'Creation date',
          fieldType: 'date',
        },
      },
      true,
      {
        basic_pagination: {
          summary: 'Basic pagination',
          description: 'Simple pagination without filters',
          value: {
            page: 1,
            per_page: 10,
            sort_by: 'createdAt',
            sort_order: 'desc',
          },
        },
        filter_by_name: {
          summary: 'Filter by name',
          description: 'Get users with name containing specific text',
          value: {
            page: 1,
            per_page: 10,
            filters: [
              {
                search_by: 'name',
                filter_type: 'ilike',
                search_query: 'john',
              },
            ],
          },
        },
        filter_by_email: {
          summary: 'Filter by email domain',
          description: 'Get users with email from specific domain',
          value: {
            page: 1,
            per_page: 10,
            filters: [
              {
                search_by: 'email',
                filter_type: 'ends_with',
                search_query: '@example.com',
              },
            ],
          },
        },
        filter_by_date_range: {
          summary: 'Filter by creation date range',
          description: 'Get users created within date range',
          value: {
            page: 1,
            per_page: 10,
            filters: [
              {
                search_by: 'createdAt',
                filter_type: 'between',
                start_value: '2025-01-01',
                end_value: '2025-12-31',
              },
            ],
          },
        },
        multiple_filters: {
          summary: 'Multiple filters',
          description: 'Get users with multiple conditions (AND logic)',
          value: {
            page: 1,
            per_page: 10,
            filters: [
              {
                search_by: 'name',
                filter_type: 'ilike',
                search_query: 'john',
              },
              {
                search_by: 'email',
                filter_type: 'ilike',
                search_query: 'example.com',
              },
              {
                search_by: 'createdAt',
                filter_type: 'between',
                start_value: '2025-01-01',
                end_value: '2025-12-31',
              },
            ],
            sort_by: 'createdAt',
            sort_order: 'desc',
          },
        },
      },
    ),
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved paginated users',
    type: PaginatedUsersResponseDto,
    examples: {
      success: {
        summary: 'Success Response',
        value: {
          rows: [
            {
              id: 1,
              name: 'John Doe',
              email: 'john.doe@example.com',
              createdAt: '2025-01-15T10:30:00.000Z',
              updatedAt: '2025-01-15T10:30:00.000Z',
            },
            {
              id: 2,
              name: 'Jane Smith',
              email: 'jane.smith@example.com',
              createdAt: '2025-01-16T14:20:00.000Z',
              updatedAt: '2025-01-16T14:20:00.000Z',
            },
          ],
          count: 25,
          currentPage: 1,
          totalPages: 3,
          perPage: 10,
          from: 1,
          to: 10,
        },
      },
    },
  })
  @ApiBearerAuth()
  async getPaginatedUsers(
    @Body() paginationDto: PaginationRequestDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.usersService.findAllWithPagination(paginationDto);

      return ResponseHelper.paginateWithMeta(
        res,
        ResponseCode.SUCCESS,
        result.rows,
        {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          perPage: result.perPage,
          total: result.count,
          from: (result.currentPage - 1) * result.perPage + 1,
          to: Math.min(result.currentPage * result.perPage, result.count),
        },
      );
    } catch (error) {
      return ErrorHandlerHelper.handleError(error, res);
    }
  }
  
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users in the system. Returns basic user information including ID, name, email, and timestamps.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all users',
    type: [UserResponseDto],
    examples: {
      success: {
        summary: 'Success Response',
        value: [
          {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com',
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            createdAt: '2025-01-16T14:20:00.000Z',
            updatedAt: '2025-01-16T14:20:00.000Z',
          },
        ],
      },
    },
  })
  @ApiBearerAuth()
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }
    
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their unique identifier. Returns detailed user information including ID, name, email, and timestamps.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (integer)',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user',
    type: UserResponseDto,
    examples: {
      success: {
        summary: 'Success Response',
        value: {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    examples: {
      notFound: {
        summary: 'User Not Found',
        value: {
          statusCode: 404,
          message: 'User not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiBearerAuth()
  async findById(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Create a new user account with name, email, and password. The password will be hashed before storage. Returns the created user information (excluding password).',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User creation data',
    examples: {
      basic: {
        summary: 'Basic user creation',
        description: 'Create a user with basic information',
        value: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'password123',
        },
      },
      admin: {
        summary: 'Admin user creation',
        description: 'Create an admin user',
        value: {
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'adminPassword123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
    examples: {
      success: {
        summary: 'Success Response',
        value: {
          id: 3,
          name: 'John Doe',
          email: 'john.doe@example.com',
          createdAt: '2025-01-17T09:15:00.000Z',
          updatedAt: '2025-01-17T09:15:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
    examples: {
      validationError: {
        summary: 'Validation Error',
        value: {
          statusCode: 400,
          message: [
            'name should not be empty',
            'email must be an email',
            'password must be longer than or equal to 6 characters',
          ],
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - email already exists',
    examples: {
      emailExists: {
        summary: 'Email Already Exists',
        value: {
          statusCode: 409,
          message: 'Email already exists',
          error: 'Conflict',
        },
      },
    },
  })
  @ApiBearerAuth()
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user by ID',
    description: 'Update an existing user\'s information. Only provided fields will be updated. Password will be hashed if provided. Returns the updated user information.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID to update (integer)',
    example: 1,
    type: 'integer',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User update data (all fields optional)',
    examples: {
      nameOnly: {
        summary: 'Update name only',
        description: 'Update only the user\'s name',
        value: {
          name: 'John Updated',
        },
      },
      emailOnly: {
        summary: 'Update email only',
        description: 'Update only the user\'s email',
        value: {
          email: 'john.updated@example.com',
        },
      },
      passwordOnly: {
        summary: 'Update password only',
        description: 'Update only the user\'s password',
        value: {
          password: 'newPassword123',
        },
      },
      multipleFields: {
        summary: 'Update multiple fields',
        description: 'Update name, email, and password',
        value: {
          name: 'John Updated',
          email: 'john.updated@example.com',
          password: 'newPassword123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
    examples: {
      success: {
        summary: 'Success Response',
        value: {
          id: 1,
          name: 'John Updated',
          email: 'john.updated@example.com',
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-17T11:45:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    examples: {
      notFound: {
        summary: 'User Not Found',
        value: {
          statusCode: 404,
          message: 'User not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
    examples: {
      validationError: {
        summary: 'Validation Error',
        value: {
          statusCode: 400,
          message: [
            'email must be an email',
            'password must be longer than or equal to 6 characters',
          ],
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiBearerAuth()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete user by ID',
    description: 'Permanently delete a user from the system. This action cannot be undone. Returns a success message upon deletion.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID to delete (integer)',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    examples: {
      success: {
        summary: 'Success Response',
        value: {
          message: 'User deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    examples: {
      notFound: {
        summary: 'User Not Found',
        value: {
          statusCode: 404,
          message: 'User not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiBearerAuth()
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.usersService.delete(id);
  }
}
