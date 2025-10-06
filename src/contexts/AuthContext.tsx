import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, verificar si hay un usuario autenticado y validar el token
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = authService.getUser();
        const token = authService.getToken();
        
        if (savedUser && token) {
          console.log('🔍 Validando token existente...');
          // Validar el token con el servidor
          const isValidToken = await authService.validateToken();
          
          if (isValidToken) {
            // Token válido, actualizar usuario con datos del servidor
            const updatedUser = authService.getUser();
            setUser(updatedUser);
            console.log('✅ Token válido, usuario autenticado:', updatedUser?.email);
          } else {
            // Token inválido, limpiar datos y enviar al login
            console.log('❌ Token inválido o expirado, redirigiendo al login');
            setUser(null);
          }
        } else {
          console.log('ℹ️ No hay datos de autenticación guardados');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Error al verificar autenticación:', error);
        // En caso de error, limpiar datos y enviar al login
        authService.clearAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Escuchar eventos de token expirado durante el uso de la app
  useEffect(() => {
    const handleAuthExpired = () => {
      console.log('🔄 Token expirado detectado, cerrando sesión automáticamente');
      setUser(null);
    };

    window.addEventListener('auth-expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    console.log('✅ Usuario logueado:', userData.email);
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      console.log('✅ Usuario deslogueado');
    } catch (error) {
      console.error('❌ Error al hacer logout:', error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};