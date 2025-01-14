import { IsNumber, IsString } from 'class-validator';

export class createuser {

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

 @IsNumber()
  age: number;
}
