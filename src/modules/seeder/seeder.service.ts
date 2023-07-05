import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

// Entity
import { Role, User } from '../../entities';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeederService {
  constructor(
    private readonly logger: Logger,

    @InjectRepository(Role)
    private roleRepo: Repository<Role>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    private configService: ConfigService,
  ) {}

  async seed() {
    if (this.configService.get('NODE_ENV') === 'production') {
      await this.seedAdmin();
    } else {
      await this.clearDatabase();
      await this.seedUsers();
    }
  }

  async clearDatabase() {
    // Delete all role
    const deleteRole = this.roleRepo.delete({});
    // Detele all user
    const deleteUser = this.userRepo.delete({});

    await Promise.all([deleteRole, deleteUser]);
  }

  async seedAdmin() {
    try {
      // Create new role
      const roleAdmin = new Role();
      roleAdmin.name = 'admin';
      await this.roleRepo.save(roleAdmin);
      this.logger.debug('Successfuly completed seeding roles...');

      // Create new user
      const email = this.configService.get('ADMIN_EMAIL');
      const password = this.configService.get('ADMIN_PASSWORD');
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User();

      user.name = 'Admin';
      user.email = email;
      user.roles = [roleAdmin];
      user.password = hashedPassword;

      await this.userRepo.save(user);

      this.logger.debug('Successfuly completed seeding users...');
    } catch (error) {
      console.log(error);
      this.logger.error('Failed seeding users...');
    }
  }

  async seedUsers(): Promise<User[]> {
    try {
      // Create new role
      const role1 = new Role();
      role1.name = 'admin';
      const role2 = new Role();
      role2.name = 'member';
      const role3 = new Role();
      role3.name = 'systemadmin';
      const roles = await Promise.all([
        this.roleRepo.save(role1),
        this.roleRepo.save(role2),
        this.roleRepo.save(role3),
      ]);
      this.logger.debug('Successfuly completed seeding roles...');

      // Create new user
      let users = [];
      const hashedPassword = await bcrypt.hash('123456', 10);
      roles.forEach((role) => {
        const user = new User();

        user.name = faker.name.findName();
        user.email = faker.internet.email();
        user.roles = [role];
        user.password = hashedPassword;

        users.push(this.userRepo.save(user));
      });

      users = await Promise.all(users);
      this.logger.debug('Successfuly completed seeding users...');

      return users;
    } catch (error) {
      console.log(error);
      this.logger.error('Failed seeding users...');
    }
  }
}
