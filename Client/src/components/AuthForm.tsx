// import { useState } from 'react';
// import { useAuth } from '../context/AuthContext';

// export default function AuthForm() {
//   const { login, signup } = useAuth();
//   const [isSignup, setIsSignup] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState('attendee');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       setError('');
//       if (isSignup) {
//         await signup(email, password, role);
//       } else {
//         await login(email, password);
//       }
//     } catch (err: any) {
//       setError(err.response?.data?.message || 'Authentication failed');
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded shadow-md mt-12">
//       <h2 className="text-xl font-bold mb-4">{isSignup ? 'Sign Up' : 'Login'}</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           type="email"
//           placeholder="Email"
//           className="w-full border p-2 rounded"
//           value={email}
//           onChange={e => setEmail(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           className="w-full border p-2 rounded"
//           value={password}
//           onChange={e => setPassword(e.target.value)}
//           required
//         />
//         {isSignup && (
//           <select
//             className="w-full border p-2 rounded"
//             value={role}
//             onChange={e => setRole(e.target.value)}
//           >
//             <option value="attendee">Attendee</option>
//             <option value="organizer">Organizer</option>
//             <option value="admin">Admin</option>
//           </select>
//         )}
//         <button className="w-full bg-blue-600 text-white p-2 rounded">
//           {isSignup ? 'Sign Up' : 'Login'}
//         </button>
//         {error && <p className="text-red-600">{error}</p>}
//       </form>
//       <div className="mt-4 text-sm text-center">
//         {isSignup ? (
//           <>
//             Already have an account?{' '}
//             <button className="text-blue-600 underline" onClick={() => setIsSignup(false)}>
//               Login
//             </button>
//           </>
//         ) : (
//           <>
//             Don’t have an account?{' '}
//             <button className="text-blue-600 underline" onClick={() => setIsSignup(true)}>
//               Sign Up
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
