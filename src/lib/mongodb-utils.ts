/**
 * Utilidades para manejar conexiones de MongoDB
 */

/**
 * Asegura que la URI de MongoDB incluya el nombre de la base de datos configurada
 * @param uri - URI de MongoDB original
 * @returns URI con el nombre de la base de datos configurada
 */

export function ensureRestaurantDatabase(uri: string): string {
  // Elimina cualquier base de datos al final de la URI y fuerza /Restaurant antes de los parámetros de query
  let cleanUri = uri.replace(
    /(mongodb(?:\+srv)?:\/\/[^/]+)(?:\/[^?]*)?/,
    '$1/Restaurant'
  );
  // Si no tiene /Restaurant, agrégalo
  if (!cleanUri.match(/\/Restaurant(\b|$)/)) {
    const [base, params] = cleanUri.split('?');
    cleanUri = base.endsWith('/') ? base + 'Restaurant' : base + '/Restaurant';
    if (params) cleanUri += '?' + params;
  }
  return cleanUri;
}

/**
 * Valida que una URI de MongoDB tenga el formato correcto
 * @param uri - URI a validar
 * @returns true si la URI es válida
 */
export function isValidMongoUri(uri: string): boolean {
  return uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
}
