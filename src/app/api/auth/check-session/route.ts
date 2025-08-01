import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyJWTToken } from '@/lib/token-utils';

export async function GET(request: NextRequest) {
  try {
    // Verificar si el sistema está configurado
    const envPath = require('path').join(process.cwd(), '.env.local');
    const fs = require('fs');
    
    if (!fs.existsSync(envPath)) {
      return NextResponse.json({ isAuthenticated: false, authenticated: false, error: 'System not configured' }, { status: 401 });
    }

    // Obtener el token de la cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ isAuthenticated: false, authenticated: false, error: 'No token found' }, { status: 401 });
    }

    // Verificar el token
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json({ isAuthenticated: false, authenticated: false, error: 'Server configuration error' }, { status: 500 });
    }

    try {
      const decoded = verifyJWTToken(token, secret);
      
      if (!decoded) {
        return NextResponse.json({ isAuthenticated: false, authenticated: false, error: 'Invalid token' }, { status: 401 });
      }
      
      // Conectar a la base de datos
      await dbConnect();

      // Verificar que el usuario existe y está activo
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive || !user.emailVerified) {
        return NextResponse.json({ isAuthenticated: false, authenticated: false, error: 'User not found or inactive' }, { status: 401 });
      }

      return NextResponse.json({
        isAuthenticated: true,
        authenticated: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });

    } catch (jwtError) {
      return NextResponse.json({ isAuthenticated: false, authenticated: false, error: 'Invalid token' }, { status: 401 });
    }

  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json({ isAuthenticated: false, authenticated: false, error: 'Server error' }, { status: 500 });
  }
} 