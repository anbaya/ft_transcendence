import { useState } from 'react';
import { ArrowUpDown, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { Task } from '@/types/task';

interface TaskTableProps {
  tasks: Task[];
  showProjectName?: boolean;
  onViewDetails?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

type SortField = 'title' | 'status' | 'priority' | 'deadline';
type SortOrder = 'asc' | 'desc';

export function TaskTable({ tasks, showProjectName = false, onViewDetails, onEdit, onDelete }: TaskTableProps) {
  const [sortField, setSortField] = useState<SortField>('deadline');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'priority': {
        const priorityOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
        break;
      }
      case 'deadline': {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : 0;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : 0;
        comparison = dateA - dateB;
        break;
      }
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'warning';
      case 'TODO': return 'default';
      default: return 'default';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Completed';
      case 'IN_PROGRESS': return 'In Progress';
      case 'TODO': return 'To Do';
      default: return status || 'To Do';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'default';
      default: return 'default';
    }
  };

  const formatPriority = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'High';
      case 'MEDIUM': return 'Medium';
      case 'LOW': return 'Low';
      default: return priority || 'Medium';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center bg-white">
        <CheckCircle2 className="mx-auto h-12 w-12 text-muted/50" />
        <h3 className="mt-4 text-lg font-semibold text-primary">No tasks found</h3>
        <p className="mt-2 text-sm text-muted max-w-sm">
          No tasks match your current criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white shadow-sm overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 border-b border-border text-muted">
          <tr>
            <th 
              className="px-6 py-3 font-medium cursor-pointer hover:text-primary transition-colors select-none"
              onClick={() => handleSort('title')}
            >
              <div className="flex items-center gap-2">
                Task
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            {showProjectName && (
              <th className="px-6 py-3 font-medium hidden sm:table-cell">
                Project
              </th>
            )}
            <th 
              className="px-6 py-3 font-medium cursor-pointer hover:text-primary transition-colors select-none hidden sm:table-cell"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center gap-2">
                Status
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th 
              className="px-6 py-3 font-medium cursor-pointer hover:text-primary transition-colors select-none hidden md:table-cell"
              onClick={() => handleSort('priority')}
            >
              <div className="flex items-center gap-2">
                Priority
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th className="px-6 py-3 font-medium hidden md:table-cell">
              Assignee
            </th>
            <th 
              className="px-6 py-3 font-medium cursor-pointer hover:text-primary transition-colors select-none hidden lg:table-cell"
              onClick={() => handleSort('deadline')}
            >
              <div className="flex items-center gap-2">
                Deadline
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th className="px-6 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedTasks.map((task) => (
            <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-6 py-4">
                <p className="font-medium text-primary">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-muted mt-1 truncate max-w-xs">{task.description}</p>
                )}
                {/* Mobile view metadata */}
                <div className="flex sm:hidden gap-2 mt-2">
                  <Badge variant={getStatusVariant(task.status) as any} className="text-[10px]">
                    {formatStatus(task.status)}
                  </Badge>
                  <Badge variant={getPriorityVariant(task.priority) as any} className="text-[10px]">
                    {formatPriority(task.priority)}
                  </Badge>
                </div>
              </td>
              {showProjectName && (
                <td className="px-6 py-4 hidden sm:table-cell text-muted">
                  {task.project_name || `Project ${task.project_id}`}
                </td>
              )}
              <td className="px-6 py-4 hidden sm:table-cell">
                <Badge variant={getStatusVariant(task.status) as any}>
                  {formatStatus(task.status)}
                </Badge>
              </td>
              <td className="px-6 py-4 hidden md:table-cell">
                <Badge variant={getPriorityVariant(task.priority) as any}>
                  {formatPriority(task.priority)}
                </Badge>
              </td>
              <td className="px-6 py-4 hidden md:table-cell text-muted">
                {task.assignee_name || task.assignee_email || (task.assignee_id ? `User ${task.assignee_id}` : 'Unassigned')}
              </td>
              <td className="px-6 py-4 hidden lg:table-cell text-muted">
                {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
              </td>
              <td className="px-6 py-4 text-right">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content align="end" className="z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-white p-1 shadow-md">
                      <DropdownMenu.Item 
                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-slate-100"
                        onClick={() => onViewDetails && onViewDetails(task)}
                      >
                        View Details
                      </DropdownMenu.Item>
                      {onEdit && (
                        <DropdownMenu.Item 
                          className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-slate-100"
                          onClick={() => onEdit(task)}
                        >
                          Edit Task
                        </DropdownMenu.Item>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />
                          <DropdownMenu.Item 
                            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-error outline-none transition-colors focus:bg-error/10"
                            onClick={() => onDelete(task)}
                          >
                            Delete
                          </DropdownMenu.Item>
                        </>
                      )}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
