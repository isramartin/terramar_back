import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  price: number;

  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  stock: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  subcategory: string;
}
