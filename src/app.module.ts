import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppwriteService } from './appwrite/appwrite.service';
import { AppwriteModule } from './appwrite/appwrite.module';
import { UsersModule } from './users/users.module';
import { GlobalExceptionFilter } from './utils/global-exception-filter';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [AppwriteModule, UsersModule],
  controllers: [AppController],
  providers: [AppService, AppwriteService,
    // {
    //   provide: APP_FILTER,
    //   useClass: GlobalExceptionFilter,
    // },

  ],
})
export class AppModule {}
