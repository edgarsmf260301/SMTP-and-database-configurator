import { useCallback } from 'react';
import { useAuth } from './useAuth';

// Hook para manejar respuestas de edición de usuarios
export function useEditUserHandler() {
  const { logout } = useAuth();

  // Función para manejar la respuesta después de editar un usuario
  const handleEditUserResponse = useCallback(
    async (response: Response) => {
      try {
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();

        // Verificar si el usuario actual necesita cerrar sesión
        if (
          data.currentUserStatus &&
          data.currentUserStatus.action === 'logout_required'
        ) {
          console.log(
            '❌ [EDIT HANDLER] Usuario actual deshabilitado, cerrando sesión'
          );
          logout('Tu cuenta ha sido deshabilitada por un administrador');
          return false;
        }

        // Si todo está bien, continuar
        if (
          data.currentUserStatus &&
          data.currentUserStatus.action === 'continue'
        ) {
          console.log('✅ [EDIT HANDLER] Usuario actual activo, continuando');
          return true;
        }

        return true;
      } catch (error) {
        console.error('💥 [EDIT HANDLER] Error manejando respuesta:', error);
        return false;
      }
    },
    [logout]
  );

  // Función para verificar estado del usuario actual después de editar
  const verifyCurrentUserAfterEdit = useCallback(async () => {
    try {
      console.log(
        '🔍 [EDIT HANDLER] Verificando estado del usuario actual después de edición'
      );

      const response = await fetch('/api/admin/users/verify-current-user', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();

        // Si el usuario fue deshabilitado, cerrar sesión
        if (data.error === 'Usuario desactivado') {
          console.log(
            '❌ [EDIT HANDLER] Usuario deshabilitado por admin, cerrando sesión'
          );
          logout('Tu cuenta ha sido deshabilitada por un administrador');
          return false;
        }

        // Otros errores de autenticación
        if (data.error && data.error !== 'Usuario desactivado') {
          console.log('⚠️ [EDIT HANDLER] Error de autenticación:', data.error);
          logout('Error de autenticación');
          return false;
        }
      } else {
        console.log('✅ [EDIT HANDLER] Usuario actual verificado como activo');
        return true;
      }
    } catch (error) {
      console.error('💥 [EDIT HANDLER] Error verificando estado:', error);
      return false;
    }
  }, [logout]);

  return {
    handleEditUserResponse,
    verifyCurrentUserAfterEdit,
  };
}
