import React, { useState } from 'react';
import { authService } from '../services/authService';
import { RegisterRequest } from '../types';
import { MESSAGES, VALIDATION_RULES, UI_CONFIG } from '../config/constants';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onBackToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onBackToLogin }) => {
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validaciones básicas del frontend
    if (!formData.name.trim()) {
      setError(MESSAGES.VALIDATION.REQUIRED_NAME);
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError(MESSAGES.VALIDATION.REQUIRED_EMAIL);
      setLoading(false);
      return;
    }

    if (formData.password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      setError(MESSAGES.VALIDATION.MIN_PASSWORD_LENGTH);
      setLoading(false);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError(MESSAGES.VALIDATION.PASSWORDS_MISMATCH);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register(formData);
      console.log('✅ Registro exitoso!', response);
      onRegisterSuccess();
    } catch (error) {
      console.error('❌ Error en registro:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-duo-background-soft p-4">
      <div className="card-duo w-full max-w-md p-10">
        <h1 className="text-3xl font-black text-center mb-8 text-duo-text uppercase tracking-tight">
          Crea tu perfil
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-black text-duo-gray-dark mb-2 uppercase tracking-wide">
              Nombre completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-duo"
              placeholder="Tu nombre completo"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-black text-duo-gray-dark mb-2 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-duo"
              placeholder="tu@email.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-black text-duo-gray-dark mb-2 uppercase tracking-wide">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-duo"
              placeholder="••••••••"
            />
          </div>

          {/* Password Confirmation */}
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-black text-duo-gray-dark mb-2 uppercase tracking-wide">
              Confirmar contraseña
            </label>
            <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
              className="input-duo"
              placeholder="••••••••"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-duo-red/10 border-2 border-duo-red text-duo-red px-4 py-3 rounded-xl font-bold">
              ❌ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-duo-green"
          >
            {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-8 pt-6 border-t-2 border-duo-gray text-center text-duo-text font-bold">
          <p>
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={onBackToLogin}
              className="text-duo-blue hover:text-duo-blue-dark transition-colors uppercase"
            >
              Iniciar sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;