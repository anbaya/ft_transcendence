import { useState } from 'react';
import { FolderKanban, Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { CreateProjectModal } from '@/features/projects/components/CreateProjectModal';
import { EditProjectModal } from '@/features/projects/components/EditProjectModal';
import { DeleteProjectModal } from '@/features/projects/components/DeleteProjectModal';
import type { Project } from '@/types/project';

import { useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const canManage = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';
  const [search, setSearch] = useState('');
  
  const { projects, isLoading, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, []);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsEditOpen(true);
  };

  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Projects</h1>
          <p className="text-sm text-muted mt-1">Manage and track your team's projects</p>
        </div>
        {canManage && (
          <Button className="shrink-0" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="w-full max-w-sm">
          <Input 
            placeholder="Search projects..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center bg-white">
          <FolderKanban className="mx-auto h-12 w-12 text-muted/50" />
          <h3 className="mt-4 text-lg font-semibold text-primary">No projects found</h3>
          <p className="mt-2 text-sm text-muted max-w-sm">
            You don't have any projects matching your search, or haven't created any yet.
          </p>
          {canManage && (
            <Button className="mt-6" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          )}
        </div>
      )}

      <CreateProjectModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      
      <EditProjectModal 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        project={selectedProject || undefined} 
      />
      
      <DeleteProjectModal 
        open={isDeleteOpen} 
        onOpenChange={setIsDeleteOpen} 
        projectName={selectedProject?.name || ''} 
        projectId={selectedProject?.id || ''}
      />
    </div>
  );
}
