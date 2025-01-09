import { Injectable } from '@nestjs/common';
import { Client, Databases, Storage, AppwriteException } from 'appwrite';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import config from '../../appwrite.json';
import FormData from 'form-data';
import * as fs from 'fs';
import { createReadStream } from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class AppwriteService {
  private client: Client;
  private database: Databases;
  private databaseId: string;
  private collectionId: string;
  private storage: Storage;

  constructor() {
    this.client = new Client();

    this.client.setEndpoint(config.endpoint).setProject(config.projectId);

    this.database = new Databases(this.client);

    this.storage = new Storage(this.client);

    this.databaseId = config.databaseId;
    this.collectionId = config.userCollectionId;
  }

  async saveUser<T>(data: T): Promise<void> {
    const documentId = uuidv4();

    try {
      const response = await this.database.createDocument(
        this.databaseId, // Usar el databaseId desde appwrite.json
        this.collectionId, // Usar el collectionId desde appwrite.json
        documentId,
        data,
      );

      console.log('Document created successfully:', response);
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async  uploadFile(
    file: Express.Multer.File,
    fileName: string,
    mimeType: string,
  ) {
    const bucketId = config.utilsbucketId;  // Usamos el bucketId de appwrite.json
  
    // Generamos un fileId único con uuidv4 (esto no es estrictamente necesario, pero puedes usarlo si lo prefieres)
    const fileId = uuidv4();
  
    // Crea el objeto FormData para enviar el archivo
    const form = new FormData();
    form.append('file', file.buffer, {
      filename: fileName,
      contentType: mimeType,
    });
    form.append('fileId', fileId);
  
    // Establece los headers necesarios
    const headers = {
      ...form.getHeaders(),
      'X-Appwrite-Project': config.projectId,  // Usando el projectId de appwrite.json
      'X-Appwrite-API-Key': config.apikey,  // Usando la API key de appwrite.json
    };
  
    try {
      // Realiza la solicitud para subir el archivo
      const response = await axios.post(
        `${config.endpoint}/storage/buckets/${bucketId}/files`,
        form,
        { headers },
      );
      console.log('Archivo subido:', response.data);
  
      // Obtener la URL del archivo usando el fileId que devuelve Appwrite
      const fileIdFromResponse = response.data.$id;
  
      // Ahora obtienes la URL para acceder al archivo
      const fileUrl = await this.getFileUrl(fileIdFromResponse);
  
      console.log('URL del archivo:', fileUrl);
      
      return {
        fileId: fileIdFromResponse,
        fileUrl,
      };
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      throw error;
    }
  }
  
  async getFileUrl(fileId: string) {
    try {
      // Verifica que el fileId no esté vacío
      if (!fileId) {
        throw new Error('fileId es obligatorio');
      }
  
      // Genera manualmente la URL para visualizar el archivo
      const fileUrl = `${config.endpoint}/storage/buckets/${config.utilsbucketId}/files/${fileId}/view?project=${config.projectId}&mode=admin`;
  
      // Realiza una solicitud HEAD para verificar si la URL es válida
      const response = await axios.head(fileUrl, {
        headers: {
          'X-Appwrite-Project': config.projectId,
          'X-Appwrite-API-Key': config.apikey,
        },
      });
  
      if (response.status === 200) {
        return fileUrl; // Si la respuesta es 200, la URL es válida
      }
  
      throw new Error('No se pudo validar la URL del archivo');
    } catch (error) {
      console.error('Error al obtener la URL del archivo:', error);
      throw error;
    }
  }
}
