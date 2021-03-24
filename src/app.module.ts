import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TaskModule } from './task/task.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { formatError, GraphQLError } from 'graphql';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      context: ({ req }) => ({ req }),
      formatError: (error: GraphQLError) => {
        return {
          message: error.message,
          statusCode: error.extensions.exception.response.statusCode,
          errorCode: error.extensions.exception.response.error,
        };
      },
    }),
    TaskModule,
    AuthModule,
  ],
})
export class AppModule {}

// new file in common
// class graphopt.
// grpahql option factory
// fucntion - gql module option
// parameters all (for root wali )
// useclass in module
//
