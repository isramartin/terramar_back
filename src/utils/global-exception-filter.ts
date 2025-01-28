import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    NotFoundException,
  } from '@nestjs/common';
  import { ErrorType } from './interface/errorTipe.interface';
  
  @Catch(HttpException)
  export class GlobalExceptionFilter implements ExceptionFilter {
    errorsResponse(
      exception: HttpException,
      errors: ErrorType[],
    ): {
      code: number;
      success: boolean;
      data: { errors: any };
    } {
      console.log('errors in errorsResponse:', errors);
  
      // Mapea los errores y devuelve el formato adecuado
      const errorsList = errors
        .map((error) => {
          const messages = Array.isArray(error.message)
            ? error.message
            : [error.message];
  
          // Mapeamos el error y lo devolvemos en la estructura dinámica
          return messages.map((msg) => ({
            key: error.key, // key dinámica del servicio
            type: error.type, // type dinámica del servicio
            message: msg, // message dinámico del servicio
          }));
        })
        .flat();
  
      console.log('errorsList after flat:', errorsList);
  
      // Agrupamos los errores por clave
      const errorsObject = errorsList.reduce((acc, error) => {
        if (!acc[error.key]) {
          acc[error.key] = {
            type: error.type,
            message: [error.message], // Guardamos los mensajes en un array
          };
        } else {
          acc[error.key].message.push(error.message); // Si ya existe, agregamos el nuevo mensaje
        }
        return acc;
      }, {});
  
      // Devolvemos la respuesta con todos los errores
      return {
        code: this.getStatusCode(exception),
        success: false,
        data: {
          errors: errorsObject,
        },
      };
    }
  
    catch(exception: HttpException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
  
      const exceptionResponse = exception.getResponse() as any;
  
      console.log('exceptionResponse:', exceptionResponse); // Verifica la respuesta del error
  
      let errors: ErrorType[] = this.extractErrorsFromResponse(
        exceptionResponse,
        exception,
      );
  
      console.log('Extracted errors:', errors);
  
      const formattedResponse = this.errorsResponse(exception, errors);
  
      response.status(formattedResponse.code).json(formattedResponse);
    }
  
    private extractErrorsFromResponse(
      response: any,
      exception: HttpException,
    ): ErrorType[] {
      console.log('Response in extractErrorsFromResponse:', response);
  
      // Si el servicio devuelve un error con key, type y message
      if (
        response &&
        response['key'] &&
        response['type'] &&
        response['message']
      ) {
        return [
          {
            key: response['key'], // Usamos el 'key' enviado desde el servicio
            type: response['type'], // Usamos el 'type' enviado desde el servicio
            message: response['message'], // Usamos el 'message' enviado desde el servicio
          },
        ];
      }
  
      // Si no, seguimos con un valor por defecto
      return [
        {
          key: 'Bad_Request',
          type: 'validation_error',
          message:
            response?.['message'] || exception.message || 'An error occurred',
        },
      ];
    }
  
    private getStatusCode(exception: HttpException): number {
      if (exception instanceof NotFoundException) {
        return HttpStatus.NOT_FOUND;
      }
      return exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
  