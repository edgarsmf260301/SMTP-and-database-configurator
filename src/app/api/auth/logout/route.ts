import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Eliminar la cookie de autenticación
    cookieStore.delete('auth-token');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sesión cerrada exitosamente' 
    });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
} 