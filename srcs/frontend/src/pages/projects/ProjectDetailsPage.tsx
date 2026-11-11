import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import { formatDistanceToNow, isToday, isPast } from 'date-fns';
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
  FileText,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/cn';
import { AddProjectMemberModal } from '@/features/projects/components/AddProjectMemberModal';
import { RemoveProjectMemberModal } from '@/features/projects/components/RemoveProjectMemberModal';
import { EditProjectModal } from '@/features/projects/components/EditProjectModal';
import { LeaveProjectModal } from '@/features/projects/components/LeaveProjectModal';
import { TaskTable } from '@/features/tasks/components/TaskTable';
import { CreateTaskModal } from '@/features/tasks/components/CreateTaskModal';
import { EditTaskModal } from '@/features/tasks/components/EditTaskModal';
import { DeleteTaskModal } from '@/features/tasks/components/DeleteTaskModal';
import { TaskDetailsModal } from '@/features/tasks/components/TaskDetailsModal';
import { ProjectChatTab } from '@/features/projects/components/ProjectChatTab';
import { ProjectDocumentsTab } from '@/features/projects/components/ProjectDocumentsTab';
import type { Task } from '@/types/task';
import type { ProjectMember } from '@/types/project';

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  completed: 'success',
  in_progress: 'warning',
  cancelled: 'error',
};

