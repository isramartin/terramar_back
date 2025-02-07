import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly appwriteService: AppwriteService) {}

  async createProduct(
    createProductDto: CreateProductDto,
    file: Express.Multer.File,
  ) {
    try {
      let dataProduct;
      if (file) {
        const fileName = file.originalname;
        const mimeType = file.mimetype;

        const response = await this.appwriteService.uploadFile(
          'productos',
          file,
          fileName,
          mimeType,
        );
        dataProduct = {
          ...createProductDto,
          image: response.fileUrl,
        };
      }
      const response = await this.appwriteService.saveData(
        dataProduct,
        'products',
      );
      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating product: ' + error,
      );
    }
  }

  async getAllProducts() {
    try {
      const response = await this.appwriteService.getAllData('products');
      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error getting all products: ' + error,
      );
    }
  }

  async deleteProduct(id: string) {
    try {
      await this.appwriteService.deleteData(id.toString(), 'products');
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting product: ' + error,
      );
    }
  }
}
