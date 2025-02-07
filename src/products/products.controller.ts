import {
  Controller,
  Body,
  Post,
  UseGuards,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Permissions, Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesPermissionsGuard } from 'src/guards/roles-permissions.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @Roles('admin_level_2')
  @Permissions('create')
  @UseGuards(JwtAuthGuard, RolesPermissionsGuard)
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.createProduct(createProductDto, file);
  }

  @Get()
  @Roles('admin_level_2')
  @Permissions('read')
  @UseGuards(JwtAuthGuard, RolesPermissionsGuard)
  async getAllProducts() {
    return this.productsService.getAllProducts();
  }

  @Delete(':id')
  @Roles('admin_level_2')
  @Permissions('delete')
  @UseGuards(JwtAuthGuard, RolesPermissionsGuard)
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }
}
