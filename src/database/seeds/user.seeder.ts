import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { User } from '../../Module/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
  ): Promise<any> {
    const userRepository = dataSource.getRepository(User);

    // Check if users already exist
    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
      console.log('Users already seeded');
      return;
    }

    // Create sample users
    const users = [
      {
        name: 'John Doe',
        email: 'john@gmail.com',
        password: await bcrypt.hash('password', 10),
      },
      {
        name: 'Jane Smith',
        email: 'jane@gmail.com',
        password: await bcrypt.hash('password', 10),
      },
      {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: await bcrypt.hash('password', 10),
      },
    ];

    for (const userData of users) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
    }

    console.log('Users seeded successfully');
  }
} 