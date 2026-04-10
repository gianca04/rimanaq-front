import React, { useState } from 'react';
import { authService } from '../services/authService';
import { LoginRequest } from '../types';
import { UI_CONFIG } from '../config/constants';

interface LoginProps {
  onLoginSuccess: () => void;
  onGoToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onGoToRegister }) => {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
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

    try {
      const response = await authService.login(formData);
      console.log('✅ Login exitoso!', response);
      onLoginSuccess(); // Notifica que el login fue exitoso
    } catch (error) {
      console.error('❌ Error en login:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-duo-background-soft p-4">
      <div className="card-duo w-full max-w-md p-10">
        <h1 className="text-4xl font-black text-center mb-2 text-duo-blue">
          RIMANAQ
        </h1>
        <h3 className="text-xl font-bold text-center mb-8 text-duo-text">
          ¡Aprende LSP de forma divertida!
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="flex justify-between mb-2">
              <label htmlFor="password" className="text-sm font-black text-duo-gray-dark uppercase tracking-wide">
                Contraseña
              </label>
            </div>
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
            className="w-full btn-duo-blue"
          >
            {loading ? 'INGRESANDO...' : 'INGRESAR'}
          </button>
        </form>

        {/* Registro */}
        <div className="mt-8 pt-6 border-t-2 border-duo-gray text-center text-duo-text font-bold">
          <p>
            ¿Eres nuevo por aquí?{' '}
            <button
              onClick={onGoToRegister}
              className="text-duo-blue hover:text-duo-blue-dark transition-colors uppercase"
            >
              Crea una cuenta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;