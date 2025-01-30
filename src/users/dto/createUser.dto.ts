import { IsNumber, IsString, MaxLength } from 'class-validator';

export class createuser {

  @IsString()
  @MaxLength(15, { message: 'The name must be a string and no longer than 15 characters.' })
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

 @IsNumber()
  age: number;

  @IsString()
  Id_rol: string
}
