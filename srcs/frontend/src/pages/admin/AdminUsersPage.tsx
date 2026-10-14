import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Shield, 
  Trash2, 
  UserCheck, 
  UserX, 
  AlertCircle,
  X,
  UserPlus
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { useAdminUserStore } from '@/stores/adminUserStore';
import type { UserRole } from '@/types/user';

export default function AdminUsersPage() {
  const { 
    users, 
    isLoading, 
    error, 
    fetchUsers, 
    updateUserRole, 
    toggleUserStatus, 
    deleteUser, 
    inviteUser 
  } = useAdminUserStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Form state for inviting new user
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'USER' as UserRole,
    password: '',
  });

  // Fetch users on initial mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users by search term
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const displayName = (user.name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    return fullName.includes(query) || displayName.includes(query) || email.includes(query);
  });

  // Action handlers
  const handleRoleToggle = async (userId: string | number, currentRole: UserRole) => {
    const newRole: UserRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await updateUserRole(userId, newRole);
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleStatusToggle = async (userId: string | number, currentActive: boolean) => {
    try {
      await toggleUserStatus(userId, !currentActive);
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDelete = async (userId: string | number, name: string) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
      try {
        await deleteUser(userId);
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.first_name || !formData.last_name) {
      setInviteError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setInviteError(null);
    try {
      await inviteUser({
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        password: formData.password || undefined,
      });

      // Reset & close
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        role: 'USER',
        password: '',
      });
      setIsInviteOpen(false);
    } catch (err: any) {
      setInviteError(err.message || 'Failed to invite user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h2>
          <p className="text-muted-foreground mt-1">Manage platform users, roles, and access permissions.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsInviteOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => fetchUsers()}>
            Retry
          </Button>
        </div>
      )}

      {/* Users Card & Table */}
      <Card>
        <CardHeader className="border-b bg-slate-50/50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-medium">
              All Users {!isLoading && <span className="text-sm font-normal text-slate-500">({users.length})</span>}
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && users.length === 0 ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-5 w-16 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Skeleton className="h-8 w-8 rounded ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      {searchTerm ? 'No users found matching your search.' : 'No users registered yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const displayName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || user.email.split('@')[0];
                    const avatarLetter = (displayName.charAt(0) || user.email.charAt(0)).toUpperCase();
                    const isAdmin = user.role === 'ADMIN';
                    const isActive = user.is_active;

                    return (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={user.avatar} fallback={avatarLetter} size="sm" />
                            <div>
                              <div className="font-medium text-slate-900">{displayName}</div>
                              <div className="text-xs text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {isAdmin && <Shield className="h-3.5 w-3.5 text-purple-600" />}
                            <span className={`font-medium ${isAdmin ? 'text-purple-700 font-semibold' : 'text-slate-700'}`}>
                              {isAdmin ? 'Admin' : 'User'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={isActive ? 'success' : 'default'} className="text-xs">
                            {isActive ? 'ACTIVE' : 'INACTIVE'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content align="end" className="z-50 min-w-[170px] rounded-md border border-border bg-white p-1 shadow-md animate-in fade-in-80">
                                {/* Toggle Role */}
                                <DropdownMenu.Item 
                                  onClick={() => handleRoleToggle(user.id, user.role)}
                                  className="flex cursor-pointer items-center rounded-sm px-2 py-2 text-sm outline-none focus:bg-slate-100"
                                >
                                  <Shield className="mr-2 h-4 w-4 text-purple-600" />
                                  {isAdmin ? 'Demote to User' : 'Promote to Admin'}
                                </DropdownMenu.Item>

                                {/* Toggle Active Status */}
                                <DropdownMenu.Item 
                                  onClick={() => handleStatusToggle(user.id, isActive)}
                                  className="flex cursor-pointer items-center rounded-sm px-2 py-2 text-sm outline-none focus:bg-slate-100"
                                >
                                  {isActive ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4 text-amber-600" />
                                      Deactivate User
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4 text-emerald-600" />
                                      Activate User
                                    </>
                                  )}
                                </DropdownMenu.Item>

                                <DropdownMenu.Separator className="my-1 h-px bg-border" />

                                {/* Delete User */}
                                <DropdownMenu.Item 
                                  onClick={() => handleDelete(user.id, displayName)}
                                  className="flex cursor-pointer items-center rounded-sm px-2 py-2 text-sm text-red-600 outline-none focus:bg-red-50"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invite User Dialog Modal */}
      <Dialog.Root open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-white p-6 shadow-lg duration-200 sm:rounded-lg">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary/10 text-secondary">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <Dialog.Title className="text-lg font-semibold text-slate-900">
                    Invite User
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-slate-500">
                    Add a new user to the platform.
                  </Dialog.Description>
                </div>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {inviteError && (
              <div className="rounded-md bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Email Address *</label>
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">First Name *</label>
                  <Input
                    placeholder="John"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Last Name *</label>
                  <Input
                    placeholder="Doe"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Role</label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                >
                  <option value="USER">User (Standard Access)</option>
                  <option value="ADMIN">Administrator (Full Access)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Temporary Password <span className="text-slate-400 font-normal">(Optional, defaults to ChangeMe123!)</span>
                </label>
                <Input
                  type="password"
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsInviteOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Inviting...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
