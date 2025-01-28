import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { User } from './user.interfice/user.interface';
import { createuser } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { ErrorType } from 'src/utils/interface/errorTipe.interface';
import { GlobalExceptionFilter } from 'src/utils/global-exception-filter';
import { errorsResponse } from 'src/utils/errorResponse';

@Injectable()
export class UsersService {
  constructor(private readonly appwriteService: AppwriteService) {}

  async createUser(createUserDto: createuser): Promise<any> {
    const { email } = createUserDto;

    try {
      // Verificar si el email ya está registrado
      const existingUser: User[] =
        await this.appwriteService.getAllData('users');

      const existingEmails = existingUser.map((user) => user.email);

      console.log('Existing emails:', existingEmails);
      console.log('existingUser', existingUser);

      if (existingEmails.includes(email)) {
        return errorsResponse([
          {
            key: 'User_Saved',
            type: 'validation_error',
            message: `El correo electrónico ${email} ya está registrado.`,
          },
        ]);
      }
      await this.appwriteService.saveData(createUserDto, 'users');
      return {
        code: HttpStatus.CREATED,
        success: true,
        message: 'User created successfully',
      };
    } catch (error) {
      console.error('Error during user creation:', error);
      // Si el error es una BadRequestException, lo lanzamos de nuevo
      if (error instanceof BadRequestException) {
        return errorsResponse([
          {
            key: 'user_creation_error',
            type: 'general_error',
            message:
              error.message ||
              'Ocurrió un error inesperado al crear el usuario.',
          },
        ]);
      }
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

  async updateUser(id: string, userData: UpdateUserDto): Promise<void> {
    try {
      const collectionName = 'users';
      await this.appwriteService.updateData(id, userData, collectionName);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const collectionName = 'users';
      await this.appwriteService.deleteData(userId, collectionName);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    fileName: string,
    mimeType: string,
    bucketName = 'productos',
  ) {
    try {
      // Llamamos al método del servicio global para subir el archivo
      const response = await this.appwriteService.uploadFile(
        bucketName,
        file,
        fileName,
        mimeType,
      );
      return response; // Retorna la respuesta del archivo subido
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error; // Lanzamos el error si algo falla
    }
  }
}
