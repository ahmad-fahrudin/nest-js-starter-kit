import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { UsersService } from 'src/Module/users/service/users.service';
import { UsersController } from 'src/Module/users/controller/users.controller';
import { UsersDao } from 'src/Module/users/dao/users.dao';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersDao],
  exports: [UsersService],
})
export class UsersModule {}
