import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { FolderKanban, CheckSquare, AlertCircle, Clock, TrendingUp } from 'lucide-react';

interface DashboardStats {
  projectCount: number;
  taskCount: number;
  completedTasks: number;
  overdueTasks: number;
  myTasks: number;
  progress: number;
  recentTasks: any[];
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
     <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
     </div>
  );
  if (!stats) return <div className="text-center text-red-500 py-10">Error loading dashboard</div>;

  const StatCard = ({ title, value, icon: Icon, colorClass, delay }: any) => (
    <div className={`glass-panel p-6 flex items-center gap-5 animate-slide-up`} style={{ animationDelay: delay }}>
      <div className={`p-4 rounded-2xl ${colorClass}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-gray-500 text-lg">Welcome back, {user?.name}. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Projects" 
          value={stats.projectCount} 
          icon={FolderKanban} 
          colorClass="bg-blue-50 text-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.1)]" 
          delay="0ms" 
        />
        <StatCard 
          title="Total Tasks" 
          value={stats.taskCount} 
          icon={CheckSquare} 
          colorClass="bg-indigo-50 text-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.1)]" 
          delay="100ms" 
        />
        <StatCard 
          title="My Tasks" 
          value={stats.myTasks} 
          icon={Clock} 
          colorClass="bg-emerald-50 text-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
          delay="200ms" 
        />
        <StatCard 
          title="Overdue Tasks" 
          value={stats.overdueTasks} 
          icon={AlertCircle} 
          colorClass="bg-rose-50 text-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.1)]" 
          delay="300ms" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900">Overall Progress</h2>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg flex items-center gap-2">
                 <TrendingUp className="w-4 h-4" />
                 <span className="text-sm font-semibold tracking-wide">On Track</span>
              </div>
           </div>
           
           <div className="flex flex-col items-center justify-center py-8">
              <div className="relative">
                 <svg className="w-48 h-48 transform -rotate-90">
                    <circle cx="96" cy="96" r="88" className="stroke-gray-100" strokeWidth="16" fill="none" />
                    <circle 
                       cx="96" cy="96" r="88" 
                       className="stroke-primary-500 transition-all duration-1000 ease-out" 
                       strokeWidth="16" fill="none" 
                       strokeDasharray="552.92" 
                       strokeDashoffset={552.92 - (552.92 * stats.progress) / 100}
                       strokeLinecap="round" 
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-gray-900">{stats.progress}%</span>
                    <span className="text-sm font-medium text-gray-400 mt-1">Completed</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="glass-panel p-8 animate-slide-up flex flex-col" style={{ animationDelay: '500ms' }}>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="flex-1 space-y-5 overflow-y-auto pr-2">
            {stats.recentTasks.map((task) => (
              <div key={task.id} className="group relative pl-4 border-l-2 border-gray-100 hover:border-primary-400 transition-colors">
                <div className="absolute w-2.5 h-2.5 bg-white border-2 border-primary-500 rounded-full -left-[6px] top-1.5 group-hover:bg-primary-500 transition-colors"></div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{task.title}</p>
                  <p className="text-xs text-gray-500 font-medium">{task.project.name}</p>
                  <span className={`self-start mt-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full tracking-wide ${
                    task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                    task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
            {stats.recentTasks.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 pb-8">
                 <CheckSquare className="w-12 h-12 opacity-20" />
                 <p className="text-sm font-medium">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
