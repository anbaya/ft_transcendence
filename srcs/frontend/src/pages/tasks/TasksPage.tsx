import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TaskFilters } from '@/features/tasks/components/TaskFilters';
import { TaskTable } from '@/features/tasks/components/TaskTable';
import { CreateTaskModal } from '@/features/tasks/components/CreateTaskModal';
import { EditTaskModal } from '@/features/tasks/components/EditTaskModal';
import { DeleteTaskModal } from '@/features/tasks/components/DeleteTaskModal';
import { TaskDetailsModal } from '@/features/tasks/components/TaskDetailsModal';
import type { Task } from '@/types/task';

// Mock data
const mockTasks: Task[] = [
  {
    id: '1',
    project_id: '1',
    title: 'Design UI Mockups',
    description: 'Create high-fidelity mockups for the new dashboard layout.',
    status: 'In Review',
    priority: 'High',
    created_by: '1',
    assignee_id: '2',
    deadline: '2025-02-15T00:00:00Z',
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-12T00:00:00Z',
  },
  {
    id: '2',
    project_id: '1',
    title: 'Setup API Gateway',
    description: 'Configure Kong API gateway with JWT authentication plugins.',
    status: 'In Progress',
    priority: 'Urgent',
    created_by: '1',
    assignee_id: '1',
    deadline: '2025-02-01T00:00:00Z',
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-16T00:00:00Z',
  },
  {
    id: '3',
    project_id: '2',
    title: 'Write Documentation',
    description: 'Document the new API endpoints for the mobile team.',
    status: 'Todo',
    priority: 'Low',
    created_by: '2',
    deadline: '2025-03-01T00:00:00Z',
    created_at: '2025-01-20T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  },
  {
    id: '4',
    project_id: '1',
    title: 'Fix Login Bug',
    description: 'Users report being logged out randomly after 5 minutes.',
    status: 'Done',
    priority: 'High',
    created_by: '3',
    assignee_id: '1',
    deadline: '2025-01-25T00:00:00Z',
    created_at: '2025-01-24T00:00:00Z',
    updated_at: '2025-01-25T00:00:00Z',
  }
];

export default function TasksPage() {
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

  // Filter logic
  const filteredTasks = useMemo(() => {
    return mockTasks.filter(task => {
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
        <Button className="shrink-0" onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      <TaskFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
      />

      <TaskTable 
        tasks={filteredTasks} 
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      {/* Modals */}
      <CreateTaskModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      
      <TaskDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        task={selectedTask || undefined}
        onEditClick={() => selectedTask && handleEdit(selectedTask)}
        onDeleteClick={() => selectedTask && handleDelete(selectedTask)}
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
