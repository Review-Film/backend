import * as Joi from '@hapi/joi';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, User } from '../../entities/';
import { DatabaseModule } from '../database/database.module';
import { SeederService } from './seeder.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        // PostgresQL
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),

        // Port server
        PORT: Joi.number(),

        // JWT
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    SearchModule,
    TypeOrmModule.forFeature([User, Role]),
  ],
  providers: [SeederService, Logger],
})
export class SeederModule {}
