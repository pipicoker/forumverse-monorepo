import { createContext, useState, ReactNode, useEffect } from 'react';
import axios from '@/lib/axios';
import { User, AuthState } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { set } from 'date-fns';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: (onLogoutComplete?: () => void) => void;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  loading: boolean;
  refreshUser: () => Promise<void>; 
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
     setAuthState({
        isAuthenticated: true,
        user: storedUser && storedUser !== 'undefined' ? (JSON.parse(storedUser) as User) : null,

      });
      setLoading(false);
    } else if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAuthState({
        isAuthenticated: false,
        user: null,
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  const interceptor = axios.interceptors.response.use(
    response => response,
    async error => {
      if (error.response?.status === 401) {
        // Only logout on 401 from auth endpoints, not from other endpoints
        const url = error.config?.url || '';
        if (url.includes('/auth/') || url.includes('/current-user')) {
          // Token expired or invalid
          await logout();
        }
      }
      return Promise.reject(error);
    }
  );

  return () => {
    axios.interceptors.response.eject(interceptor);
  };
}, []);

const refreshUser = async () => {
  try {
    const token = localStorage.getItem('token'); // or however you store it

    if (!token) {
      console.warn('No token found');
      return;
    }

    const response = await axios.get('/auth/current-user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const updatedUser = response.data as User;

    setAuthState({
      isAuthenticated: true,
      user: { ...updatedUser },
    });

    localStorage.setItem('user', JSON.stringify(updatedUser));
  } catch (error) {
    console.error('Failed to refresh user:', error);
  }
};



  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      setAuthState({ isAuthenticated: true, user: response.data.user as User });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      return true;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error);
      throw error;
    }
  };

 
 const logout = async (onLogoutComplete?: () => void) => {
  try {
    await axios.delete('/auth/logout');
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('user');
    setAuthState({ isAuthenticated: false, user: null });
    toast({ title: 'Logged out successfully' });

    if (onLogoutComplete) onLogoutComplete();
  }
};


  const register = async (username: string, email: string, password: string) => {
    const response = await axios.post('/auth/signup', {
      username,
      email,
      password,
    });
    if (response.status !== 201) {
      throw new Error('Registration failed');
    }
    toast({
    title: 'Registration successful',
    description: 'Please check your email to verify your account.',
  });

  return true;
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, register, loading , refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
