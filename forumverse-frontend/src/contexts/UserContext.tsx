import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  reputation: number;
  role: string;
  createdAt: string;
  joinDate?: string;
  posts?: any[];
  comment?: any[];
  reports?: any[];
  votes?: any[];
  savedPosts: any[];
}

interface UserContextType {
  profile: UserProfile | null;
  fetchProfile: (userId?: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}


const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const {  user, refreshUser} = useAuth();
  

const fetchProfile = useCallback(async (userId?: string) => {
  try {
    // Clear profile first to prevent showing stale data
    setProfile(null);
    
    const endpoint = userId ? `/user/${userId}` : '/user';
    const res = await axios.get(endpoint);
    setProfile(res.data);
  } catch (err) {
    console.error('Failed to fetch profile:', err);
    setProfile(null);
  }
}, []);


  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const res = await axios.put('/user', data);
      await refreshUser(); // Refresh user data after update
      setProfile(res.data);
      localStorage.setItem('user', JSON.stringify(res.data)); // Update local storage
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

// useEffect(() => {
//   const loadProfile = async () => {
//     if (isAuthenticated) {
//         await fetchProfile();
//       }
//   };

//   loadProfile();
// }, [isAuthenticated]);




  return (
    <UserContext.Provider value={{ profile, fetchProfile, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext };
