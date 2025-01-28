import { ArgumentMetadata, ValidationPipe, BadRequestException } from '@nestjs/common';

export class CustomValidationPipe extends ValidationPipe {
  createExceptionFactory() {
    return (validationErrors = []) => {
      const errors = validationErrors.map((error) => ({
        key: error.property, // El nombre del campo que falló
        type: 'validation_error', // Tipo de error
        message: Object.values(error.constraints).join(', '), // Mensajes de error combinados
      }));
      throw new BadRequestException(errors);
    };
  }
}
