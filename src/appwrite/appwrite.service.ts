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
  }

  async saveData<T>(data: T, collectionName: string): Promise<void> {
    
    const documentId = uuidv4();

    const collectionMapping: Record<string, string> = {
      users: config.userCollectionId,
      perfil: 'perfilCollectionId', // Reemplaza con el verdadero ID de la colección
      productos: 'productosCollectionId', // Reemplaza con el verdadero ID de la colección
    };

    const collectionId = collectionMapping[collectionName];

    if (!collectionId) {
      throw new Error(`Collection name "${collectionName}" is not valid.`);
    }

    try {
      const response = await this.database.createDocument(
        this.databaseId, // Usar el databaseId desde appwrite.json
        collectionId, // Usar el collectionId desde appwrite.json
        documentId,
        data,
      );

      console.log('Document created successfully:', response);
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async getData<T>(collectionName: string, documentId: string): Promise<T | null> {
    // Mapeo de las colecciones con sus respectivos IDs
    const collectionMapping: Record<string, string> = {
      users: config.userCollectionId,
      perfil: 'perfilCollectionId', // Reemplaza con el verdadero ID de la colección
      productos: 'productosCollectionId', // Reemplaza con el verdadero ID de la colección
    };
  
    const collectionId = collectionMapping[collectionName];
  
    if (!collectionId) {
      throw new Error(`Collection name "${collectionName}" is not valid.`);
    }
  
    try {
      // Obtener el documento de la colección usando el ID del documento
      const response = await this.database.getDocument(
        this.databaseId, // Usar el databaseId desde appwrite.json
        collectionId,    // Usar el collectionId obtenido del mapeo
        documentId,      // El ID del documento a obtener
      );
  
      console.log('Document retrieved successfully:', response);
  
      return response as T; // Retorna los datos del documento
    } catch (error) {
      console.error('Error retrieving document:', error);
      throw error;
    }
  }
  
  async getAllData<T>(collectionName: string): Promise<T[]> {
    const collectionMapping: Record<string, string> = {
      users: config.userCollectionId,
      // Otros mapeos de colecciones
    };
  
    const collectionId = collectionMapping[collectionName];
  
    if (!collectionId) {
      throw new Error(`Collection name "${collectionName}" is not valid.`);
    }
  
    try {
      // Asegúrate de que esta sea la llamada correcta para obtener todos los documentos
      const response = await this.database.listDocuments(
        this.databaseId,   // Usar el databaseId desde appwrite.json
        collectionId,      // Usar el collectionId obtenido del mapeo
      );
  
      return response.documents as T[];
    } catch (error) {
      console.error('Error retrieving documents:', error);
      throw error;
    }
  }
  
  
  
  
  
  

  async uploadFile(
    bucketName: string, 
    file: Express.Multer.File,
    fileName: string,
    mimeType: string
  ) {

    const bucketMapping: Record<string, string> = {
      utils: config.utilsbucketId, 
      perfil: config.perfilbucketId, 
      productos: config.imegnesbucketId,

    };

    const bucketId = bucketMapping[bucketName];

    // Verificamos que el bucket esté mapeado
    if (!bucketId) {
      throw new Error(`El bucket '${bucketName}' no está configurado.`);
    }

    // Generamos un fileId único con uuidv4
    const fileId = uuidv4();

    // Crea el objeto FormData para enviar el archivo
    const form = new FormData();
    form.append('file', file.buffer, { filename: fileName, contentType: mimeType });
    form.append('fileId', fileId);

    // Configura los headers necesarios
    const headers = {
      ...form.getHeaders(),
      'X-Appwrite-Project': config.projectId, // Usando el projectId de appwrite.json
      'X-Appwrite-API-Key': config.apikey, // Usando la API key de appwrite.json
    };

    try {
      // Realiza la solicitud para subir el archivo
      const response = await axios.post(
        `${config.endpoint}/storage/buckets/${bucketId}/files`,
        form,
        { headers }
      );

      const fileIdFromResponse = response.data.$id;

      // Construye la URL del archivo
      const fileUrl = await this.getFileUrl(fileIdFromResponse, bucketId);

      return {
        fileId: fileIdFromResponse,
        fileUrl,
      };
    } catch (error) {
      console.error('Error al subir el archivo:', error.message);
      throw new Error('No se pudo subir el archivo');
    }
  }

  // Método para obtener la URL del archivo
  async getFileUrl(fileId: string, bucketId: string) {
    try {
      if (!fileId) {
        throw new Error('fileId es obligatorio');
      }

      const fileUrl = `${config.endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${config.projectId}&mode=admin`;

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
