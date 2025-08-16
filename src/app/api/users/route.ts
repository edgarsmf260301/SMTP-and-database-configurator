import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { consumeTempAdminEmailVerified } from '@/lib/temp-admin-verifications';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/token-utils';

// Helper para validar roles permitidos por JWT
const ALLOWED_ROLES = [
  'admin',
  'director',
  'box',
  'kitchen',
  'administration',
  'Waiter',
];
async function isAllowed(req: NextRequest) {
  console.log('🔐 [USERS API] Validating request authorization...');

  const authHeader =
    req.headers.get('authorization') || req.cookies.get('auth-token')?.value;
  const token = authHeader?.replace('Bearer ', '') || '';

  if (!token) {
    console.log('❌ [USERS API] No auth token found');
    return false;
  }

  try {
    console.log('🔍 [USERS API] Verifying JWT token...');
    const decoded: any = jwt.verify(token, getJWTSecret());
    console.log('✅ [USERS API] JWT verified, userId:', decoded.userId);

    await dbConnect();
    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log('❌ [USERS API] User not found in database');
      return false;
    }

    if (!Array.isArray(user.roles)) {
      console.log('❌ [USERS API] User roles is not an array:', user.roles);
      return false;
    }

    if (!user.isActive) {
      console.log('❌ [USERS API] User is not active');
      return false;
    }

    const hasAllowedRole = user.roles.some((r: string) =>
      ALLOWED_ROLES.includes(r)
    );
    console.log(
      '🔍 [USERS API] User roles:',
      user.roles,
      'Has allowed role:',
      hasAllowedRole
    );

    return hasAllowedRole;
  } catch (err) {
    console.error('💥 [USERS API] Error validating authorization:', err);
    return false;
  }
}

// GET: Listar usuarios
export async function GET(req: NextRequest) {
  console.log('🔍 [USERS API] GET request received');

  if (!(await isAllowed(req))) {
    console.log('❌ [USERS API] Request not allowed');
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    console.log('🔗 [USERS API] Connecting to database...');
    await dbConnect();
    console.log('✅ [USERS API] Database connected');

    console.log('🔍 [USERS API] Fetching users...');
    const users = await User.find({}, '-password');
    console.log(
      `✅ [USERS API] Found ${users.length} users:`,
      users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        roles: u.roles,
      }))
    );

    return NextResponse.json({ users });
  } catch (error) {
    console.error('💥 [USERS API] Error fetching users:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST: Registrar usuario
export async function POST(req: NextRequest) {
  // Permitir verificación de unicidad sin autenticación
  const url = req.nextUrl || (req as any).url;
  let checkUnique = false;
  let searchParams;
  if (typeof url === 'string') {
    searchParams = new URL(url, 'http://localhost').searchParams;
  } else if (url && url.searchParams) {
    searchParams = url.searchParams;
  }
  if (searchParams && searchParams.get('checkUnique') === '1') {
    const { name, email, userId, adminIntent } = await req.json();
    await dbConnect();
    // Si es edición y se quiere pasar a admin, solo bloquear si existe OTRO usuario con ese correo y emailVerified true
    if (adminIntent && userId) {
      const exists = await User.findOne({
        email,
        emailVerified: true,
        _id: { $ne: userId },
      });
      if (exists) {
        return NextResponse.json(
          {
            unique: false,
            message:
              'Ya existe un usuario administrador con este correo verificado',
          },
          { status: 200 }
        );
      }
      return NextResponse.json({ unique: true }, { status: 200 });
    }
    // Registro normal: bloquear si existe cualquier usuario con ese correo o nombre
    const exists = await User.findOne({ $or: [{ email }, { name }] });
    if (exists) {
      return NextResponse.json(
        { unique: false, message: 'El usuario o correo ya existe' },
        { status: 200 }
      );
    }
    return NextResponse.json({ unique: true }, { status: 200 });
  }
  if (!(await isAllowed(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const { name, email, roles, isActive, password } = await req.json();
  if (
    !name ||
    !email ||
    !roles ||
    !Array.isArray(roles) ||
    roles.length === 0 ||
    !password
  ) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }
  // Validar que los roles sean válidos
  const validRoles = [
    'admin',
    'director',
    'manager',
    'staff',
    'box',
    'kitchen',
    'administration',
    'Waiter',
  ];
  const invalidRoles = roles.filter(role => !validRoles.includes(role));
  if (invalidRoles.length > 0) {
    return NextResponse.json(
      { error: `Roles inválidos: ${invalidRoles.join(', ')}` },
      { status: 400 }
    );
  }
  await dbConnect();
  const exists = await User.findOne({ email });
  if (exists) {
    return NextResponse.json(
      { error: 'El usuario ya existe' },
      { status: 400 }
    );
  }
  let emailVerified = false;
  if (roles.includes('admin') || roles.includes('director')) {
    emailVerified = consumeTempAdminEmailVerified(email);
  }
  const user = new User({
    name,
    email,
    roles,
    isActive,
    password,
    emailVerified,
  });
  await user.save();
  return NextResponse.json({ success: true });
}
