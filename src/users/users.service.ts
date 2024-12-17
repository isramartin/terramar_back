import { Injectable } from '@nestjs/common';
import { AppwriteService } from 'src/appwrite/appwrite.service';

@Injectable()
export class UsersService {
  constructor(private readonly appwriteService: AppwriteService) {}

  async createUser(userData: {
    name: string;
    email: string;
    age?: number;
  }): Promise<void> {
    try {
      await this.appwriteService.saveUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    fileName: string,
    mimeType: string,
  ) {
    try {
      // Llamamos al método del servicio global para subir el archivo
      const response = await this.appwriteService.uploadFile(file, fileName, mimeType);
      return response;  // Retorna la respuesta del archivo subido
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;  // Lanzamos el error si algo falla
    }
  }
  
}
