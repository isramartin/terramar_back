import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {

    constructor(private readonly userService: UsersService) {}

    @Post('create')
  async saveUser(@Body() userData: { name: string; email: string; age?: number }): Promise<{ message: string }> {
    try {
      // Llamamos al UserService para guardar el usuario
      await this.userService.createUser(userData);
      return { message: 'User saved successfully' };
    } catch (error) {
      return { message: 'Error saving user' };
    }
  }

}
