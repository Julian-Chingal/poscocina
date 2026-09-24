import { useAuthStore } from '../stores/auth.store';
import { toast } from '../components/ui/sonner';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined | null>;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type NetworkListener = (isOnline: boolean) => void;
const networkListeners = new Set<NetworkListener>();

export const onNetworkStatusChange = (listener: NetworkListener) => {
  networkListeners.add(listener);
  return () => {
    networkListeners.delete(listener);
  };
};

export const setNetworkStatus = (isOnline: boolean) => {
  networkListeners.forEach((listener) => {
    try {
      listener(isOnline);
    } catch (e) {
      console.error('Error in network listener:', e);
    }
  });
};

async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = endpoint.startsWith('http')
    ? endpoint
    : endpoint.startsWith('/api')
    ? endpoint
    : `/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = useAuthStore.getState().token;
  const venueId = useAuthStore.getState().venueId;

  const method = (customConfig.method || 'GET').toUpperCase();
  const hasBody = customConfig.body !== undefined && customConfig.body !== null;
  const needsContentType = hasBody || ['POST', 'PUT', 'PATCH'].includes(method);

  const authHeaders: Record<string, string> = {};

  if (needsContentType) {
    authHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }
  if (venueId) {
    authHeaders['x-venue-id'] = venueId;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...authHeaders,
      ...headers,
    },
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (netErr: any) {
    console.error('🌐 Error de red al comunicarse con el backend:', netErr);
    setNetworkStatus(false);
    toast.error('Error de conexión: El servidor backend no responde');
    throw new ApiError(0, 'Servicio no disponible: No se pudo conectar al servidor backend', netErr);
  }

  // Manejar 503 Service Unavailable (DB o Redis caídos en healthcheck o endpoint)
  if (response.status === 503) {
    setNetworkStatus(false);
    toast.error('Servicio no disponible: La base de datos o el backend están caídos');
    throw new ApiError(503, 'Servicio no disponible');
  }

  // Notificar conectividad restaurada
  setNetworkStatus(true);

  // Handle Unauthorized (Session expired or invalid token)
  if (response.status === 401) {
    console.warn('🔒 Sesión expirada o token no autorizado (401). Bloqueando terminal...');
    toast.error('Sesión expirada. Inicia sesión nuevamente');
    useAuthStore.getState().logout();
  } else if (response.status === 403) {
    toast.error('No tienes permisos para realizar esta acción');
  }

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {
      // Ignored if non-json error response
    }

    const errorMessage =
      errorData?.message ||
      errorData?.error ||
      `Error en petición (${response.status}): ${response.statusText}`;

    // Disparar automáticamente Toast de error de shadcn para 400, 404, 409, 500
    if ([400, 404, 409, 500].includes(response.status)) {
      toast.error(errorMessage);
    }

    throw new ApiError(
      response.status,
      errorMessage,
      errorData
    );
  }

  // If 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
