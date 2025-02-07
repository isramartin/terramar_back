import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { ProductsController } from './products.controller';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, AppwriteService],
  exports: [ProductsService],
})
export class ProductsModule {}
