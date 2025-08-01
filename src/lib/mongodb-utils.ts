/**
 * Utilidades para manejar conexiones de MongoDB
 */

/**
 * Asegura que la URI de MongoDB incluya el nombre de la base de datos "Restaurant"
 * @param uri - URI de MongoDB original
 * @returns URI con el nombre de la base de datos "Restaurant"
 */
export function ensureRestaurantDatabase(uri: string): string {
  // Si ya contiene Restaurant, devolver la URI original
  if (uri.includes('/Restaurant') || uri.includes('/restaurant')) {
    return uri;
  }

  // Separar la URI base de los parámetros de consulta
  const urlParts = uri.split('?');
  const baseUri = urlParts[0];
  const queryParams = urlParts.length > 1 ? `?${urlParts.slice(1).join('?')}` : '';

  // Determinar si necesitamos agregar / antes de Restaurant
  let finalBaseUri: string;
  
  if (baseUri.endsWith('/')) {
    // Si termina con /, solo agregar Restaurant
    finalBaseUri = `${baseUri}Restaurant`;
  } else {
    // Si no termina con /, agregar /Restaurant
    finalBaseUri = `${baseUri}/Restaurant`;
  }

  // Reconstruir la URI completa con los parámetros de consulta
  return `${finalBaseUri}${queryParams}`;
}

/**
 * Valida que una URI de MongoDB tenga el formato correcto
 * @param uri - URI a validar
 * @returns true si la URI es válida
 */
export function isValidMongoUri(uri: string): boolean {
  return uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
} 