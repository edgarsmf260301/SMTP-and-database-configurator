import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyJWTToken, getJWTSecret } from '@/lib/token-utils';

// PUT: Actualizar usuario (método completo)
export async function PUT(req: NextRequest, context: any) {
  try {
    // Verificar autenticación
    const authToken = req.cookies.get('auth-token')?.value;
    if (!authToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar token JWT
    const decoded = verifyJWTToken(authToken, getJWTSecret());
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Verificar que sea admin
    if (!decoded.roles || !decoded.roles.includes('admin')) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params;
    const { name, email, roles, isActive } = await req.json();

    // Conectar a MongoDB
    await dbConnect();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    let emailChanged = false;
    let statusChanged = false;

    // Validar nombre único entre usuarios habilitados (excepto el propio)
    if (name && name !== user.name) {
      const nameExists = await User.findOne({
        name,
        isActive: true,
        _id: { $ne: user._id },
      });
      if (nameExists) {
        return NextResponse.json(
          {
            error: 'Ya existe un usuario habilitado con ese nombre.',
          },
          { status: 400 }
        );
      }
    }

    // Validar email único entre usuarios con emailVerified true (excepto el propio)
    if (email && email !== user.email) {
      const emailExists = await User.findOne({
        email,
        emailVerified: true,
        _id: { $ne: user._id },
      });
      if (emailExists) {
        return NextResponse.json(
          {
            error: 'Ya existe un usuario con ese correo verificado.',
          },
          { status: 400 }
        );
      }
      user.email = email;
      user.emailVerified = false;
      user.verificationToken = undefined;
      user.tokenExpires = undefined;
      emailChanged = true;
    }

    // Aplicar cambios
    if (name) user.name = name;
    if (Array.isArray(roles)) user.roles = roles;

    // Verificar si el estado cambió
    if (typeof isActive === 'boolean' && user.isActive !== isActive) {
      user.isActive = isActive;
      statusChanged = true;

      // Agregar timestamp del cambio de estado
      user.statusChangedAt = new Date();
      user.statusChangedBy = decoded.userId;
    }

    // Verificar que si el usuario quiere ser admin, el email esté verificado
    if (
      Array.isArray(roles) &&
      roles.includes('admin') &&
      !user.emailVerified
    ) {
      return NextResponse.json(
        {
          error:
            'Para asignar el rol de administrador, el correo electrónico debe estar verificado.',
        },
        { status: 400 }
      );
    }

    await user.save();

    console.log(
      `👤 [USER UPDATE] Usuario ${user.name} actualizado por admin ${decoded.name}`
    );

    return NextResponse.json({
      success: true,
      emailChanged,
      statusChanged,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        roles: user.roles,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}

// PATCH: Editar usuario (método parcial)
export async function PATCH(req: NextRequest, context: any) {
  try {
    // Verificar autenticación
    const authToken = req.cookies.get('auth-token')?.value;
    if (!authToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar token JWT
    const decoded = verifyJWTToken(authToken, getJWTSecret());
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Verificar que sea admin
    if (!decoded.roles || !decoded.roles.includes('admin')) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params;
    const { name, email, roles, isActive } = await req.json();

    // Conectar a MongoDB
    await dbConnect();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    let emailChanged = false;
    let statusChanged = false;

    // Validar nombre único entre usuarios habilitados (excepto el propio)
    if (name && name !== user.name) {
      const nameExists = await User.findOne({
        name,
        isActive: true,
        _id: { $ne: user._id },
      });
      if (nameExists) {
        return NextResponse.json(
          {
            error: 'Ya existe un usuario habilitado con ese nombre.',
          },
          { status: 400 }
        );
      }
    }

    // Validar email único entre usuarios con emailVerified true (excepto el propio)
    if (email && email !== user.email) {
      const emailExists = await User.findOne({
        email,
        emailVerified: true,
        _id: { $ne: user._id },
      });
      if (emailExists) {
        return NextResponse.json(
          {
            error: 'Ya existe un usuario con ese correo verificado.',
          },
          { status: 400 }
        );
      }
      user.email = email;
      user.emailVerified = false;
      user.verificationToken = undefined;
      user.tokenExpires = undefined;
      emailChanged = true;
    }

    // Aplicar cambios
    if (name) user.name = name;
    if (Array.isArray(roles)) user.roles = roles;

    // Verificar si el estado cambió
    if (typeof isActive === 'boolean' && user.isActive !== isActive) {
      user.isActive = isActive;
      statusChanged = true;

      // Agregar timestamp del cambio de estado
      user.statusChangedAt = new Date();
      user.statusChangedBy = decoded.userId;
    }

    // Verificar que si el usuario quiere ser admin, el email esté verificado
    if (
      Array.isArray(roles) &&
      roles.includes('admin') &&
      !user.emailVerified
    ) {
      return NextResponse.json(
        {
          error:
            'Para asignar el rol de administrador, el correo electrónico debe estar verificado.',
        },
        { status: 400 }
      );
    }

    await user.save();

    console.log(
      `👤 [USER UPDATE] Usuario ${user.name} actualizado por admin ${decoded.name}`
    );

    return NextResponse.json({
      success: true,
      emailChanged,
      statusChanged,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        roles: user.roles,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
