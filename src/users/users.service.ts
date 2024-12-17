import { Injectable } from '@nestjs/common';
import { AppwriteService } from 'src/appwrite/appwrite.service';

@Injectable()
export class UsersService {

    constructor(private readonly appwriteService: AppwriteService) {}

    async createUser(userData: { name: string; email: string; age?: number }): Promise<void> {
        try {
          
          await this.appwriteService.saveUser(userData);
        } catch (error) {
          console.error('Error saving user:', error);
          throw error;
        }
      }

}
