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
    <div className={`min-h-screen flex items-center justify-center ${UI_CONFIG.GRADIENTS.REGISTER}`}>
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🆕 Registro LSP
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              👤 Nombre completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Tu nombre completo"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              📧 Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="tu@email.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              🔒 Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>

          {/* Password Confirmation */}
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
              🔒 Confirmar contraseña
            </label>
            <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              ❌ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? '⏳ Registrando...' : '🚀 Crear cuenta'}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            onClick={onBackToLogin}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            ← Volver al login
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <h3 className="font-semibold text-gray-700 mb-2">📝 Registro:</h3>
          <p className="text-sm text-gray-600">
            Crea tu cuenta para acceder a los cursos de Lengua de Señas Peruana.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Tu cuenta se crea automáticamente y podrás hacer login de inmediato.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;