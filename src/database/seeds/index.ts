import { DataSource } from 'typeorm';
import { runSeeder, Seeder, SeederFactoryManager } from 'typeorm-extension';
import dataSource from '../ormconfig';
import UserSeeder from './user.seeder';

export default class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    await runSeeder(dataSource, UserSeeder);
  }
}

// Run the seeder
async function runSeeders() {
  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');
    
    const seeder = new MainSeeder();
    await seeder.run(dataSource, {} as SeederFactoryManager);
    
    console.log('Seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

runSeeders(); 