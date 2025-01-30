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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './user.interfice/user.interface';
import { createuser } from './dto/createUser.dto';
import { Permissions, Roles } from 'src/decorators/roles.decorator';
import { RolesPermissionsGuard } from 'src/guards/roles-permissions.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Roles as RolesEnum, Permissions as PermissionsEnum} from '../constants/roles-permission';
import { read } from 'fs';

@Controller('users')

export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('create')
  @Roles('admin_level_1')
  @Permissions('create', "read")
  @UseGuards(JwtAuthGuard, RolesPermissionsGuard)
  // @Roles(RolesEnum.ADMIN_LEVEL_1)
  // @Permissions(PermissionsEnum.CREATE, PermissionsEnum.READ)
  async saveUser(@Body() userData: createuser): Promise<void> {
    return this.userService.createUser(userData);
  }

  @Get(':userId')
  @Roles('admin_level_3')
  @Permissions('create', "read")
  @UseGuards(JwtAuthGuard, RolesPermissionsGuard)
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
  @Roles('admin_level_1')
  @Permissions('update')
  @UseGuards(JwtAuthGuard, RolesPermissionsGuard)
  async updateUser(
    @Param('id') id: string, // El ID del documento que deseas actualizar
    @Body() data: any, // Los nuevos datos que deseas actualizar
  ) {
    try {
      await this.userService.updateUser(id, data); // Llamada al servicio para actualizar el documento
      return { message: 'User updated successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('delte/:id')
  async deleteUser(@Param('id') id: string) {
    try {
      await this.userService.deleteUser(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to delete user',
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
function errorResponse(arg0: { key: string; type: string; message: any }[]) {
  throw new Error('Function not implemented.');
}
