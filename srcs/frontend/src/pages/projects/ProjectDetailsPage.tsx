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
  CheckCircle2,
  Plus,
  MessageSquare,
  FileText
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AddProjectMemberModal } from '@/features/projects/components/AddProjectMemberModal';
import { RemoveProjectMemberModal } from '@/features/projects/components/RemoveProjectMemberModal';
import { EditProjectModal } from '@/features/projects/components/EditProjectModal';
import { TaskTable } from '@/features/tasks/components/TaskTable';
import { CreateTaskModal } from '@/features/tasks/components/CreateTaskModal';
import { EditTaskModal } from '@/features/tasks/components/EditTaskModal';
import { DeleteTaskModal } from '@/features/tasks/components/DeleteTaskModal';
import { TaskDetailsModal } from '@/features/tasks/components/TaskDetailsModal';
import { ProjectChatTab } from '@/features/projects/components/ProjectChatTab';
import { ProjectDocumentsTab } from '@/features/projects/components/ProjectDocumentsTab';
import type { Task } from '@/types/task';
import type { ProjectMember } from '@/types/project';

import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  // Project Modals
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);

  // Task Modals & State
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [isDeleteTaskOpen, setIsDeleteTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { activeProject: project, activeProjectMembers, fetchProject, fetchProjectMembers, isLoading } = useProjectStore();
  const { tasks, fetchProjectTasks, updateTaskStatus } = useTaskStore();

  useEffect(() => {
    if (id) {
      fetchProject(id);
      fetchProjectMembers(id);
      fetchProjectTasks(id);
    }
  }, [id]);

  // Determine permissions: admin, project manager, or creator
  const isProjectManager = activeProjectMembers.some(
    (m) => String(m.user_id) === String(user?.id) && m.role === 'PROJECT_MANAGER'
  ) || (project && String(project.created_by) === String(user?.id));
  const canManage = user?.role === 'ADMIN' || Boolean(isProjectManager);

  // Find Project Manager / Creator info
  const projectManager = activeProjectMembers.find(
    (m) => m.role === 'PROJECT_MANAGER' || (project && String(m.user_id) === String(project.created_by))
  );

  // Task Action Handlers
  const handleViewTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(false);
    setIsEditTaskOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(false);
    setIsDeleteTaskOpen(true);
  };

  const handleTaskStatusChange = async (taskId: string | number, newStatus: any) => {
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (isLoading || !project) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Real task progress metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Real time remaining calculation
  const calculateDaysRemaining = () => {
    if (!project?.deadline) return { text: 'No deadline', isOverdue: false };
    const deadlineDate = new Date(project.deadline);
    const today = new Date();
    deadlineDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'Day' : 'Days'} Overdue`, isOverdue: true };
    }
    if (diffDays === 0) {
      return { text: 'Due Today', isOverdue: false };
    }
    return { text: `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'}`, isOverdue: false };
  };

  const timeRemaining = calculateDaysRemaining();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return 'Planned';
    return status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Top Nav Breadcrumbs */}
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
              <Badge variant={getStatusVariant(project.status) as any} className="text-xs">
                {formatStatus(project.status)}
              </Badge>
              <Badge variant={project.priority === 'high' ? 'error' : 'default'} className="text-xs capitalize">
                {project.priority} priority
              </Badge>
            </div>
            <p className="text-sm text-muted">
              {project.deadline
                ? `Due ${new Date(project.deadline).toLocaleDateString()}`
                : 'No deadline'} · {activeProjectMembers.length} {activeProjectMembers.length === 1 ? 'member' : 'members'}
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

      {/* 5 Tabs: Overview, Tasks, Members, Chat, Documents */}
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
            Tasks ({totalTasks})
          </Tabs.Trigger>
          <Tabs.Trigger
            value="members"
            className="flex h-11 items-center justify-center bg-transparent px-5 text-sm font-medium text-muted hover:text-primary data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary outline-none transition-colors"
          >
            Members ({activeProjectMembers.length})
          </Tabs.Trigger>
          <Tabs.Trigger
            value="chat"
            className="flex h-11 items-center justify-center bg-transparent px-5 text-sm font-medium text-muted hover:text-primary data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary outline-none transition-colors"
          >
            <MessageSquare className="mr-1.5 h-4 w-4" />
            Chat
          </Tabs.Trigger>
          <Tabs.Trigger
            value="documents"
            className="flex h-11 items-center justify-center bg-transparent px-5 text-sm font-medium text-muted hover:text-primary data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary outline-none transition-colors"
          >
            <FileText className="mr-1.5 h-4 w-4" />
            Documents
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
              <div className="text-2xl font-bold text-primary">
                {completedTasks} / {totalTasks}
              </div>
              <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-secondary rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted mt-2">{progressPercent}% completed</p>
            </div>
            
            <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center text-muted mb-2">
                <Clock className={`h-5 w-5 mr-2 ${timeRemaining.isOverdue ? 'text-red-500' : 'text-warning'}`} />
                <h3 className="font-medium">Time Remaining</h3>
              </div>
              <div className={`text-2xl font-bold ${timeRemaining.isOverdue ? 'text-red-600' : 'text-primary'}`}>
                {timeRemaining.text}
              </div>
              <p className="text-sm text-muted mt-1">
                {project.deadline ? `Due ${new Date(project.deadline).toLocaleDateString()}` : 'No deadline scheduled'}
              </p>
            </div>
            
            <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center text-muted mb-2">
                <User className="h-5 w-5 mr-2 text-indigo-500" />
                <h3 className="font-medium">Project Manager</h3>
              </div>
              <div className="text-lg font-bold text-primary truncate">
                {projectManager?.first_name || projectManager?.last_name
                  ? `${projectManager?.first_name || ''} ${projectManager?.last_name || ''}`.trim()
                  : projectManager?.email || 'Assigned Manager'}
              </div>
              <p className="text-sm text-muted mt-1">
                {activeProjectMembers.length} active {activeProjectMembers.length === 1 ? 'contributor' : 'contributors'}
              </p>
            </div>
          </div>
          
          <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Project Description</h3>
            <p className="text-muted whitespace-pre-wrap">{project.description || 'No description provided.'}</p>
          </div>
        </Tabs.Content>

        {/* Tasks Tab */}
        <Tabs.Content value="tasks" className="py-6 outline-none space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-primary">Project Tasks</h2>
              <p className="text-sm text-muted">
                {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'} · {completedTasks} completed
              </p>
            </div>
            {canManage && (
              <Button onClick={() => setIsCreateTaskOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            )}
          </div>

          <TaskTable 
            tasks={tasks}
            onViewDetails={handleViewTaskDetails}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        </Tabs.Content>

        {/* Members Tab */}
        <Tabs.Content value="members" className="py-6 outline-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-lg font-semibold text-primary">Team Members</h2>
              <p className="text-sm text-muted">Manage contributors collaborating on this project.</p>
            </div>
            {canManage && (
              <Button onClick={() => setIsAddMemberOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            )}
          </div>

          <div className="rounded-lg border border-border bg-white shadow-sm overflow-hidden text-sm">
            <div className="grid grid-cols-12 gap-4 border-b border-border bg-slate-50 px-6 py-3 font-medium text-muted">
              <div className="col-span-6 sm:col-span-5">Name</div>
              <div className="col-span-3 hidden sm:block">Role</div>
              <div className="col-span-3 hidden md:block">Joined</div>
              <div className="col-span-6 sm:col-span-4 md:col-span-1 text-right">Actions</div>
            </div>
            
            <div className="divide-y divide-border">
              {activeProjectMembers.map((member) => {
                const initial = (member.first_name?.[0] || member.email?.[0] || 'U').toUpperCase();
                const displayName =
                  member.first_name || member.last_name
                    ? `${member.first_name || ''} ${member.last_name || ''}`.trim()
                    : member.email || 'Project Member';

                return (
                  <div key={member.id} className="grid grid-cols-12 gap-4 items-center px-6 py-4 transition-colors hover:bg-slate-50/50">
                    <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold shrink-0 text-sm">
                        {initial}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-medium text-primary truncate">{displayName}</p>
                        {member.email && (
                          <p className="text-xs text-muted truncate">{member.email}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-span-3 hidden sm:block">
                      <Badge variant={member.role === 'PROJECT_MANAGER' ? 'default' : 'info'}>
                        {member.role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Member'}
                      </Badge>
                    </div>
                    
                    <div className="col-span-3 hidden md:block text-muted">
                      {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '-'}
                    </div>
                    
                    <div className="col-span-6 sm:col-span-4 md:col-span-1 text-right">
                      {canManage && (
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-error hover:text-error hover:bg-error/10"
                          onClick={() => setMemberToRemove(member)}
                          title="Remove member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Tabs.Content>

        {/* Chat Tab */}
        <Tabs.Content value="chat" className="py-6 outline-none">
          <ProjectChatTab projectId={project.id} />
        </Tabs.Content>

        {/* Documents Tab */}
        <Tabs.Content value="documents" className="outline-none">
          <ProjectDocumentsTab projectId={project.id} canManage={canManage} />
        </Tabs.Content>
      </Tabs.Root>

      {/* Project Modals */}
      <AddProjectMemberModal 
        open={isAddMemberOpen} 
        onOpenChange={setIsAddMemberOpen} 
        projectId={project.id}
      />

      <RemoveProjectMemberModal 
        open={!!memberToRemove} 
        onOpenChange={(open) => !open && setMemberToRemove(null)} 
        memberId={memberToRemove?.id || ''}
        projectId={project.id}
        memberName={
          memberToRemove?.first_name || memberToRemove?.last_name
            ? `${memberToRemove?.first_name || ''} ${memberToRemove?.last_name || ''}`.trim()
            : memberToRemove?.email
        }
      />
      
      <EditProjectModal 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        project={project} 
      />

      {/* Task Modals */}
      <CreateTaskModal 
        open={isCreateTaskOpen} 
        onOpenChange={setIsCreateTaskOpen}
        projectId={project.id}
      />

      <TaskDetailsModal
        open={isTaskDetailsOpen}
        onOpenChange={setIsTaskDetailsOpen}
        task={selectedTask || undefined}
        onEditClick={() => selectedTask && handleEditTask(selectedTask)}
        onDeleteClick={() => selectedTask && handleDeleteTask(selectedTask)}
        onStatusChange={handleTaskStatusChange}
      />

      <EditTaskModal 
        key={selectedTask?.id ? `task-${selectedTask.id}` : 'edit-task-modal'}
        open={isEditTaskOpen} 
        onOpenChange={setIsEditTaskOpen} 
        task={selectedTask || undefined} 
      />

      <DeleteTaskModal 
        open={isDeleteTaskOpen} 
        onOpenChange={setIsDeleteTaskOpen} 
        taskTitle={selectedTask?.title || ''} 
      />
    </div>
  );
}
