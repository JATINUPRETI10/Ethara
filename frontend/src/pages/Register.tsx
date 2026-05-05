import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Register() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;

    try {
      setError('');
      const { data } = await api.post('/auth/register', { email, password, name, role });
      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex body-bg">
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-primary-600 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80')] mix-blend-overlay opacity-20 object-cover w-full h-full"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-16 xl:px-24 text-white z-10">
           <h1 className="text-5xl xl:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Start doing your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-purple-200">best work.</span>
           </h1>
           <p className="text-lg xl:text-xl text-primary-100 max-w-lg font-medium leading-relaxed">
              Join thousands of teams who use TaskFlow to plan, track, and manage their work seamlessly.
           </p>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96 glass-panel p-10 animate-slide-up relative">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-purple-200 rounded-full filter blur-xl opacity-50 z-0"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                  <Sparkles className="w-5 h-5" />
               </div>
               <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
                  TaskFlow
               </span>
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Create account
            </h2>
            <p className="text-sm text-gray-500 font-medium mb-8">
               Get started with your free account today.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                 <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium animate-fade-in text-center">
                    {error}
                 </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="appearance-none block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 sm:text-sm font-medium transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 sm:text-sm font-medium transition-all"
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 sm:text-sm font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account Role</label>
                <select
                  name="role"
                  className="appearance-none block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 sm:text-sm font-medium transition-all cursor-pointer"
                >
                  <option value="MEMBER">Team Member</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/20 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all hover:-translate-y-0.5 disabled:opacity-70"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-primary-600 hover:text-primary-500 hover:underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
