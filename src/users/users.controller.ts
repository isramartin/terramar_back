import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './user.interfice/user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('create')
  async saveUser(
    @Body()
    userData: {
      name: string;
      email: string;
      password: string;
      age?: number;
    },
  ): Promise<{ message: string }> {
    try {
      // Llamamos al UserService para guardar el usuario
      await this.userService.createUser(userData);
      return { message: 'User saved successfully' };
    } catch (error) {
      return { message: 'Error saving user' };
    }
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: string): Promise<User | null> {
    try {
      const user = await this.userService.getUserData(userId);

      // if (!user) {
      //   return null; // Si el usuario no existe, devolvemos null
      // }

      return user; // Devolvemos el usuario si se encuentra
    } catch (error) {
      console.error('Error fetching user in controller:', error);
      throw error;
    }
  }

  @Get()
  async getAllUsers() {
    try {
      const users = await this.userService.getAllUsers();
      return users;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('upload') // Endpoint para subir un archivo
  @UseInterceptors(FileInterceptor('file')) // Usamos el interceptor de Multer para procesar el archivo
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileName = file.originalname; // Nombre original del archivo
    const mimeType = file.mimetype; // Tipo MIME del archivo

    try {
      // Llamamos al servicio para subir el archivo
      const response = await this.userService.uploadFile(
        file,
        fileName,
        mimeType,
      );
      return { message: 'File uploaded successfully', data: response };
    } catch (error) {
      return { message: 'Error uploading file', error: error.message };
    }
  }
}
