export type RoleKey =
  | 'admin'
  | 'director'
  | 'box'
  | 'kitchen'
  | 'administration'
  | 'Waiter'
  | 'manager'
  | 'staff'
  | (string & {});

// Lista ofertada en formularios (registro/edición)
// Nota: mantenemos 'manager' y 'staff' en tipos para compatibilidad con datos antiguos,
// pero no se ofrecen en los formularios.
export const ALL_ROLES: RoleKey[] = [
  'admin',
  'director',
  'box',
  'kitchen',
  'administration',
  'Waiter',
];

export function getRoleLabel(role: RoleKey): string {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'director':
      return 'Director';
    case 'manager':
      return 'Gerente';
    case 'staff':
      return 'Personal';
    case 'box':
      return 'Caja';
    case 'kitchen':
      return 'Cocina';
    case 'administration':
      return 'Administración';
    case 'Waiter':
      return 'Mesonero';
    default:
      if (typeof role === 'string' && role.length > 0) {
        return role.charAt(0).toUpperCase() + role.slice(1);
      }
      return 'Rol';
  }
}

export function getRoleBadgeClasses(role: RoleKey): string {
  // Clases para la pill/badge del rol
  if (role === 'admin') {
    return 'bg-red-500/20 text-red-300 border border-red-400/40';
  }
  if (role === 'director') {
    return 'bg-amber-500/20 text-amber-300 border border-amber-400/40';
  }
  if (role === 'manager') {
    return 'bg-purple-500/20 text-purple-300 border border-purple-400/40';
  }
  return 'bg-blue-500/20 text-blue-300 border border-blue-400/40';
}

export function getRoleDotColor(role: RoleKey): string {
  // Color del punto redondo usado en listados
  if (role === 'admin') return 'bg-red-400';
  if (role === 'director') return 'bg-amber-400';
  if (role === 'manager') return 'bg-purple-400';
  return 'bg-blue-400';
}
