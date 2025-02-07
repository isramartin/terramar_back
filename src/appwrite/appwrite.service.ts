import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Client, Databases, Storage } from 'appwrite';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import config from '../../appwrite.json';
import FormData from 'form-data';

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

  async saveData<T>(
    data: T,
    collectionName: string,
  ): Promise<T & { documentId: string }> {
    const documentId = uuidv4();

    const collectionMapping: Record<string, string> = {
      users: config.userCollectionId,
      perfil: 'perfilCollectionId',
      products: config.productsCollectionId,
      roles: config.rolesCollectionId,
    };

    const collectionId = collectionMapping[collectionName];

    if (!collectionId) {
      // Lanza un error si el nombre de la colección no es válido
      throw new HttpException(
        `Collection "${collectionName}" is not valid.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const metadata = { ...data, id: documentId };

      await this.database.createDocument(
        this.databaseId,
        collectionId,
        documentId,
        metadata,
      );

      return { ...metadata, documentId };
    } catch (error) {
      // Aquí no lanzamos el error, solo lo pasamos al catch del servicio
      console.error('Error creating document:', error);
      throw error; // Propagamos el error para que lo maneje el servicio
    }
  }

  async getData<T>(
    collectionName: string,
    documentId: string,
  ): Promise<T | null> {
    console.log('Fetching document:', { collectionName, documentId }); // Depuración

    const collectionMapping: Record<string, string> = {
      users: config.userCollectionId,
      roles: config.rolesCollectionId,
    };

    const collectionId = collectionMapping[collectionName];

    if (!collectionId) {
      throw new Error(`Collection name "${collectionName}" is not valid.`);
    }

    console.log('Using collection ID:', collectionId); // Depuración

    try {
      const response = await this.database.getDocument(
        this.databaseId,
        collectionId,
        documentId,
      );

      console.log('Document retrieved successfully:', response); // Depuración

      return response as T;
    } catch (error) {
      console.error('Error retrieving document:', error); // Depuración
      if (error.code === 404) {
        throw new Error(
          `Document with ID "${documentId}" not found in collection "${collectionName}".`,
        );
      }
      throw error;
    }
  }

  async getAllData<T>(collectionName: string): Promise<T[]> {
    const collectionMapping: Record<string, string> = {
      users: config.userCollectionId,
      roles: config.rolesCollectionId,
      products: config.productsCollectionId,
      // Otros mapeos de colecciones
    };

    const collectionId = collectionMapping[collectionName];

    if (!collectionId) {
      throw new Error(`Collection name "${collectionName}" is not valid.`);
    }

    try {
      // Asegúrate de que esta sea la llamada correcta para obtener todos los documentos
      const response = await this.database.listDocuments(
        this.databaseId, // Usar el databaseId desde appwrite.json
        collectionId, // Usar el collectionId obtenido del mapeo
      );

      return response.documents as T[];
    } catch (error) {
      console.error('Error retrieving documents:', error);
      throw error;
    }
  }

  async updateData<T>(
    documentId: string,
    data: T,
    collectionName: string,
  ): Promise<void> {
    const collectionMapping: Record<string, string> = {
      users: config.userCollectionId, // Reemplaza con el verdadero ID de la colección
      perfil: 'perfilCollectionId', // Reemplaza con el verdadero ID de la colección
      productos: 'productosCollectionId', // Reemplaza con el verdadero ID de la colección
    };

    const collectionId = collectionMapping[collectionName];

    if (!collectionId) {
      throw new Error(`Collection name "${collectionName}" is not valid.`);
    }

    try {
      const response = await this.database.updateDocument(
        this.databaseId, // Tu ID de base de datos desde appwrite.json
        collectionId, // El ID de la colección correspondiente
        documentId, // ID del documento que deseas actualizar
        data, // Nuevos datos para actualizar
      );

      console.log('Document updated successfully:', response);
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  async deleteData(documentId: string, collectionName: string): Promise<void> {
    const collectionMapping: Record<string, string> = {
      users: config.userCollectionId,
      perfil: 'perfilCollectionId',
      productos: config.productsCollectionId,
    };

    const collectionId = collectionMapping[collectionName];

    if (!collectionId) {
      throw new Error(`Collection name "${collectionName}" is not valid.`);
    }

    try {
      const response = await this.database.deleteDocument(
        this.databaseId,
        collectionId,
        documentId,
      );
      console.log('Document deleted successfully:', response);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async uploadFile(
    bucketName: string,
    file: Express.Multer.File,
    fileName: string,
    mimeType: string,
  ) {
    if (!file) {
      throw new BadRequestException('no file uploaded');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('invalid file type');
    }

    const maxSize = 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('file is too large!');
    }

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

    const fileId = uuidv4();
    const extension = fileName.split('.').pop();
    const uniqueFileName = uuidv4().slice(0, 19) + '.' + extension;

    const form = new FormData();
    form.append('file', file.buffer, {
      filename: uniqueFileName,
      contentType: mimeType,
    });

    form.append('fileId', fileId);

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
        { headers },
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
