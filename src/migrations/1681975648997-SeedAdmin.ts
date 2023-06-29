import { MigrationInterface, QueryRunner } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';

export class SeedData1637739544927 implements MigrationInterface {
  private adminEmail: string;
  private adminPassword: string;

  constructor() {
    config();

    const configService = new ConfigService();

    this.adminEmail = configService.get('ADMIN_EMAIL');
    this.adminPassword = configService.get('ADMIN_PASSWORD');
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert roles
    await queryRunner.query(
      `INSERT INTO public."role" ("name") VALUES ('admin')`,
    );

    // Insert users
    const hashedPassword = await bcrypt.hash(this.adminPassword, 10);
    await queryRunner.query(
      `INSERT INTO public."user" ("email", "name", "password") VALUES ('${this.adminEmail}', 'admin123', '${hashedPassword}')`,
    );

    // Get the admin role ID
    const adminRole = await queryRunner.query(
      `SELECT id FROM public."role" WHERE name = 'admin'`,
    );
    // Get the user ID
    const user = await queryRunner.query(
      `SELECT id FROM public."user" WHERE email = 'admin@gmail.com'`,
    );

    // Insert user_role
    await queryRunner.query(
      `INSERT INTO public."user_role" ("user", "role") VALUES ('${user[0].id}', '${adminRole[0].id}')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete roles and users
    await queryRunner.query(`DELETE FROM public."user"`);
    await queryRunner.query(`DELETE FROM public."role"`);
  }
}
