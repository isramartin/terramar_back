import { ErrorType } from './interface/errorTipe.interface';

export function errorsResponse(errors: ErrorType[]): { 
  code: number; 
  success: boolean; 
  data: { errors: any } 
} {
  const errorsList = errors.map((error) => {
    // Aseguramos que message siempre sea un array
    const messages = Array.isArray(error.message) ? error.message : [error.message];
    return messages.map((msg) => ({
      key: error.key || 'default_key',
      type: error.type || 'default_type',
      message: msg,
    }));
  }).flat();

  // Convertimos el array de errores a un objeto agrupado por key
  const errorsObject = errorsList.reduce((acc, error) => {
    acc[error.key] = {
      type: error.type,
      message: error.message,
    };
    return acc;
  }, {});

  return {
    code: 400, // Código de error predeterminado
    success: false,
    data: {
      errors: errorsObject,
    },
  };
}
