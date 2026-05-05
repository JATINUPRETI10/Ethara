import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { Plus, Users, CheckSquare, Layers, Sparkles, FolderKanban, Edit2, Trash2, UserPlus, X } from 'lucide-react';
import { format } from 'date-fns';

export default function Projects() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  // Form states
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [editingProject, setEditingProject] = useState<any>(null);

  // Members state
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);

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

  // CREATE
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setIsCreateModalOpen(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  // EDIT
  const openEditModal = (project: any) => {
    setEditingProject({ ...project });
    setIsEditModalOpen(true);
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${editingProject.id}`, {
        name: editingProject.name,
        description: editingProject.description,
        status: editingProject.status,
      });
      setIsEditModalOpen(false);
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  // DELETE
  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  // MANAGE MEMBERS
  const openMembersModal = async (project: any) => {
    setSelectedProject(project);
    setIsMembersModalOpen(true);
    try {
      // Fetch all users
      const usersRes = await api.get('/auth/users');
      setAllUsers(usersRes.data);
      // Fetch project details to get current members
      const projectRes = await api.get(`/projects/${project.id}`);
      setProjectMembers(projectRes.data.members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      const { data } = await api.post(`/projects/${selectedProject.id}/members`, { userId });
      setProjectMembers([...projectMembers, data]);
      fetchProjects(); // Update member count on card
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await api.delete(`/projects/${selectedProject.id}/members/${userId}`);
      setProjectMembers(projectMembers.filter(m => m.userId !== userId));
      fetchProjects(); // Update member count on card
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const isUserInProject = (userId: string) => {
    return projectMembers.some(m => m.userId === userId);
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

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="group flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            New Project
          </button>
        )}
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

              {user?.role === 'ADMIN' && (
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button onClick={() => openEditModal(project)} className="p-1.5 bg-white text-gray-600 hover:text-primary-600 rounded-lg shadow-sm border border-gray-100 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteProject(project.id)} className="p-1.5 bg-white text-gray-600 hover:text-red-600 rounded-lg shadow-sm border border-gray-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-xl font-bold text-gray-900 truncate pr-2 group-hover:text-primary-700 transition-colors">{project.name}</h3>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm ${project.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
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
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md cursor-pointer hover:bg-primary-50 transition-colors" onClick={() => user?.role === 'ADMIN' && openMembersModal(project)}>
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
              <p className="text-sm mt-1">{user?.role === 'ADMIN' ? 'Get started by creating a new project' : 'You have not been assigned to any projects yet'}</p>
            </div>
          )}
        </div>
      )}

      {/* Premium Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsCreateModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-slide-up border border-gray-100">
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
                  <input required type="text" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} placeholder="e.g. Website Redesign" className="block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 sm:text-sm px-4 py-3 outline-none border" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description (Optional)</label>
                  <textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="What is this project about?" className="block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 sm:text-sm px-4 py-3 outline-none border h-32 resize-none" />
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 shadow-md transition-all">Create Project</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-slide-up border border-gray-100">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <Edit2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Project</h2>
                  <p className="text-sm text-gray-500">Update project details.</p>
                </div>
              </div>
              <form onSubmit={handleEditProject} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Name</label>
                  <input required type="text" value={editingProject.name} onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })} className="block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 sm:text-sm px-4 py-3 outline-none border" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea value={editingProject.description || ''} onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })} className="block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 sm:text-sm px-4 py-3 outline-none border h-32 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                  <select value={editingProject.status} onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })} className="block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 sm:text-sm px-4 py-3 outline-none border">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 shadow-md transition-all">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {isMembersModalOpen && selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsMembersModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-slide-up border border-gray-100 flex flex-col max-h-[80vh]">
            <div className="relative z-10 flex-shrink-0">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Manage Members</h2>
                    <p className="text-sm text-gray-500">{selectedProject.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsMembersModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {allUsers.map((u) => {
                const isMember = isUserInProject(u.id);
                return (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-gray-900">{u.name} {u.id === user?.id && <span className="text-xs text-primary-500 font-bold ml-1">(You)</span>}</span>
                      <span className="text-xs text-gray-500">{u.email}</span>
                    </div>
                    {isMember ? (
                      <button
                        onClick={() => handleRemoveMember(u.id)}
                        disabled={u.id === user?.id} // Don't let admin remove themselves easily here
                        className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddMember(u.id)}
                        className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
