import { Injectable } from '@nestjs/common';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { User } from './user.interfice/user.interface';

@Injectable()
export class UsersService {
  constructor(private readonly appwriteService: AppwriteService) {}

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    age?: number;
  }): Promise<void> {
    try {

     const collectionName = 'users';
      await this.appwriteService.saveData( userData, collectionName);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async getUserData(userId: string): Promise<User | null> {
    try {
      const user = await this.appwriteService.getData<User>('users', userId);
      
      // Si no se encuentra el usuario, devolver null
      if (!user) {
        return null;
      }

      return user; // Devolver el usuario si se encuentra
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }
  
  async getAllUsers(): Promise<any[]> {
    try {
      const users = await this.appwriteService.getAllData('users');
      return users;
    } catch (error) {
      throw new Error('Error fetching users');
    }
  }
  
  async uploadFile(
    file: Express.Multer.File,
    fileName: string,
    mimeType: string,
    bucketName = 'productos'
  ) {
    try {
      // Llamamos al método del servicio global para subir el archivo
      const response = await this.appwriteService.uploadFile(bucketName,file, fileName, mimeType);
      return response;  // Retorna la respuesta del archivo subido
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;  // Lanzamos el error si algo falla
    }
  }
  
}
