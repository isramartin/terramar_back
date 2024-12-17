import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppwriteService } from './appwrite/appwrite.service';
import { AppwriteModule } from './appwrite/appwrite.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AppwriteModule, UsersModule],
  controllers: [AppController],
  providers: [AppService, AppwriteService],
})
export class AppModule {}
