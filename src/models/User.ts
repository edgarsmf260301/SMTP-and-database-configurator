import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
  isActive: boolean;
  emailVerified: boolean;
  verificationToken?: string;
  tokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  resetPasswordAttempts: number;
  lastResetPasswordAttempt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  compareVerificationToken(candidateToken: string): Promise<boolean>;
  compareResetPasswordToken(candidateToken: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      maxlength: [50, 'El nombre no puede tener más de 50 caracteres'],
    },
    username: {
      type: String,
      required: false, // Opcional para compatibilidad con usuarios existentes
      unique: false, // No único para permitir múltiples usuarios sin username
      lowercase: true,
      trim: true,
      minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
      maxlength: [
        30,
        'El nombre de usuario no puede tener más de 30 caracteres',
      ],
      match: [
        /^[a-zA-Z0-9_-]+$/,
        'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos',
      ],
    },
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor ingresa un email válido',
      ],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    },
    roles: {
      type: [String],
      enum: [
        'admin',
        'director',
        'manager',
        'staff',
        'box',
        'kitchen',
        'administration',
        'Waiter',
      ],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: false,
    },
    tokenExpires: {
      type: Date,
      required: false,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
    resetPasswordAttempts: {
      type: Number,
      default: 0,
    },
    lastResetPasswordAttempt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', async function (next) {
  // Hashear contraseña si se modificó
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error as import('mongoose').CallbackError);
    }
  }

  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para comparar token de verificación
userSchema.methods.compareVerificationToken = async function (
  candidateToken: string
): Promise<boolean> {
  try {
    if (!this.verificationToken) return false;
    return await bcrypt.compare(candidateToken, this.verificationToken);
  } catch (error) {
    console.error('Error comparing verification token:', error);
    return false;
  }
};

// Método para comparar token de reset de contraseña
userSchema.methods.compareResetPasswordToken = async function (
  candidateToken: string
): Promise<boolean> {
  try {
    if (!this.resetPasswordToken) return false;
    return await bcrypt.compare(candidateToken, this.resetPasswordToken);
  } catch (error) {
    console.error('Error comparing reset password token:', error);
    return false;
  }
};

// Método para obtener usuario sin contraseña
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Asegurar que el modelo se registre correctamente
const UserModel =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

// Verificar que los métodos estén disponibles
if (!UserModel.prototype.compareVerificationToken) {
  UserModel.prototype.compareVerificationToken = async function (
    candidateToken: string
  ): Promise<boolean> {
    try {
      if (!this.verificationToken) return false;
      return await bcrypt.compare(candidateToken, this.verificationToken);
    } catch (error) {
      console.error('Error comparing verification token:', error);
      return false;
    }
  };
}

export { userSchema };
export default UserModel;
