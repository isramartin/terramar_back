import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { AppwriteService } from './appwrite.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express'; // Asegúrate de que esto esté importado

@Controller('appwrite')
export class AppwriteController {
  constructor(private readonly appwriteService: AppwriteService) {}

  //   @Post('create')
  //   async createDocument(
  //     @Body('databaseId') databaseId: string,
  //     @Body('collectionId') collectionId: string,
  //     @Body('documentId') documentId: string, // Usa 'unique()' para IDs automáticos
  //     @Body('data') data: any,
  //   ) {
  //     return this.appwriteService.createDocument(
  //       databaseId,
  //     //   collectionId,
  //     //   documentId,
  //     //   data,
  //     );
  //   }

  //   @Get(':databaseId/:collectionId')
  //   async listDocuments(
  //     @Param('databaseId') databaseId: string,
  //     @Param('collectionId') collectionId: string,
  //   ) {
  //     return this.appwriteService.listDocuments(databaseId, collectionId);
  //   }

  //   @Get(':databaseId/:collectionId/:documentId')
  //   async getDocument(
  //     @Param('databaseId') databaseId: string,
  //     @Param('collectionId') collectionId: string,
  //     @Param('documentId') documentId: string,
  //   ) {
  //     return this.appwriteService.getDocument(
  //       databaseId,
  //       collectionId,
  //       documentId,
  //     );
  //   }

  //   @Patch('update')
  //   async updateDocument(
  //     @Body('databaseId') databaseId: string,
  //     @Body('collectionId') collectionId: string,
  //     @Body('documentId') documentId: string,
  //     @Body('data') data: any,
  //   ) {
  //     return this.appwriteService.updateDocument(
  //       databaseId,
  //       collectionId,
  //       documentId,
  //       data,
  //     );
  //   }

  //   @Delete(':databaseId/:collectionId/:documentId')
  //   async deleteDocument(
  //     @Param('databaseId') databaseId: string,
  //     @Param('collectionId') collectionId: string,
  //     @Param('documentId') documentId: string,
  //   ) {
  //     return this.appwriteService.deleteDocument(
  //       databaseId,
  //       collectionId,
  //       documentId,
  //     );
  //   }

  //   @Post('upload')
  //   @UseInterceptors(FileInterceptor('file')) // 'file' es el campo de formulario en el cliente
  //   async uploadFile(
  //     @Body('fileId') fileId: string, // Aquí obtenemos el fileId desde el cuerpo de la solicitud
  //     @UploadedFile() file: Express.Multer.File, // El archivo cargado
  //   ) {
  //     const fileName = file.originalname;
  //     const mimeType = file.mimetype;
  //     return this.appwriteService.uploadFile(file, fileId, fileName, mimeType);
  //   }
}
