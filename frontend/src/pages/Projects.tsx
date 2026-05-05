import { useEffect, useState } from 'react';

import api from '../utils/api';
import { Plus, Users, CheckSquare, Layers, Sparkles, FolderKanban } from 'lucide-react';
import { format } from 'date-fns';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setIsModalOpen(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
             <Layers className="w-8 h-8 text-primary-600" />
             Projects
          </h1>
          <p className="text-gray-500 font-medium">Manage your team's workspaces</p>
        </div>
        
        {/* We removed the Admin check here so anyone can create a project */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          New Project
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
           <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project, index) => (
            <div key={project.id} className="glass-panel p-6 flex flex-col h-full animate-slide-up relative overflow-hidden group" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-400 to-primary-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-xl font-bold text-gray-900 truncate pr-2 group-hover:text-primary-700 transition-colors">{project.name}</h3>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm ${
                  project.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                  project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {project.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 mb-8 flex-1 line-clamp-3 leading-relaxed">
                {project.description || 'No description provided for this project.'}
              </p>
              
              <div className="flex items-center justify-between pt-5 border-t border-gray-100/80">
                <div className="flex items-center gap-4 text-sm font-semibold text-gray-600">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                    <Users className="w-4 h-4 text-primary-500" />
                    <span>{project._count?.members || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                    <CheckSquare className="w-4 h-4 text-primary-500" />
                    <span>{project._count?.tasks || 0}</span>
                  </div>
                </div>
                <div className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                  {format(new Date(project.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                 <FolderKanban className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-lg font-medium text-gray-600">No projects found</p>
              <p className="text-sm mt-1">Get started by creating a new project</p>
            </div>
          )}
        </div>
      )}

      {/* Premium Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-slide-up border border-gray-100">
            
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-100 rounded-full filter blur-3xl opacity-50 z-0"></div>
            
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
                     <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold text-gray-900">New Project</h2>
                     <p className="text-sm text-gray-500">Create a new workspace for your team.</p>
                  </div>
               </div>
               
               <form onSubmit={handleCreateProject} className="space-y-5">
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Name</label>
                   <input
                     required
                     type="text"
                     value={newProject.name}
                     onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                     placeholder="e.g. Website Redesign"
                     className="block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 sm:text-sm px-4 py-3 transition-all outline-none border"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description (Optional)</label>
                   <textarea
                     value={newProject.description}
                     onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                     placeholder="What is this project about?"
                     className="block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 sm:text-sm px-4 py-3 transition-all outline-none border h-32 resize-none"
                   />
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
                     Create Project
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
