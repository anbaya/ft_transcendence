import { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTaskStore } from '@/stores/taskStore';
import { useProjectStore } from '@/stores/projectStore';
import { Button } from '@/components/ui/Button';
import { TaskFilters } from '@/features/tasks/components/TaskFilters';
import { TaskTable } from '@/features/tasks/components/TaskTable';
import { CreateTaskModal } from '@/features/tasks/components/CreateTaskModal';
import { EditTaskModal } from '@/features/tasks/components/EditTaskModal';
import { DeleteTaskModal } from '@/features/tasks/components/DeleteTaskModal';
import { TaskDetailsModal } from '@/features/tasks/components/TaskDetailsModal';
import type { Task } from '@/types/task';


export default function TasksPage() {
  const { user } = useAuthStore();
  const { tasks, isLoading, fetchMyTasks, fetchProjectTasks, updateTaskStatus } = useTaskStore();
  const { activeProject } = useProjectStore();
  
  const canManage = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Handlers
  const handleViewDetails = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsOpen(false); // Close details if open
    setIsEditOpen(true);
  };

  const handleDelete = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsOpen(false); // Close details if open
    setIsDeleteOpen(true);
  };

  const handleStatusChange = async (taskId: string, newStatus: any) => {
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Fetch tasks on mount
  useEffect(() => {
    if (activeProject?.id) {
      fetchProjectTasks(activeProject.id);
    } else {
      fetchMyTasks();
    }
  }, [activeProject?.id]);

  // Filter logic
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [searchQuery, statusFilter, priorityFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Tasks</h1>
          <p className="text-sm text-muted mt-1">Manage and organize all your work items</p>
        </div>
        {canManage && (
          <Button className="shrink-0" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        )}
      </div>

      <TaskFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
      />

      {isLoading ? (
        <div className="py-12 text-center text-muted">Loading tasks...</div>
      ) : (
        <TaskTable 
          tasks={filteredTasks} 
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      
      {/* Modals */}
      <CreateTaskModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      
      <TaskDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        task={selectedTask || undefined}
        onEditClick={() => selectedTask && handleEdit(selectedTask)}
        onDeleteClick={() => selectedTask && handleDelete(selectedTask)}
        onStatusChange={handleStatusChange}
      />
      
      <EditTaskModal 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        task={selectedTask || undefined} 
      />
      
      <DeleteTaskModal 
        open={isDeleteOpen} 
        onOpenChange={setIsDeleteOpen} 
        taskTitle={selectedTask?.title || ''} 
      />
    </div>
  );
}
