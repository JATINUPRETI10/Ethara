import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div className="body-bg"></div>
      <div className="min-h-screen flex text-gray-800 font-sans">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-2xl border-r border-white/20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100/50">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
                TaskFlow
              </span>
            </Link>
            <button className="lg:hidden text-gray-500 hover:text-gray-900" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="px-6 py-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Menu
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3.5 text-sm font-medium rounded-xl group transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-primary text-white shadow-md shadow-primary-500/20'
                      : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-6">
            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-gray-900 truncate">{user?.name}</span>
                <span className="text-xs text-primary-600 font-medium mt-0.5">{user?.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors ml-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
          <div className="lg:hidden flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-100/50 p-4 sticky top-0 z-30">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
               </div>
               <span className="text-lg font-bold text-gray-900 tracking-tight">TaskFlow</span>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 animate-fade-in">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
