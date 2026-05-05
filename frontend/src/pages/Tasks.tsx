import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { Plus, Filter, Calendar, Target, AlignLeft, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function Tasks() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'MEDIUM',
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      
      const { data } = await api.get(`/tasks?${params.toString()}`);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
     try {
      const { data } = await api.get('/projects');
      setProjects(data);
     } catch (error) {
       console.error('Error fetching projects:', error);
     }
  }

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'ADMIN') {
       fetchProjects();
    }
  }, [statusFilter, priorityFilter, user?.role]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', newTask);
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', projectId: '', priority: 'MEDIUM' });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const priorityColors: Record<string, string> = {
     HIGH: 'bg-rose-100 text-rose-700 border-rose-200',
     MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
     LOW: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
           <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <Target className="w-8 h-8 text-primary-600" />
              Tasks
           </h1>
           <p className="text-gray-500 font-medium">Keep track of your action items</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 glass-panel px-4 py-2 border border-white">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          
          <div className="glass-panel px-4 py-2 border border-white">
             <select
               value={priorityFilter}
               onChange={(e) => setPriorityFilter(e.target.value)}
               className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer"
             >
               <option value="">All Priorities</option>
               <option value="LOW">Low Priority</option>
               <option value="MEDIUM">Medium Priority</option>
               <option value="HIGH">High Priority</option>
             </select>
          </div>

          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 ml-2"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              New Task
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
           <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map((task, index) => (
             <div key={task.id} className="glass-panel p-6 flex flex-col animate-slide-up group relative overflow-hidden" style={{ animationDelay: `${index * 50}ms` }}>
                
                {/* Priority edge indicator */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                   task.priority === 'HIGH' ? 'bg-rose-500' : task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
                }`}></div>

                <div className="flex justify-between items-start mb-3 pl-2">
                   <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors leading-snug">{task.title}</h3>
                </div>
                
                <div className="pl-2 mb-6">
                   <p className="text-xs font-bold uppercase tracking-wider text-primary-500 mb-2">{task.project?.name}</p>
                   <p className="text-sm text-gray-600 flex-1 leading-relaxed line-clamp-2">
                      {task.description || <span className="italic text-gray-400">No description...</span>}
                   </p>
                </div>
                
                <div className="mt-auto pl-2 space-y-5 pt-4 border-t border-gray-100">
                   <div className="flex justify-between items-center">
                     <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${priorityColors[task.priority]}`}>
                        {task.priority} Priority
                     </span>
                     {task.dueDate && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                           <Calendar className="w-3.5 h-3.5 text-gray-400" />
                           {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </div>
                     )}
                   </div>
                   
                   <div className="flex items-center justify-between bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                     <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Assignee</span>
                        <span className="text-sm font-semibold text-gray-800">
                           {task.assignedTo?.name || 'Unassigned'}
                        </span>
                     </div>
                     <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-wider rounded-lg px-3 py-1.5 outline-none cursor-pointer border shadow-sm transition-colors focus:ring-2 focus:ring-primary-500/20 ${
                          task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' :
                          'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                        disabled={user?.role !== 'ADMIN' && task.assignedTo?.id !== user?.id}
                     >
                        <option value="TODO">TO DO</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                     </select>
                   </div>
                </div>
             </div>
          ))}
          {tasks.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                 <CheckSquare className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-lg font-medium text-gray-600">No tasks found</p>
              <p className="text-sm mt-1">Try adjusting your filters or create a new task</p>
            </div>
          )}
        </div>
      )}

      {/* Premium Task Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-slide-up border border-gray-100">
            
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-100 rounded-full filter blur-3xl opacity-50 z-0"></div>
            
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                     <AlignLeft className="w-6 h-6" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold text-gray-900">New Task</h2>
                     <p className="text-sm text-gray-500">Create an action item for your team.</p>
                  </div>
               </div>
               
               <form onSubmit={handleCreateTask} className="space-y-5">
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project</label>
                   <select
                     required
                     value={newTask.projectId}
                     onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                     className="block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 sm:text-sm px-4 py-3 transition-all outline-none border"
                   >
                     <option value="" disabled>Select a project</option>
                     {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                     ))}
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
                   <input
                     required
                     type="text"
                     value={newTask.title}
                     onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                     placeholder="Task title"
                     className="block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 sm:text-sm px-4 py-3 transition-all outline-none border"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description (Optional)</label>
                   <textarea
                     value={newTask.description}
                     onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                     placeholder="Add more details..."
                     className="block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 sm:text-sm px-4 py-3 transition-all outline-none border h-24 resize-none"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
                   <select
                     value={newTask.priority}
                     onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                     className="block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 sm:text-sm px-4 py-3 transition-all outline-none border"
                   >
                     <option value="LOW">Low</option>
                     <option value="MEDIUM">Medium</option>
                     <option value="HIGH">High</option>
                   </select>
                 </div>
                 <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                   <button
                     type="button"
                     onClick={() => setIsModalOpen(false)}
                     className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                   >
                     Cancel
                   </button>
                   <button
                     type="submit"
                     className="px-6 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 shadow-md shadow-gray-900/20 hover:shadow-lg transition-all"
                   >
                     Create Task
                   </button>
                 </div>
               </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
