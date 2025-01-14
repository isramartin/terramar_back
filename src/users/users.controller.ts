import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './user.interfice/user.interface';
import { createuser } from './dto/createUser.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('create')
  async saveUser(
    @Body()
    userData: createuser
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

  @Put('update/:id')
  async updateUser(
    @Param('id') id: string, // El ID del documento que deseas actualizar
    @Body() data: any // Los nuevos datos que deseas actualizar
  ) {
    try {
      await this.userService.updateUser(id, data); // Llamada al servicio para actualizar el documento
      return { message: 'User updated successfully' };
    } catch (error) {
      throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('delte/:id')
  async deleteUser(@Param('id') id: string) {
    try {
      await this.userService.deleteUser(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
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
