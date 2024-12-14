import { Injectable } from '@nestjs/common';
import { Client, Databases, Storage, AppwriteException } from 'appwrite';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { createReadStream } from 'fs'; 
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class AppwriteService {
  private client: Client;
  private database: Databases;
  private storage: Storage;

  constructor() {
    this.client = new Client();

    this.client
      .setEndpoint('https://cloud.appwrite.io/v1') // Cambia a tu endpoint de Appwrite
      .setProject('670e1fc7001519b1d314'); // Reemplaza con tu ID de proyecto

    this.database = new Databases(this.client);
    // Inicialización del servicio de Storage
    this.storage = new Storage(this.client);
  }

  async createDocument<T>(
    databaseId: string,
    collectionId: string,
    documentId: string, // Usa 'unique()' para IDs automáticos
    data: T,
  ) {
    return this.database.createDocument(
      databaseId,
      collectionId,
      documentId,
      data,
    );
  }

  async listDocuments(databaseId: string, collectionId: string) {
    return this.database.listDocuments(databaseId, collectionId);
  }

  async getDocument(
    databaseId: string,
    collectionId: string,
    documentId: string,
  ) {
    return this.database.getDocument(databaseId, collectionId, documentId);
  }

  async updateDocument<T>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: Partial<T>,
  ) {
    return this.database.updateDocument(
      databaseId,
      collectionId,
      documentId,
      data,
    );
  }

  async deleteDocument(
    databaseId: string,
    collectionId: string,
    documentId: string,
  ) {
    return this.database.deleteDocument(databaseId, collectionId, documentId);
  }

  async uploadFile(file: Express.Multer.File, fileId: string, fileName: string, mimeType: string) {
    const client = new Client();
    client.setEndpoint('https://cloud.appwrite.io/v1') // Cambia por tu endpoint de Appwrite
      .setProject('670e1fc7001519b1d314'); // Cambia por tu ID de proyecto

    const storage = new Storage(client);
    const bucketId = '672e727200347a0510fa'; // Cambia con el ID de tu bucket

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
      'X-Appwrite-Project': '670e1fc7001519b1d314', // Tu ID de proyecto de Appwrite
      'X-Appwrite-API-Key': 'standard_e641ea0efdc662fddec120f16c6f7bd509973f6c15b8371bee12b63db017b26b6a2abf62b5cbadfd98eb2cf775fc39e9e602378e26ebffdc739cb591ebad3aed69810ed3a1d0ae91123b6f4c2fba54f6de75f8133244081017523dadc3c0d48ee9d5281f2ca5c8e49b83f17db240580ad785c1a5893eaea150bd37fc49140c9a', // Tu clave API de Appwrite
    };

    try {
      // Realiza la solicitud para subir el archivo
      const response = await axios.post(
        `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files`,
        form,
        { headers }
      );
      console.log('Archivo subido:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      throw error;
    }
  }
}