import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('create')
  async saveUser(
    @Body() userData: { name: string; email: string; age?: number },
  ): Promise<{ message: string }> {
    try {
      // Llamamos al UserService para guardar el usuario
      await this.userService.createUser(userData);
      return { message: 'User saved successfully' };
    } catch (error) {
      return { message: 'Error saving user' };
    }
  }

  @Post('upload')  // Endpoint para subir un archivo
  @UseInterceptors(FileInterceptor('file'))  // Usamos el interceptor de Multer para procesar el archivo
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileName = file.originalname;  // Nombre original del archivo
    const mimeType = file.mimetype;  // Tipo MIME del archivo

    try {
      // Llamamos al servicio para subir el archivo
      const response = await this.userService.uploadFile(file, fileName, mimeType);
      return { message: 'File uploaded successfully', data: response };
    } catch (error) {
      return { message: 'Error uploading file', error: error.message };
    }
  }
}
