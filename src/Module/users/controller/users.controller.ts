import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from 'src/Module/users/service/users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UserListResponseDto, PaginatedUsersResponseDto } from '../dto/users.dto';
import { UserPaginationRequestDto } from 'src/Module/users/dto/user-pagination.dto';
import { JwtAuthGuard } from 'src/Module/auth/guards/jwt-auth.guard';
import { ResponseHelper } from 'src/components/http/response-helper';
import { ResponseCode } from 'src/components/enums/response-code.enum';
import { ErrorHandlerHelper } from 'src/components/helpers/error-handler.helper';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('paginated')
  @ApiOperation({ summary: 'Get paginated users' })
  @ApiBody({ 
    type: UserPaginationRequestDto,
    examples: UserPaginationRequestDto.getExamples()
  })
  @ApiResponse({ status: 200, description: 'Success', type: PaginatedUsersResponseDto })
  @ApiBearerAuth()
  async getPaginatedUsers(
    @Body() paginationDto: UserPaginationRequestDto,
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
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Success', type: [UserResponseDto] })
  @ApiBearerAuth()
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }
    
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Success', type: UserResponseDto })
  @ApiBearerAuth()
  async findById(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created', type: UserResponseDto })
  @ApiBearerAuth()
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated', type: UserResponseDto })
  @ApiBearerAuth()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiBearerAuth()
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.usersService.delete(id);
  }
}
