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

  // Al cargar la app, verificar si hay un usuario autenticado
  useEffect(() => {
    const initAuth = () => {
      try {
        const savedUser = authService.getUser();
        const token = authService.getToken();
        
        if (savedUser && token) {
          setUser(savedUser);
          console.log('✅ Usuario autenticado encontrado:', savedUser.email);
        } else {
          console.log('ℹ️ No hay usuario autenticado');
        }
      } catch (error) {
        console.error('❌ Error al verificar autenticación:', error);
        authService.clearAuth(); // Limpiar datos corruptos
      } finally {
        setLoading(false);
      }
    };

    initAuth();
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