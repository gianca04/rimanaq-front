import { LoginRequest, RegisterRequest, AuthResponse, User, UpdateProfileRequest, UpdateProfileResponse } from '../types';
import { API_CONFIG, STORAGE_KEYS } from '../config/constants';

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
        await this.authenticatedFetch(`${API_CONFIG.BASE_URL}/logout`, {
          method: 'POST',
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
   * Verifica periódicamente si el token sigue siendo válido
   * Útil para sesiones de larga duración
   */
  async checkTokenPeriodically(): Promise<void> {
    if (this.isAuthenticated()) {
      const isValid = await this.validateToken();
      if (!isValid) {
        console.log('🔄 Token inválido detectado en verificación periódica');
        window.dispatchEvent(new CustomEvent('auth-expired'));
      }
    }
  }

  // Métodos para debugging y testing - NO usar en producción
  /**
   * Fuerza la limpieza de autenticación (para testing)
   */
  debugClearAuth(): void {
    console.log('🧪 [DEBUG] Limpiando autenticación manualmente');
    this.clearAuth();
    window.dispatchEvent(new CustomEvent('auth-expired'));
  }

  /**
   * Simula un token expirado estableciendo uno inválido
   */
  debugSimulateExpiredToken(): void {
    console.log('🧪 [DEBUG] Simulando token expirado');
    this.setToken('invalid-expired-token');
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    try {
      const response = await this.authenticatedFetch(`${API_CONFIG.BASE_URL}/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        // Actualizar el usuario guardado en localStorage
        this.setUser(data.user || data.data?.user);
        
        return {
          success: true,
          data: {
            user: data.user || data.data?.user,
          },
          message: data.message || 'Perfil actualizado correctamente',
        };
      } else {
        // Manejo de errores de validación
        if (data.errors) {
          const errorMessages = Object.values(data.errors)
            .flat()
            .join('. ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Valida el token actual con el servidor
   * Endpoint de Laravel Sanctum para verificar el usuario autenticado
   */
  async validateToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      console.log('❌ No hay token para validar');
      return false;
    }

    try {
      console.log('🔍 Validando token con el servidor...');
      const response = await fetch(`${API_CONFIG.BASE_URL}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Token válido, usuario verificado:', userData.email);
        // Actualizar los datos del usuario si la respuesta es exitosa
        this.setUser(userData);
        return true;
      } else if (response.status === 401) {
        // Token específicamente inválido (401 Unauthorized)
        console.log('❌ Token expirado o inválido (401), limpiando autenticación');
        this.clearAuth();
        return false;
      } else {
        // Otro error del servidor (500, 503, etc.)
        console.log(`⚠️ Error del servidor (${response.status}), manteniendo sesión temporalmente`);
        // No limpiar la autenticación en caso de errores del servidor
        return true;
      }
    } catch (error) {
      console.error('🌐 Error de red al validar token:', error);
      // En caso de error de red, mantener la sesión para modo offline
      // La validación se reintentará en la próxima petición
      return true;
    }
  }

  /**
   * Método helper para hacer peticiones autenticadas con manejo de errores 401
   */
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = this.getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    // Si recibimos 401, el token expiró - limpiar autenticación
    if (response.status === 401) {
      console.log('❌ Token expirado detectado en petición, limpiando autenticación');
      this.clearAuth();
      // Optionally, you could dispatch an event here to notify the app
      window.dispatchEvent(new CustomEvent('auth-expired'));
    }

    return response;
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

// Exponer métodos de debug globalmente en development
if (import.meta.env.DEV) {
  interface WindowDebugAuth {
    clearAuth: () => void;
    simulateExpiredToken: () => void;
    validateToken: () => Promise<boolean>;
    getToken: () => string | null;
    getUser: () => User | null;
    isAuthenticated: () => boolean;
  }

  (window as typeof window & { debugAuth: WindowDebugAuth }).debugAuth = {
    clearAuth: () => authService.debugClearAuth(),
    simulateExpiredToken: () => authService.debugSimulateExpiredToken(),
    validateToken: () => authService.validateToken(),
    getToken: () => authService.getToken(),
    getUser: () => authService.getUser(),
    isAuthenticated: () => authService.isAuthenticated(),
  };
  console.log('🧪 Métodos de debug de autenticación disponibles en window.debugAuth');
}