import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';
import { API_CONFIG, STORAGE_KEYS, MESSAGES } from '../config/constants';

class AuthService {
  // Claves para localStorage desde constantes
  private readonly TOKEN_KEY = STORAGE_KEYS.AUTH_TOKEN;
  private readonly USER_KEY = STORAGE_KEYS.AUTH_USER;

  /**
   * Hace login del usuario y guarda el token
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        // Normalizar respuesta para consistencia
        const authResponse: AuthResponse = {
          success: true,
          data: {
            user: data.data?.user || data.user,
            token: data.data?.token || data.token,
          },
          message: data.message || 'Login exitoso',
        };

        // Guardar token y usuario en localStorage
        this.setToken(authResponse.data.token);
        this.setUser(authResponse.data.user);
        return authResponse;
      } else {
        // Manejo de errores de validación
        if (data.errors) {
          const errorMessages = Object.values(data.errors)
            .flat()
            .join('. ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Registra un nuevo usuario
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // Laravel devuelve directamente user y token, no dentro de data.data
        const authResponse: AuthResponse = {
          success: true,
          data: {
            user: data.user,
            token: data.token,
          },
          message: data.message || 'Registro exitoso',
        };

        // Guardar token y usuario en localStorage
        this.setToken(data.token);
        this.setUser(data.user);
        return authResponse;
      } else {
        // Manejo de errores de validación
        if (data.errors) {
          // Extraer el primer error de cada campo
          const errorMessages = Object.values(data.errors)
            .flat()
            .join('. ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Error al registrarse');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  /**
   * Cierra sesión del usuario
   */
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${API_CONFIG.BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Siempre limpiar el localStorage
      this.clearAuth();
    }
  }

  /**
   * Guarda el token en localStorage
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Obtiene el token del localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Guarda el usuario en localStorage
   */
  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Obtiene el usuario del localStorage
   */
  getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Limpia todos los datos de autenticación
   */
  clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Obtiene los headers de autorización para las peticiones
   */
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }
}

export const authService = new AuthService();