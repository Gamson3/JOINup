// import { createContext, useContext, useState, useEffect } from 'react';
// import { getToken, setToken, removeToken } from '../lib/auth';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';

// interface AuthContextType {
//   role: string | null;
//   login: (email: string, password: string) => Promise<void>;
//   signup: (email: string, password: string, role: string) => Promise<void>;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [role, setRole] = useState<string | null>(null);
//   const router = useRouter();

//   const login = async (email: string, password: string) => {
//     const res = await axios.post('/api/login', { email, password });
//     setToken(res.data.token);
//     setRole(res.data.role);
//     router.push(`/dashboard/${res.data.role}`);
//   };

//   const signup = async (email: string, password: string, role: string) => {
//     await axios.post('/api/signup', { email, password, role });
//     await login(email, password);
//   };

//   const logout = () => {
//     removeToken();
//     setRole(null);
//     router.push('/auth');
//   };

//   useEffect(() => {
//     const token = getToken();
//     if (token) {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       setRole(payload.role);
//     }
//   }, []);

//   return (
//     <AuthContext.Provider value={{ role, login, signup, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
