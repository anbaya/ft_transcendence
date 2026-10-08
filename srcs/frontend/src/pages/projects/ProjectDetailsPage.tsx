import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import { 
  FolderKanban, 
  Settings, 
  ArrowLeft, 
  UserPlus, 
  Trash2, 
  User, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AddProjectMemberModal } from '@/features/projects/components/AddProjectMemberModal';
import { RemoveProjectMemberModal } from '@/features/projects/components/RemoveProjectMemberModal';
import { EditProjectModal } from '@/features/projects/components/EditProjectModal';
import type { Project, ProjectMember } from '@/types/project';

import { useProjectStore } from '@/stores/projectStore';

const mockMembers: (ProjectMember & { user: { name: string; email: string }; role: string })[] = [
  { id: '1', joined_at: '2025-01-11T00:00:00Z', project_id: '1', user_id: '1', role: 'Lead', user: { name: 'Anoir Baya', email: 'anoir@mail.com' } },
  { id: '2', joined_at: '2025-01-12T00:00:00Z', project_id: '1', user_id: '2', role: 'Contributor', user: { name: 'Douaa E.', email: 'douaa@mail.com' } },
];

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const canManage = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  // Modals
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  const { activeProject: project, fetchProject, isLoading } = useProjectStore();

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  if (isLoading || !project) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Nav */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link to="/projects" className="hover:text-primary hover:underline">
          <ArrowLeft className="inline-block h-4 w-4 mr-1 mb-0.5" />
          Projects
        </Link>
        <span>/</span>
        <span className="font-medium text-primary">{project.name}</span>
      </div>

      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-white p-6 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-indigo-50 text-secondary shrink-0">
            <FolderKanban className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-primary">{project.name}</h1>
              <Badge variant={project.status === 'Completed' ? 'success' : 'default'} className="text-xs">
                {project.status}
              </Badge>
              <Badge variant={project.priority === 'High' || project.priority === 'Urgent' ? 'error' : 'default'} className="text-xs">
                {project.priority}
              </Badge>
            </div>
            <p className="text-sm text-muted">
              Due {new Date(project.deadline).toLocaleDateString()} · {mockMembers.length} members
            </p>
          </div>
        </div>
        {canManage && (
          <Button variant="secondary" className="shrink-0" onClick={() => setIsEditOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Edit Project
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="overview" className="flex flex-col w-full">
        <Tabs.List className="flex shrink-0 border-b border-border overflow-x-auto hide-scrollbar">
          <Tabs.Trigger
            value="overview"
            className="flex h-11 items-center justify-center bg-transparent px-5 text-sm font-medium text-muted hover:text-primary data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary outline-none transition-colors"
          >
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger
            value="tasks"
            className="flex h-11 items-center justify-center bg-transparent px-5 text-sm font-medium text-muted hover:text-primary data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary outline-none transition-colors"
          >
            Tasks
          </Tabs.Trigger>
          <Tabs.Trigger
            value="members"
            className="flex h-11 items-center justify-center bg-transparent px-5 text-sm font-medium text-muted hover:text-primary data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary outline-none transition-colors"
          >
            Members
          </Tabs.Trigger>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Content value="overview" className="py-6 outline-none space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center text-muted mb-2">
                <CheckCircle2 className="h-5 w-5 mr-2 text-secondary" />
                <h3 className="font-medium">Task Progress</h3>
              </div>
              <div className="text-2xl font-bold text-primary">12 / 24</div>
              <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-1/2 rounded-full"></div>
              </div>
            </div>
            
            <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center text-muted mb-2">
                <Clock className="h-5 w-5 mr-2 text-warning" />
                <h3 className="font-medium">Time Remaining</h3>
              </div>
              <div className="text-2xl font-bold text-primary">90 Days</div>
              <p className="text-sm text-muted mt-1">Due {new Date(project.deadline).toLocaleDateString()}</p>
            </div>
            
            <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center text-muted mb-2">
                <User className="h-5 w-5 mr-2 text-indigo-500" />
                <h3 className="font-medium">Team Size</h3>
              </div>
              <div className="text-2xl font-bold text-primary">{mockMembers.length}</div>
              <p className="text-sm text-muted mt-1">Active contributors</p>
            </div>
          </div>
          
          <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Project Description</h3>
            <p className="text-muted whitespace-pre-wrap">{project.description}</p>
          </div>
        </Tabs.Content>

        {/* Tasks Tab Placeholder */}
        <Tabs.Content value="tasks" className="py-6 outline-none">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center bg-white">
            <CheckCircle2 className="mx-auto h-12 w-12 text-muted/50" />
            <h3 className="mt-4 text-lg font-semibold text-primary">Task Management</h3>
            <p className="mt-2 text-sm text-muted max-w-sm">
              Tasks will be fully implemented in Phase 11.
            </p>
            <Link to="/tasks">
              <Button className="mt-6" variant="secondary">
                Go to Global Tasks
              </Button>
            </Link>
          </div>
        </Tabs.Content>

        {/* Members Tab */}
        <Tabs.Content value="members" className="py-6 outline-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <h2 className="text-lg font-semibold text-primary">Team Members</h2>
            {canManage && (
              <Button onClick={() => setIsAddMemberOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            )}
          </div>

          <div className="rounded-lg border border-border bg-white shadow-sm overflow-hidden text-sm">
            <div className="grid grid-cols-12 gap-4 border-b border-border bg-slate-50 px-6 py-3 font-medium text-muted">
              <div className="col-span-6 sm:col-span-4">Name</div>
              <div className="col-span-4 hidden sm:block">Role</div>
              <div className="col-span-3 hidden md:block">Joined</div>
              <div className="col-span-6 sm:col-span-4 md:col-span-1 text-right">Actions</div>
            </div>
            
            <div className="divide-y divide-border">
              {mockMembers.map((member) => (
                <div key={member.id} className="grid grid-cols-12 gap-4 items-center px-6 py-4 transition-colors hover:bg-slate-50/50">
                  <div className="col-span-6 sm:col-span-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold shrink-0">
                      {member.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-primary truncate">{member.user.name}</p>
                      <p className="text-xs text-muted truncate">{member.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="col-span-4 hidden sm:block">
                    <Badge variant={member.role === 'Lead' ? 'error' : 'default'}>
                      {member.role}
                    </Badge>
                  </div>
                  
                  <div className="col-span-3 hidden md:block text-muted">
                    {new Date(member.joined_at).toLocaleDateString()}
                  </div>
                  
                  <div className="col-span-6 sm:col-span-4 md:col-span-1 text-right">
                    {canManage && (
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-error hover:text-error hover:bg-error/10"
                        onClick={() => setMemberToRemove(member.user.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      {/* Modals */}
      <AddProjectMemberModal 
        open={isAddMemberOpen} 
        onOpenChange={setIsAddMemberOpen} 
        projectName={project.name}
      />

      <RemoveProjectMemberModal 
        open={!!memberToRemove} 
        onOpenChange={(open) => !open && setMemberToRemove(null)} 
        memberName={memberToRemove || ''}
        projectName={project.name}
      />
      
      <EditProjectModal 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        project={project} 
      />
    </div>
  );
}