const getDaysRemaining = (deadline?: string | null) => {
  if (!deadline) return { text: 'No deadline', isOverdue: false };
  const date = new Date(deadline);
  if (isToday(date)) return { text: 'Due Today', isOverdue: false };
  return {
    text: formatDistanceToNow(date, { addSuffix: true }),
    isOverdue: isPast(date),
  };
};

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { activeProject: project, activeProjectMembers, fetchProject, fetchProjectMembers, isLoading } = useProjectStore();
  const { tasks, fetchProjectTasks, updateTaskStatus } = useTaskStore();

  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);
  const [taskModal, setTaskModal] = useState<{ type: 'create' | 'details' | 'edit' | 'delete'; task?: Task } | null>(null);

  useEffect(() => {
    if (id) {
      const numId = Number(id);
      fetchProject(numId);
      fetchProjectMembers(numId);
      fetchProjectTasks(numId);
    }
  }, [id]);

  if (isLoading && !project) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center text-muted">
        Project not found
      </div>
    );
  }

  // Permissions & computed values
  const isPM = activeProjectMembers.some((m) => m.user_id === user?.id && m.role === 'PROJECT_MANAGER') || project.created_by === user?.id;
  const canManage = user?.role === 'ADMIN' || isPM;
  const projectManager = activeProjectMembers.find((m) => m.role === 'PROJECT_MANAGER' || m.user_id === project.created_by);
  const pmFullName = [projectManager?.first_name, projectManager?.last_name].filter(Boolean).join(' ');
  const pmName = pmFullName || projectManager?.email || 'Unassigned';

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const timeRemaining = getDaysRemaining(project.deadline);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tasks', label: `Tasks (${totalTasks})` },
    { id: 'members', label: `Members (${activeProjectMembers.length})` },
    { id: 'chat', label: 'Chat', Icon: MessageSquare },
    { id: 'documents', label: 'Documents', Icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
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
              <Badge variant={STATUS_VARIANTS[project.status] || 'default'} className="text-xs capitalize">
                {project.status.replace('_', ' ')}
              </Badge>
              <Badge variant={project.priority === 'high' ? 'error' : 'default'} className="text-xs capitalize">{project.priority} priority</Badge>
            </div>
            <p className="text-sm text-muted">
              {project.deadline ? `Due ${new Date(project.deadline).toLocaleDateString()}` : 'No deadline'} · {activeProjectMembers.length} {activeProjectMembers.length === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>
        {canManage && (
          <Button variant="secondary" className="shrink-0" onClick={() => setIsEditOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Edit Project
          </Button>
        )}
        {!canManage && (
          <Button variant="secondary" className="shrink-0 text-warning border-warning/30 hover:bg-warning/10" onClick={() => setIsLeaveOpen(true)}>
            <LogOut className="mr-2 h-4 w-4" />
            Leave Project
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="overview" className="flex flex-col w-full">
        <Tabs.List className="tabs-pills mb-6 overflow-x-auto hide-scrollbar">
          {tabs.map(({ id: tabId, label, Icon }) => (
            <Tabs.Trigger
              key={tabId}
              value={tabId}
              className="tab-pill whitespace-nowrap"
            >
              {Icon && <Icon className="mr-1.5 h-4 w-4" />}
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Content value="overview" className="outline-none space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card card-emerald p-5">
              <div className="flex items-center text-emerald-800 mb-2">
                <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600" />
                <h3 className="font-semibold">Task Progress</h3>
              </div>
              <div className="text-2xl font-bold text-primary">{completedTasks} / {totalTasks}</div>
              <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="text-xs text-emerald-700 font-medium mt-2">{progressPercent}% completed</p>
            </div>

            <div className={cn("card p-5", timeRemaining.isOverdue ? "card-rose" : "card-amber")}>
              <div className="flex items-center text-muted mb-2">
                <Clock className={`h-5 w-5 mr-2 ${timeRemaining.isOverdue ? 'text-red-500' : 'text-amber-600'}`} />
                <h3 className="font-semibold text-slate-800">Time Remaining</h3>
              </div>
              <div className={`text-2xl font-bold ${timeRemaining.isOverdue ? 'text-red-600' : 'text-primary'}`}>
                {timeRemaining.text}
              </div>
              <p className="text-sm text-muted mt-1">
                {project.deadline ? `Due ${new Date(project.deadline).toLocaleDateString()}` : 'No deadline scheduled'}
              </p>
            </div>

            <div className="card card-indigo p-5">
              <div className="flex items-center text-indigo-800 mb-2">
                <User className="h-5 w-5 mr-2 text-indigo-600" />
                <h3 className="font-semibold">Project Manager</h3>
              </div>
              <div className="text-lg font-bold text-primary truncate">{pmName}</div>
              <p className="text-sm text-muted mt-1">{activeProjectMembers.length} active {activeProjectMembers.length === 1 ? 'contributor' : 'contributors'}</p>
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
              <p className="text-sm text-muted">{totalTasks} {totalTasks === 1 ? 'task' : 'tasks'} · {completedTasks} completed</p>
            </div>
            {canManage && (
              <Button onClick={() => setTaskModal({ type: 'create' })}>
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            )}
          </div>
          <TaskTable
            tasks={tasks}
            isProjectManager={canManage}
            onViewDetails={(task) => setTaskModal({ type: 'details', task })}
            onEdit={(task) => setTaskModal({ type: 'edit', task })}
            onDelete={(task) => setTaskModal({ type: 'delete', task })}
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
                const displayName = member.first_name || member.last_name
                  ? `${member.first_name || ''} ${member.last_name || ''}`.trim()
                  : member.email || 'Project Member';

                return (
                  <div key={member.id} className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-slate-50/50">
                    <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                      <Avatar
                        userId={member.user_id}
                        fallback={initial}
                        size="sm"
                        className="h-9 w-9 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <p className="font-medium text-primary truncate">{displayName}</p>
                        {member.email && <p className="text-xs text-muted truncate">{member.email}</p>}
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
                      {canManage && member.role !== 'PROJECT_MANAGER' && member.user_id !== project.created_by && member.user_id !== user?.id && (
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

        <Tabs.Content value="chat" className="py-6 outline-none">
          <ProjectChatTab projectId={project.id} />
        </Tabs.Content>

        <Tabs.Content value="documents" className="outline-none">
          <ProjectDocumentsTab projectId={project.id} canManage={canManage} />
        </Tabs.Content>
      </Tabs.Root>

      {/* Modals */}
      <AddProjectMemberModal open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen} projectId={project.id} />
      <EditProjectModal open={isEditOpen} onOpenChange={setIsEditOpen} project={project} />
      <LeaveProjectModal open={isLeaveOpen} onOpenChange={setIsLeaveOpen} projectName={project.name} projectId={project.id} />
      <RemoveProjectMemberModal
        open={Boolean(memberToRemove)}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        memberId={memberToRemove ? memberToRemove.id : 0}
        projectId={project.id}
        memberName={memberToRemove?.first_name || memberToRemove?.last_name ? `${memberToRemove?.first_name || ''} ${memberToRemove?.last_name || ''}`.trim() : memberToRemove?.email}
      />

      {/* Task Modals */}
      <CreateTaskModal open={taskModal?.type === 'create'} onOpenChange={(o) => !o && setTaskModal(null)} projectId={project.id} projectDeadline={project.deadline} />
      <TaskDetailsModal
        open={taskModal?.type === 'details'}
        onOpenChange={(o) => !o && setTaskModal(null)}
        task={taskModal?.task}
        canManage={canManage}
        onEditClick={() => taskModal?.task && setTaskModal({ type: 'edit', task: taskModal.task })}
        onDeleteClick={() => taskModal?.task && setTaskModal({ type: 'delete', task: taskModal.task })}
        onStatusChange={async (taskId, status) => {
          await updateTaskStatus(taskId, status);
          setTaskModal((prev) => (prev?.task && prev.task.id === taskId ? { ...prev, task: { ...prev.task, status } } : prev));
        }}
      />
      <EditTaskModal
        key={taskModal?.task?.id ? `task-${taskModal.task.id}` : 'edit-modal'}
        open={taskModal?.type === 'edit'}
        onOpenChange={(o) => !o && setTaskModal(null)}
        task={taskModal?.task}
        projectDeadline={project.deadline}
      />
      <DeleteTaskModal
        open={taskModal?.type === 'delete'}
        onOpenChange={(o) => !o && setTaskModal(null)}
        taskTitle={taskModal?.task?.title || ''}
        taskId={taskModal?.task?.id}
      />
    </div>
  );
}
