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
import { errorsResponse } from 'src/utils/errorResponse';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly appwriteService: AppwriteService) {}

  async getRoleById(roleId: string): Promise<Roles | null> {
    try {
      console.log('Buscando rol con ID:', roleId); // Depuración

      // Obtener el rol usando el servicio de Appwrite
      const role = await this.appwriteService.getData<Roles>('roles', roleId);

      // Si no se encuentra el rol, devolver null
      if (!role) {
        console.log('Rol no encontrado'); // Depuración
        return null;
      }

      console.log('Rol encontrado:', role);
      return role;
    } catch (error) {
      console.error('Error al obtener el rol:', error); // Depuración
      throw new Error(`Error al obtener el rol: ${error.message}`);
    }
  }

  async getRole(id: string): Promise<any> {
    try {
      const roles = await this.appwriteService.getAllData<Roles>('roles');

      return roles;
    } catch (error) {
      console.error('Error al obtener el rol:', error); // Depuración
      throw new Error(`Error al obtener el rol: ${error.message}`);
    }
  }

  async createUser(createUserDto: createuser): Promise<any> {
    const { email, password, Id_rol } = createUserDto;

    try {
      // Verificar si el email ya está registrado
      const existingUser: User[] =
        await this.appwriteService.getAllData('users');
      const existingEmails = existingUser.map((user) => user.email);

      if (existingEmails.includes(email)) {
        return errorsResponse([
          {
            key: 'User_Saved',
            type: 'validation_error',
            message: `El correo electrónico ${email} ya está registrado.`,
          },
        ]);
      }

      // 🔑 Hashear la contraseña antes de guardarla
      const hashedPassword = await bcrypt.hash(password, 10);

      // Obtener el rol correspondiente al Id_rol
      let role: Roles;
      try {
        role = await this.getRoleById(Id_rol);
      } catch (error) {
        return errorsResponse([
          {
            key: 'Id_rol',
            type: 'invalid',
            message: `El rol con ID ${Id_rol} no existe.`,
          },
        ]);
      }

      // Preparar los datos del usuario con el rol y permisos asignados
      const userData = {
        ...createUserDto,
        password: hashedPassword, // Guardar contraseña encriptada
        // roles: [role.name], // Asignar el nombre del rol
        // permisos: role.permissions, // Asignar los permisos del rol
        Id_rol: role.id, // Asignar el ID del rol (opcional)
      };

      // Guardar datos en Appwrite
      const savedUser = await this.appwriteService.saveData(userData, 'users');

      console.log('savedUser', savedUser);

      return {
        code: HttpStatus.CREATED,
        success: true,
        message: 'User created successfully',
        data: {
          userId: savedUser.documentId,
          // roles: userData.roles,
          // permisos: userData.permisos,
        },
      };
    } catch (error) {
      console.error('Error during user creation:', error);
      return errorsResponse([
        {
          key: 'user_creation_error',
          type: 'general_error',
          message:
            error.message || 'Ocurrió un error inesperado al crear el usuario.',
        },
      ]);
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

  async findByEmail(email: string): Promise<User | undefined> {
    const existingUsers: User[] =
      await this.appwriteService.getAllData('users');

    // Encuentra el usuario con el correo proporcionado
    const user = existingUsers.find((user) => user.email === email);

    return user;
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
    bucketName: string,
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
