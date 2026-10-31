import { useState, useMemo, useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { TaskFilters } from '@/features/tasks/components/TaskFilters';
import { TaskTable } from '@/features/tasks/components/TaskTable';
import { EditTaskModal } from '@/features/tasks/components/EditTaskModal';
import { DeleteTaskModal } from '@/features/tasks/components/DeleteTaskModal';
import { TaskDetailsModal } from '@/features/tasks/components/TaskDetailsModal';
import type { Task, TaskStatus } from '@/types/task';

export default function TasksPage() {
  const { myTasks, isLoading, fetchMyTasks, updateTaskStatus } = useTaskStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  
  // Modals state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch all assigned tasks on mount
  useEffect(() => {
    fetchMyTasks();
  }, []);

  // Handlers
  const handleViewDetails = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsOpen(false);
    setIsEditOpen(true);
  };

  const handleDelete = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsOpen(false);
    setIsDeleteOpen(true);
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Filter logic on myTasks
  const filteredTasks = useMemo(() => {
    return myTasks.filter((task) => {
      const title = task.title || '';
      const description = task.description || '';
      const matchesSearch = 
        title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [myTasks, searchQuery, statusFilter, priorityFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">My Assigned Tasks</h1>
          <p className="text-sm text-muted mt-1">
            Track and complete all tasks assigned to you across all projects
          </p>
        </div>
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
        <div className="py-12 text-center text-muted">Loading your tasks...</div>
      ) : (
        <TaskTable 
          tasks={filteredTasks}
          showProjectName={true}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      
      {/* Modals */}
      <TaskDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        task={selectedTask || undefined}
        onEditClick={() => selectedTask && handleEdit(selectedTask)}
        onDeleteClick={() => selectedTask && handleDelete(selectedTask)}
        onStatusChange={handleStatusChange}
      />

      <EditTaskModal 
        key={selectedTask?.id ? `task-${selectedTask.id}` : 'my-task-edit'}
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        task={selectedTask || undefined} 
      />

      <DeleteTaskModal 
        open={isDeleteOpen} 
        onOpenChange={setIsDeleteOpen} 
        taskTitle={selectedTask?.title || ''} 
        taskId={selectedTask?.id}
      />
    </div>
  );
}
